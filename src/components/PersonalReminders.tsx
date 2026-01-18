import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PersonalReminders() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("daily");
  const [showToCaregiver, setShowToCaregiver] = useState(true);
  const [mood, setMood] = useState<"very_happy" | "happy" | "neutral" | "sad" | "very_sad" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPersonalReminder = useMutation(api.reminders.createPersonalReminder);
  const completeReminder = useMutation(api.reminders.completeReminder);
  const personalReminders = useQuery(api.reminders.getTodaysReminders, {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setIsLoading(true);
    try {
      const scheduledTime = new Date(`${date}T${time}`).toISOString();
      
      await createPersonalReminder({
        title,
        description: description || undefined,
        scheduledTime,
        isRecurring,
        recurringPattern: isRecurring ? (recurringPattern as "daily" | "weekly" | "monthly") : undefined,
        showToCaregiver,
        mood: mood || undefined,
      });

      toast.success("Personal reminder created! 🎉");
      
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setIsRecurring(false);
      setRecurringPattern("daily");
      setShowToCaregiver(true);
      setMood(null);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to create reminder");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (moodValue: string) => {
    switch (moodValue) {
      case "very_happy": return "😄";
      case "happy": return "😊";
      case "neutral": return "😐";
      case "sad": return "😔";
      case "very_sad": return "😢";
      default: return "😐";
    }
  };

  const getMoodLabel = (moodValue: string) => {
    switch (moodValue) {
      case "very_happy": return "Very Happy";
      case "happy": return "Happy";
      case "neutral": return "Neutral";
      case "sad": return "Sad";
      case "very_sad": return "Very Sad";
      default: return "Neutral";
    }
  };

  const personalRemindersOnly = personalReminders?.filter(r => r.isPersonal) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">My Personal Reminders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          {showForm ? "Cancel" : "Add Personal Reminder"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Personal Reminder</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to remember? *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                placeholder="e.g., Call my friend, Water the plants"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional notes (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                placeholder="Any extra details..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling right now?
              </label>
              <div className="flex gap-2">
                {[
                  { value: "very_happy", icon: "😄", label: "Very Happy" },
                  { value: "happy", icon: "😊", label: "Happy" },
                  { value: "neutral", icon: "😐", label: "Neutral" },
                  { value: "sad", icon: "😔", label: "Sad" },
                  { value: "very_sad", icon: "😢", label: "Very Sad" },
                ].map((moodOption) => (
                  <button
                    key={moodOption.value}
                    type="button"
                    onClick={() => setMood(moodOption.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      mood === moodOption.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{moodOption.icon}</div>
                    <div className="text-xs">{moodOption.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700">
                  Repeat this reminder
                </label>
              </div>

              {isRecurring && (
                <select
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showToCaregiver"
                  checked={showToCaregiver}
                  onChange={(e) => setShowToCaregiver(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="showToCaregiver" className="ml-2 text-sm font-medium text-gray-700">
                  Share with my caregiver
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!title || !date || !time || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Reminder..." : "Create Personal Reminder"}
            </button>
          </form>
        </div>
      )}

      {personalRemindersOnly.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">Today's Personal Reminders</h3>
          {personalRemindersOnly.map((reminder) => (
            <div
              key={reminder._id}
              className="bg-purple-50 border border-purple-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">📝</span>
                    <div>
                      <h4 className="font-semibold text-lg text-purple-800">{reminder.title}</h4>
                      <p className="text-sm text-purple-600">
                        {new Date(reminder.scheduledTime).toLocaleTimeString()}
                      </p>
                    </div>
                    {reminder.mood && (
                      <div className="ml-4 flex items-center">
                        <span className="text-lg mr-1">{getMoodIcon(reminder.mood)}</span>
                        <span className="text-xs text-purple-600">{getMoodLabel(reminder.mood)}</span>
                      </div>
                    )}
                  </div>
                  {reminder.description && (
                    <p className="text-sm text-purple-700 ml-8">{reminder.description}</p>
                  )}
                  <div className="flex items-center mt-2 ml-8 text-xs text-purple-600">
                    {reminder.showToCaregiver ? (
                      <span>👁️ Visible to caregiver</span>
                    ) : (
                      <span>🔒 Private</span>
                    )}
                  </div>
                </div>
                {!reminder.isCompleted && (
                  <button
                    onClick={() => {
                      void (async () => {
                        try {
                          await completeReminder({ reminderId: reminder._id });
                          toast.success("Reminder completed! 🎉");
                        } catch {
                          toast.error("Failed to complete reminder");
                        }
                      })();
                    }}
                    className="bg-white hover:bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border border-purple-300 font-medium transition-all text-sm"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
