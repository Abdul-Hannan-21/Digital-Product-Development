import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("patient"), v.literal("caregiver")),
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    caregiverId: v.optional(v.id("profiles")),
    patientIds: v.optional(v.array(v.id("profiles"))),
  }).index("by_user", ["userId"]),

  connections: defineTable({
    caregiverId: v.id("profiles"),
    patientId: v.id("profiles"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    createdAt: v.number(),
  })
    .index("by_caregiver", ["caregiverId"])
    .index("by_patient", ["patientId"]),

  reminders: defineTable({
    patientId: v.id("profiles"),
    caregiverId: v.optional(v.id("profiles")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("medication"), v.literal("appointment"), v.literal("personal"), v.literal("general"), v.literal("task"), v.literal("meal")),
    scheduledTime: v.string(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    isActive: v.boolean(),
    isRecurring: v.optional(v.boolean()),
    recurringPattern: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    isPersonal: v.optional(v.boolean()),
    showToCaregiver: v.optional(v.boolean()),
    mood: v.optional(v.union(v.literal("very_happy"), v.literal("happy"), v.literal("neutral"), v.literal("sad"), v.literal("very_sad"))),
    createdAt: v.optional(v.number()),
  })
    .index("by_patient", ["patientId"])
    .index("by_caregiver", ["caregiverId"])
    .index("by_scheduled_time", ["scheduledTime"]),

  gameScores: defineTable({
    patientId: v.id("profiles"),
    gameId: v.string(),
    score: v.number(),
    maxScore: v.number(),
    percentage: v.optional(v.number()),
    timeSpent: v.number(),
    difficulty: v.string(),
    completedAt: v.number(),
  }).index("by_patient", ["patientId"]),

  moodEntries: defineTable({
    patientId: v.id("profiles"),
    mood: v.union(v.literal("very_happy"), v.literal("happy"), v.literal("neutral"), v.literal("sad"), v.literal("very_sad")),
    notes: v.optional(v.string()),
    timestamp: v.number(),
    showToCaregiver: v.boolean(),
  })
    .index("by_patient", ["patientId"])
    .index("by_patient_and_date", ["patientId", "timestamp"]),

  chatMessages: defineTable({
    patientId: v.id("profiles"),
    message: v.string(),
    response: v.string(),
    category: v.string(),
    timestamp: v.number(),
  }).index("by_patient", ["patientId"]),

  notifications: defineTable({
    recipientId: v.id("profiles"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isRead: v.boolean(),
    createdAt: v.number(),
    relatedId: v.optional(v.string()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_and_read", ["recipientId", "isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
