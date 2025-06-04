import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyConnections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return [];

    if (profile.role === "caregiver") {
      const connections = await ctx.db
        .query("connections")
        .withIndex("by_caregiver", (q) => q.eq("caregiverId", profile._id))
        .collect();

      const patients = [];
      for (const connection of connections) {
        const patient = await ctx.db.get(connection.patientId);
        if (patient) {
          patients.push({
            ...patient,
            connectionStatus: connection.status,
          });
        }
      }
      return patients;
    } else {
      return [];
    }
  },
});

export const addPatientToCaregiver = mutation({
  args: {
    patientId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const caregiverProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!caregiverProfile || caregiverProfile.role !== "caregiver") {
      throw new Error("Only caregivers can add patients");
    }

    await ctx.db.insert("connections", {
      caregiverId: caregiverProfile._id,
      patientId: args.patientId,
      status: "accepted",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
