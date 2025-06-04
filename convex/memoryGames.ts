import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAvailableGames = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "patient") return [];

    return [
      {
        _id: "face_name_easy",
        name: "Face-Name Matching",
        description: "Remember faces and match them with names. Great for social memory!",
        difficulty: "easy",
        estimatedTime: "5 minutes",
        icon: "👥",
        benefits: ["Improves face recognition", "Enhances social memory", "Builds confidence"]
      },
      {
        _id: "face_name_medium",
        name: "Face-Name Challenge",
        description: "More faces to remember - perfect for building stronger memory skills!",
        difficulty: "medium",
        estimatedTime: "7 minutes",
        icon: "👥",
        benefits: ["Advanced face recognition", "Stronger memory retention", "Better focus"]
      },
      {
        _id: "face_name_hard",
        name: "Face-Name Expert",
        description: "The ultimate face-name challenge for memory champions!",
        difficulty: "hard",
        estimatedTime: "10 minutes",
        icon: "👥",
        benefits: ["Expert-level recognition", "Maximum memory workout", "Peak performance"]
      },
      {
        _id: "word_recall_easy",
        name: "Word Recall Starter",
        description: "Remember simple words to boost your vocabulary memory!",
        difficulty: "easy",
        estimatedTime: "3 minutes",
        icon: "📝",
        benefits: ["Vocabulary retention", "Short-term memory", "Language skills"]
      },
      {
        _id: "word_recall_medium",
        name: "Word Recall Builder",
        description: "Challenge yourself with more complex words and patterns!",
        difficulty: "medium",
        estimatedTime: "5 minutes",
        icon: "📝",
        benefits: ["Complex word patterns", "Enhanced recall", "Cognitive flexibility"]
      },
      {
        _id: "word_recall_hard",
        name: "Word Recall Master",
        description: "Master-level word challenges for the sharpest minds!",
        difficulty: "hard",
        estimatedTime: "8 minutes",
        icon: "📝",
        benefits: ["Advanced vocabulary", "Superior memory", "Mental agility"]
      }
    ];
  },
});

export const saveGameScore = mutation({
  args: {
    gameId: v.string(),
    score: v.number(),
    maxScore: v.number(),
    timeSpent: v.number(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "patient") {
      throw new Error("Only patients can save game scores");
    }

    const percentage = Math.round((args.score / args.maxScore) * 100);

    await ctx.db.insert("gameScores", {
      patientId: profile._id,
      gameId: args.gameId,
      score: args.score,
      maxScore: args.maxScore,
      percentage,
      timeSpent: args.timeSpent,
      difficulty: args.difficulty,
      completedAt: Date.now(),
    });

    return { percentage };
  },
});

export const getGameStats = query({
  args: { 
    patientId: v.id("profiles"), 
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const days = args.days || 7;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
      .collect();

    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + (score.percentage || 0), 0) / scores.length)
      : 0;

    const recentScores = scores
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 10)
      .map(score => ({
        date: new Date(score.completedAt).toLocaleDateString(),
        score: score.score,
        maxScore: score.maxScore,
        percentage: score.percentage || 0,
        difficulty: score.difficulty,
        gameId: score.gameId
      }));

    return {
      gamesPlayed: scores.length,
      averageScore,
      recentScores,
      totalTimeSpent: scores.reduce((sum, score) => sum + score.timeSpent, 0),
    };
  },
});

