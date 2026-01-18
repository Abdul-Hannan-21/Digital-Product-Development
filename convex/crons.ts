import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Check for missed reminders and send notifications
export const checkMissedReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Get all missed reminders from the last hour
    const missedReminders = await ctx.runQuery(internal.crons.getMissedReminders, {
      startTime: oneHourAgo,
      endTime: now
    });

    for (const reminder of missedReminders) {
      // Create notification for caregiver if reminder has one
      if (reminder.caregiverId) {
        await ctx.runMutation(internal.notifications.createNotification, {
          recipientId: reminder.caregiverId,
          type: "missed_reminder",
          title: "Missed Reminder Alert",
          message: `Patient missed: ${reminder.title}`,
          priority: "high" as const,
          relatedId: reminder._id,
        });
      }
    }
  },
});

// Check for patients who haven't played games recently
export const checkGameActivity = internalAction({
  args: {},
  handler: async (ctx) => {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

    const inactivePatients = await ctx.runQuery(internal.crons.getInactiveGamePatients, {
      cutoffTime: threeDaysAgo
    });

    for (const patient of inactivePatients) {
      // Find caregivers for this patient
      const caregivers = await ctx.runQuery(internal.crons.getPatientCaregivers, {
        patientId: patient._id
      });

      for (const caregiver of caregivers) {
        await ctx.runMutation(internal.notifications.createNotification, {
          recipientId: caregiver._id,
          type: "game_inactivity",
          title: "Memory Game Reminder",
          message: `${patient.name} hasn't played memory games in 3 days`,
          priority: "medium" as const,
          relatedId: patient._id,
        });
      }
    }
  },
});

export const getMissedReminders = internalQuery({
  args: { startTime: v.number(), endTime: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledTime"), new Date(args.startTime).toISOString()),
          q.lt(q.field("scheduledTime"), new Date(args.endTime).toISOString()),
          q.eq(q.field("isCompleted"), false),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

export const getInactiveGamePatients = internalQuery({
  args: { cutoffTime: v.number() },
  handler: async (ctx, args) => {
    const allPatients = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("role"), "patient"))
      .collect();

    const inactivePatients = [];

    for (const patient of allPatients) {
      const recentGames = await ctx.db
        .query("gameScores")
        .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
        .filter((q) => q.gte(q.field("completedAt"), args.cutoffTime))
        .collect();

      if (recentGames.length === 0) {
        inactivePatients.push(patient);
      }
    }

    return inactivePatients;
  },
});

export const getPatientCaregivers = internalQuery({
  args: { patientId: v.id("profiles") },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const caregivers = [];
    for (const connection of connections) {
      const caregiver = await ctx.db.get(connection.caregiverId);
      if (caregiver) {
        caregivers.push(caregiver);
      }
    }

    return caregivers;
  },
});

const crons = cronJobs();

// Check for missed reminders every hour
crons.interval("check missed reminders", { hours: 1 }, internal.crons.checkMissedReminders, {});

// Check for game inactivity every 6 hours
crons.interval("check game activity", { hours: 6 }, internal.crons.checkGameActivity, {});

export default crons;
