import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTodaysReminders = query({
  args: { patientId: v.optional(v.id("profiles")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let targetPatientId = args.patientId;

    // If no patientId provided, get current user's profile
    if (!targetPatientId) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();
      
      if (!profile || profile.role !== "patient") return [];
      targetPatientId = profile._id;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", targetPatientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledTime"), startOfDay.toISOString()),
          q.lt(q.field("scheduledTime"), endOfDay.toISOString()),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    return reminders.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  },
});

export const getVisibleReminders = query({
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

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledTime"), startOfDay.toISOString()),
          q.lt(q.field("scheduledTime"), endOfDay.toISOString()),
          q.eq(q.field("isActive"), true),
          q.or(
            q.eq(q.field("isPersonal"), false),
            q.and(
              q.eq(q.field("isPersonal"), true),
              q.eq(q.field("showToCaregiver"), true)
            )
          )
        )
      )
      .collect();

    return reminders.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  },
});

export const createReminder = mutation({
  args: {
    patientId: v.id("profiles"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("medication"),
      v.literal("appointment"),
      v.literal("task"),
      v.literal("meal")
    ),
    scheduledTime: v.string(),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const caregiverProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!caregiverProfile || caregiverProfile.role !== "caregiver") {
      throw new Error("Only caregivers can create reminders");
    }

    return await ctx.db.insert("reminders", {
      patientId: args.patientId,
      caregiverId: caregiverProfile._id,
      title: args.title,
      description: args.description,
      type: args.type,
      scheduledTime: args.scheduledTime,
      isRecurring: args.isRecurring,
      recurringPattern: args.recurringPattern,
      isCompleted: false,
      isActive: true,
      isPersonal: false,
      showToCaregiver: true,
      createdAt: Date.now(),
    });
  },
});

export const createPersonalReminder = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledTime: v.string(),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    showToCaregiver: v.boolean(),
    mood: v.optional(v.union(
      v.literal("very_happy"),
      v.literal("happy"),
      v.literal("neutral"),
      v.literal("sad"),
      v.literal("very_sad")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "patient") {
      throw new Error("Only patients can create personal reminders");
    }

    return await ctx.db.insert("reminders", {
      patientId: profile._id,
      title: args.title,
      description: args.description,
      type: "personal",
      scheduledTime: args.scheduledTime,
      isRecurring: args.isRecurring,
      recurringPattern: args.recurringPattern,
      isCompleted: false,
      isActive: true,
      isPersonal: true,
      showToCaregiver: args.showToCaregiver,
      mood: args.mood,
      createdAt: Date.now(),
    });
  },
});

export const completeReminder = mutation({
  args: { 
    reminderId: v.id("reminders"),
    mood: v.optional(v.union(
      v.literal("very_happy"),
      v.literal("happy"),
      v.literal("neutral"),
      v.literal("sad"),
      v.literal("very_sad")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("Reminder not found");

    await ctx.db.patch(args.reminderId, {
      isCompleted: true,
      completedAt: Date.now(),
      mood: args.mood,
    });

    return reminder;
  },
});

export const getReminderStats = query({
  args: { patientId: v.id("profiles"), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledTime"), startDate.toISOString()),
          q.lte(q.field("scheduledTime"), endDate.toISOString()),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    const total = reminders.length;
    const completed = reminders.filter(r => r.isCompleted).length;
    const missed = total - completed;

    return {
      total,
      completed,
      missed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
});
