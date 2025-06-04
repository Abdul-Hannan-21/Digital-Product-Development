import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const recordMood = mutation({
  args: {
    mood: v.union(
      v.literal("very_happy"),
      v.literal("happy"),
      v.literal("neutral"),
      v.literal("sad"),
      v.literal("very_sad")
    ),
    notes: v.optional(v.string()),
    showToCaregiver: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "patient") {
      throw new Error("Only patients can record mood");
    }

    return await ctx.db.insert("moodEntries", {
      patientId: profile._id,
      mood: args.mood,
      notes: args.notes,
      timestamp: Date.now(),
      showToCaregiver: args.showToCaregiver,
    });
  },
});

export const getMoodHistory = query({
  args: { 
    patientId: v.optional(v.id("profiles")),
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let targetPatientId = args.patientId;

    if (!targetPatientId) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();
      
      if (!profile || profile.role !== "patient") return [];
      targetPatientId = profile._id;
    }

    const days = args.days || 7;
    const endDate = Date.now();
    const startDate = endDate - (days * 24 * 60 * 60 * 1000);

    const moodEntries = await ctx.db
      .query("moodEntries")
      .withIndex("by_patient_and_date", (q) => q.eq("patientId", targetPatientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("timestamp"), startDate),
          q.lte(q.field("timestamp"), endDate)
        )
      )
      .order("desc")
      .collect();

    return moodEntries;
  },
});

export const getVisibleMoodHistory = query({
  args: { patientId: v.id("profiles"), days: v.optional(v.number()) },
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

    const days = args.days || 7;
    const endDate = Date.now();
    const startDate = endDate - (days * 24 * 60 * 60 * 1000);

    const moodEntries = await ctx.db
      .query("moodEntries")
      .withIndex("by_patient_and_date", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.gte(q.field("timestamp"), startDate),
          q.lte(q.field("timestamp"), endDate),
          q.eq(q.field("showToCaregiver"), true)
        )
      )
      .order("desc")
      .collect();

    return moodEntries;
  },
});