export const getMotivationalContent = query({
  args: {
    score: v.number(),
    maxScore: v.number(),
    gameType: v.string(),
  },
  handler: async (ctx, args) => {
    const percentage = Math.round((args.score / args.maxScore) * 100);
    
    const motivationalMessages = {
      excellent: [
        "Outstanding work! Your memory is sharp and strong today! 🌟",
        "Incredible performance! You're showing amazing mental agility! 💪",
        "Fantastic job! Your dedication to brain health is truly inspiring! ✨",
        "Brilliant! You're proving that consistent practice makes perfect! 🎯",
        "Exceptional work! Your cognitive skills are in excellent shape! 🧠"
      ],
      good: [
        "Great job! You're making wonderful progress with your memory training! 👏",
        "Well done! Every game you play strengthens your mind! 💪",
        "Nice work! You're building stronger neural pathways with each attempt! 🌱",
        "Good effort! Your persistence is paying off beautifully! 🌟",
        "Solid performance! You're on the right track to better memory health! 📈"
      ],
      encouraging: [
        "You're doing great! Remember, every attempt helps strengthen your memory! 💙",
        "Keep going! Your brain is getting a wonderful workout today! 🧠",
        "Nice try! Each game session is a step forward in your memory journey! 🚶‍♀️",
        "You're making progress! Consistency is more important than perfection! 🌈",
        "Well attempted! Your effort and dedication are what truly matter! ❤️"
      ]
    };

    const inspirationalQuotes = [
      "The mind is everything. What you think you become. - Buddha",
      "Memory is the treasury and guardian of all things. - Cicero",
      "The brain is like a muscle. When it is in use we feel very good. - Carl Sagan",
      "Learning never exhausts the mind. - Leonardo da Vinci",
      "The capacity to learn is a gift; the ability to learn is a skill. - Brian Herbert",
      "Memory is the diary that we all carry about with us. - Oscar Wilde",
      "A good memory is one trained to forget the trivial. - Clifton Fadiman",
      "The true art of memory is the art of attention. - Samuel Johnson",
      "Your brain is designed to learn throughout your entire life. - Neuroplasticity Research",
      "Every expert was once a beginner. Every pro was once an amateur. - Robin Sharma"
    ];

    const memoryTips = {
      face_name: [
        "Try associating names with distinctive facial features - it creates stronger memory links!",
        "Practice the 'name repetition' technique: say the person's name 3 times when you meet them.",
        "Create mental stories connecting the person's name to their appearance or personality.",
        "Focus on one facial feature at a time - eyes, smile, or hair - to build detailed memories.",
        "Use the 'chunking' method: break complex names into smaller, memorable parts."
      ],
      word_recall: [
        "Create vivid mental images for each word - the more unusual, the more memorable!",
        "Try the 'story method': connect words together in a silly or dramatic story.",
        "Use the 'first letter' technique: create acronyms from the first letters of words.",
        "Practice 'spaced repetition': review words at increasing intervals for better retention.",
        "Associate new words with familiar concepts or personal experiences."
      ],
      general: [
        "Stay hydrated! Your brain needs water to function at its best.",
        "Get quality sleep - it's when your brain consolidates memories.",
        "Regular exercise increases blood flow to the brain and improves memory.",
        "Practice mindfulness - it enhances focus and attention to detail.",
        "Challenge yourself daily with puzzles, reading, or learning new skills."
      ]
    };

    let messageCategory: "excellent" | "good" | "encouraging";
    if (percentage >= 80) messageCategory = "excellent";
    else if (percentage >= 60) messageCategory = "good";
    else messageCategory = "encouraging";

    const randomMessage = motivationalMessages[messageCategory][
      Math.floor(Math.random() * motivationalMessages[messageCategory].length)
    ];

    const randomQuote = inspirationalQuotes[
      Math.floor(Math.random() * inspirationalQuotes.length)
    ];

    const tipCategory = args.gameType === "face_name" ? "face_name" : 
                       args.gameType === "word_recall" ? "word_recall" : "general";
    
    const randomTip = memoryTips[tipCategory][
      Math.floor(Math.random() * memoryTips[tipCategory].length)
    ];

    return {
      message: randomMessage,
      quote: randomQuote,
      tip: randomTip,
      percentage,
      encouragement: percentage >= 80 ? "Keep up the excellent work!" :
                    percentage >= 60 ? "You're doing great - keep practicing!" :
                    "Every attempt makes you stronger - don't give up!"
    };
  },
});

export const getRecentActivity = query({
  args: { patientId: v.id("profiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const recentScores = await ctx.db
      .query("gameScores")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(5);

    return recentScores.map(score => ({
      ...score,
      date: new Date(score.completedAt).toLocaleDateString(),
      time: new Date(score.completedAt).toLocaleTimeString(),
    }));
  },
});
