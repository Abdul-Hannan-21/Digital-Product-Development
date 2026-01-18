import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MemoryGames } from "./MemoryGames";
import { Chatbot } from "./Chatbot";
import { TodaysReminders } from "./TodaysReminders";
import { PersonalReminders } from "./PersonalReminders";
import { MoodTracker } from "./MoodTracker";

export function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<"reminders" | "personal" | "mood" | "games" | "chat">("reminders");
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (!profile) return null;

  const tabs = [
    { id: "reminders", label: "Schedule", icon: "📅" },
    { id: "personal", label: "My Reminders", icon: "📝" },
    { id: "mood", label: "Mood Tracker", icon: "💭" },
    { id: "games", label: "Memory Games", icon: "🧠" },
    { id: "chat", label: "Ask Helper", icon: "💬" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {profile.name}! 👋
          </h1>
          <p className="text-blue-100">
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-4 py-4 text-center font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "reminders" && <TodaysReminders />}
          {activeTab === "personal" && <PersonalReminders />}
          {activeTab === "mood" && <MoodTracker />}
          {activeTab === "games" && <MemoryGames />}
          {activeTab === "chat" && <Chatbot />}
        </div>
      </div>
    </div>
  );
}
