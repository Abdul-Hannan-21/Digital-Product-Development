import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getPatientProgressData = query({
  args: { 
    patientId: v.id("profiles"), 
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const caregiverProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!caregiverProfile || caregiverProfile.role !== "caregiver") {
      return null;
    }

    const days = args.days || 7;
    const endDate = Date.now();
    const startDate = endDate - (days * 24 * 60 * 60 * 1000);

    // Get daily reminder completion rates
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledTime"), new Date(startDate).toISOString()),
          q.lte(q.field("scheduledTime"), new Date(endDate).toISOString()),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    // Get daily game scores
    const gameScores = await ctx.db
      .query("gameScores")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("completedAt"), startDate),
          q.lte(q.field("completedAt"), endDate)
        )
      )
      .collect();

    // Process data by day
    const dailyData: Record<string, { reminders: any[], games: any[] }> = {};
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { reminders: [], games: [] };
    }

    // Group reminders by day
    reminders.forEach(reminder => {
      const dateKey = new Date(reminder.scheduledTime).toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].reminders.push(reminder);
      }
    });

    // Group games by day
    gameScores.forEach(score => {
      const dateKey = new Date(score.completedAt).toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].games.push(score);
      }
    });

    // Calculate trends
    const reminderTrend = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const total = data.reminders.length;
        const completed = data.reminders.filter(r => r.isCompleted).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: completionRate
        };
      });

    const gameScoreTrend = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const avgScore = data.games.length > 0 
          ? Math.round(data.games.reduce((sum, game) => sum + (game.score / game.maxScore * 100), 0) / data.games.length)
          : 0;
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: avgScore
        };
      });

    return {
      reminderTrend,
      gameScoreTrend,
    };
  },
});

export const getPatientNotifications = query({
  args: { patientId: v.id("profiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const caregiverProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!caregiverProfile || caregiverProfile.role !== "caregiver") {
      return [];
    }

    const notifications = [];
    const now = Date.now();
    const _oneDayAgo = now - (24 * 60 * 60 * 1000);
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);

    // Check for missed reminders
    const recentReminders = await ctx.db
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledTime"), new Date(threeDaysAgo).toISOString()),
          q.lt(q.field("scheduledTime"), new Date(now).toISOString()),
          q.eq(q.field("isActive"), true),
          q.eq(q.field("isCompleted"), false)
        )
      )
      .collect();

    if (recentReminders.length > 0) {
      notifications.push({
        type: "missed_reminders",
        priority: "high",
        message: `${recentReminders.length} missed reminder${recentReminders.length > 1 ? 's' : ''} in the last 3 days`,
        timestamp: now,
      });
    }

    // Check for lack of game activity
    const recentGames = await ctx.db
      .query("gameScores")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.gte(q.field("completedAt"), threeDaysAgo))
      .collect();

    if (recentGames.length === 0) {
      notifications.push({
        type: "no_games",
        priority: "medium",
        message: "No memory games played in the last 3 days",
        timestamp: now,
      });
    }

    // Check for concerning mood patterns
    const recentMoods = await ctx.db
      .query("moodEntries")
      .withIndex("by_patient_and_date", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("timestamp"), threeDaysAgo),
          q.eq(q.field("showToCaregiver"), true)
        )
      )
      .collect();

    const sadMoods = recentMoods.filter(m => m.mood === "sad" || m.mood === "very_sad");
    if (sadMoods.length > recentMoods.length / 2 && recentMoods.length > 0) {
      notifications.push({
        type: "mood_concern",
        priority: "high",
        message: "Recent mood entries show concern - consider additional support",
        timestamp: now,
      });
    }

    return notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  },
});
