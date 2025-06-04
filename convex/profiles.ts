import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const createProfile = mutation({
  args: {
    role: v.union(v.literal("patient"), v.literal("caregiver")),
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      userId,
      role: args.role,
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      emergencyContact: args.emergencyContact,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (args.emergencyContact !== undefined) updates.emergencyContact = args.emergencyContact;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

export const getPatientsByCaregiver = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const caregiverProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!caregiverProfile || caregiverProfile.role !== "caregiver") {
      return [];
    }

    // Use connections table instead
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_caregiver", (q) => q.eq("caregiverId", caregiverProfile._id))
      .collect();

    const patients = [];
    for (const connection of connections) {
      const patient = await ctx.db.get(connection.patientId);
      if (patient) {
        patients.push(patient);
      }
    }
    return patients;
  },
});

export const getAllPatients = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const caregiverProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!caregiverProfile || caregiverProfile.role !== "caregiver") {
      return [];
    }

    return await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("role"), "patient"))
      .collect();
  },
});

export const getCaregiverForPatient = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const patientProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!patientProfile || patientProfile.role !== "patient") {
      return null;
    }

    // Use connections table instead
    const connection = await ctx.db
      .query("connections")
      .withIndex("by_patient", (q) => q.eq("patientId", patientProfile._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    if (!connection) return null;

    return await ctx.db.get(connection.caregiverId);
  },
});
