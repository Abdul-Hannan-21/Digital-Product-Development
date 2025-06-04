import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const processMessage = mutation({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "patient") {
      throw new Error("Only patients can use the chatbot");
    }

    const message = args.message.toLowerCase().trim();
    let response = "";
    let category = "general";

    // Enhanced chatbot responses with personalized care
    if (message.includes("pill") || message.includes("medication") || message.includes("medicine")) {
      const todayReminders = await ctx.db
        .query("reminders")
        .withIndex("by_patient", (q) => q.eq("patientId", profile._id))
        .filter((q) => 
          q.and(
            q.eq(q.field("type"), "medication"),
            q.eq(q.field("isActive"), true)
          )
        )
        .collect();

      const today = new Date().toDateString();
      const todayMeds = todayReminders.filter(r => 
        new Date(r.scheduledTime).toDateString() === today
      );

      if (todayMeds.length === 0) {
        response = "You don't have any medications scheduled for today. Great job staying on top of your health! 💊\n\nRemember: If you feel unwell or have questions about your medications, don't hesitate to contact your doctor or caregiver.";
      } else {
        const completed = todayMeds.filter(r => r.isCompleted);
        const pending = todayMeds.filter(r => !r.isCompleted);
        
        if (pending.length === 0) {
          response = `Wonderful! You've taken all ${completed.length} of your medications today. Keep up the excellent work! ✅\n\nYou're doing such a great job taking care of yourself. Your dedication to your health is truly admirable! 🌟`;
        } else {
          response = `You have ${pending.length} medication${pending.length > 1 ? 's' : ''} left to take today:\n${pending.map(r => `• ${r.title} at ${new Date(r.scheduledTime).toLocaleTimeString()}`).join('\n')}\n\nDon't worry if you're running a bit behind - just take them when you can. Setting a gentle alarm can help remind you! ⏰`;
        }
      }
      category = "reminders";
    }
    else if (message.includes("schedule") || message.includes("today") || message.includes("appointment") || message.includes("what can i do") || message.includes("what should i do")) {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const todayReminders = await ctx.db
        .query("reminders")
        .withIndex("by_patient", (q) => q.eq("patientId", profile._id))
        .filter((q) => 
          q.and(
            q.gte(q.field("scheduledTime"), startOfDay.toISOString()),
            q.lt(q.field("scheduledTime"), endOfDay.toISOString()),
            q.eq(q.field("isActive"), true)
          )
        )
        .collect();

      // Get recent game activity
      const recentGames = await ctx.db
        .query("gameScores")
        .withIndex("by_patient", (q) => q.eq("patientId", profile._id))
        .filter((q) => q.gte(q.field("completedAt"), Date.now() - 24 * 60 * 60 * 1000))
        .collect();

      if (todayReminders.length === 0 && recentGames.length === 0) {
        response = `You have a free day today! 🌟 Here are some wonderful things you could do:\n\n📚 **Memory Activities:**\n• Play our Face-Name Matching game\n• Try the Word Recall Challenge\n• Read a favorite book or magazine\n\n🌱 **Wellness Tips:**\n• Take a gentle walk outside\n• Do some light stretching\n• Call a friend or family member\n• Listen to your favorite music\n\n💭 **Memory Boosters:**\n• Practice deep breathing (great for focus!)\n• Try to remember 3 things you're grateful for\n• Look through old photos\n\nWhat sounds interesting to you today?`;
      } else {
        const upcoming = todayReminders.filter(r => !r.isCompleted);
        let scheduleText = "";
        
        if (upcoming.length === 0 && todayReminders.length > 0) {
          scheduleText = "Amazing! You've completed everything on your schedule for today. You're doing wonderfully! 🎉\n\n";
        } else if (upcoming.length > 0) {
          scheduleText = `Here's what you have coming up today:\n${upcoming.map(r => `• ${r.title} at ${new Date(r.scheduledTime).toLocaleTimeString()}`).join('\n')}\n\n`;
        }

        // Add game suggestions
        if (recentGames.length === 0) {
          scheduleText += `🧠 **Memory Exercise Suggestion:**\nYou haven't played any memory games today! How about trying a quick game? They're fun and great for keeping your mind sharp:\n• Face-Name Matching (5 minutes)\n• Word Recall Challenge (3 minutes)\n\nEven a few minutes can make a difference! 💪`;
        } else {
          scheduleText += `🎮 Great job playing ${recentGames.length} memory game${recentGames.length > 1 ? 's' : ''} today! Your brain is getting a wonderful workout! 🧠✨`;
        }

        response = scheduleText;
      }
      category = "reminders";
    }
    else if (message.includes("game") || message.includes("play") || message.includes("memory") || message.includes("brain")) {
      response = `I'd love to help you exercise your memory! 🧠✨\n\n🎮 **Available Games:**\n• **Face-Name Matching** - Great for remembering people\n• **Word Recall Challenge** - Excellent for vocabulary and memory\n\n💡 **Memory Tips:**\n• Start with easier levels and work your way up\n• Play when you feel most alert (often mornings!)\n• Don't worry about perfect scores - every attempt helps\n• Take breaks if you feel tired\n\n🌟 **Benefits:**\n• Keeps your mind active and engaged\n• Can improve focus and concentration\n• Fun way to challenge yourself\n• Builds confidence\n\nWhich game sounds fun to you today?`;
      category = "games";
    }
    else if (message.includes("help") || message.includes("what can you do") || message.includes("assist")) {
      response = `I'm here to be your caring companion! 💙 Here's how I can help:\n\n💊 **Health & Reminders:**\n• Check your medications ("Did I take my pills?")\n• Review your daily schedule\n• Remind you about appointments\n\n🧠 **Memory & Mind:**\n• Suggest memory games and exercises\n• Provide brain training tips\n• Encourage your progress\n\n💭 **Daily Support:**\n• Answer questions about your day\n• Provide gentle reminders\n• Offer encouragement and motivation\n• Share memory improvement tips\n\n🌟 **Wellness Tips:**\n• Suggest activities for mental stimulation\n• Remind you about self-care\n• Celebrate your achievements\n\nJust ask me things like:\n• "What should I do today?"\n• "Did I take my medicine?"\n• "Can we play a game?"\n• "I need some encouragement"\n\nI'm always here to help! What would you like to know? 😊`;
      category = "general";
    }
    else if (message.includes("thank") || message.includes("thanks")) {
      response = "You're so welcome! I'm always here to help you. You're doing a fantastic job taking care of yourself! 💙\n\nRemember: Every small step you take is progress worth celebrating. You're stronger and more capable than you know! 🌟";
      category = "general";
    }
    else if (message.includes("how are you") || message.includes("hello") || message.includes("hi")) {
      const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";
      response = `Good ${timeOfDay}, ${profile.name}! 😊 I'm doing well and I'm so happy to see you today!\n\nHow are you feeling? Is there anything special you'd like to do today? I'm here to help with:\n• Checking your schedule\n• Playing memory games\n• Answering any questions\n• Just having a friendly chat\n\nWhat sounds good to you? 🌟`;
      category = "general";
    }
    else if (message.includes("tired") || message.includes("exhausted") || message.includes("sleepy")) {
      response = "It sounds like you might be feeling a bit tired. That's completely normal! 😌\n\n💤 **Gentle Suggestions:**\n• Take a short rest if you need it\n• Try some deep breathing exercises\n• Have a glass of water\n• Step outside for fresh air if possible\n\n🌟 **Remember:**\n• It's okay to take breaks\n• Listen to your body\n• Rest is important for memory and health\n• You can always try activities later when you feel more energetic\n\nTake care of yourself - you deserve it! 💙";
      category = "general";
    }
    else if (message.includes("confused") || message.includes("lost") || message.includes("forget") || message.includes("memory")) {
      response = "I understand, and it's okay to feel confused sometimes. You're not alone in this. 💙\n\n🤗 **Gentle Reminders:**\n• These feelings are normal and you're doing your best\n• Take things one step at a time\n• It's okay to ask for help\n• You are loved and cared for\n\n💡 **Helpful Strategies:**\n• Write down important things\n• Use reminders and alarms\n• Keep a routine when possible\n• Practice memory games regularly\n\n🌟 **You Are Amazing:**\n• Every day you try is a victory\n• Your efforts matter\n• You're stronger than you know\n• I'm here to support you\n\nWould you like me to help you with anything specific right now?";
      category = "general";
    }
    else if (message.includes("sad") || message.includes("down") || message.includes("upset")) {
      response = "I'm sorry you're feeling sad. Your feelings are valid and it's okay to have difficult moments. 💙\n\n🌈 **Gentle Comfort:**\n• You are valued and loved\n• This feeling will pass\n• You've overcome challenges before\n• You're not alone in this journey\n\n🌟 **Mood Boosters:**\n• Listen to your favorite music\n• Look at happy photos\n• Call someone who cares about you\n• Try a simple memory game (can be surprisingly uplifting!)\n• Step outside for a few minutes\n\n💭 **Remember:**\n• It's okay to feel sad sometimes\n• You're doing the best you can\n• Small steps count as progress\n• Tomorrow is a new day\n\nIs there anything specific I can help you with right now? 🤗";
      category = "general";
    }
    else {
      response = `I want to help you! 💙 You can ask me about:\n\n💊 **Health & Care:**\n• Your medications ("Did I take my pills?")\n• Your daily schedule ("What should I do today?")\n• Appointments and reminders\n\n🧠 **Memory & Games:**\n• Memory games ("Can we play a game?")\n• Brain training tips\n• Memory improvement strategies\n\n💭 **Daily Support:**\n• General questions about your day\n• Encouragement and motivation\n• Friendly conversation\n\n🌟 **Wellness Tips:**\n• Activities to keep your mind active\n• Self-care reminders\n• Celebrating your achievements\n\nI'm here to support you in whatever way you need. What would you like to talk about? 😊`;
      category = "general";
    }

    // Save the conversation
    await ctx.db.insert("chatMessages", {
      patientId: profile._id,
      message: args.message,
      response,
      timestamp: Date.now(),
      category,
    });

    return { response, category };
  },
});

export const getChatHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "patient") return [];

    const limit = args.limit || 10;
    
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_patient", (q) => q.eq("patientId", profile._id))
      .order("desc")
      .take(limit);
  },
});
