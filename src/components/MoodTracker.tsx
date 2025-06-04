import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<"very_happy" | "happy" | "neutral" | "sad" | "very_sad" | null>(null);
  const [notes, setNotes] = useState("");
  const [showToCaregiver, setShowToCaregiver] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const recordMood = useMutation(api.mood.recordMood);
  const moodHistory = useQuery(api.mood.getMoodHistory, { days: 7 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsLoading(true);
    try {
      await recordMood({
        mood: selectedMood,
        notes: notes || undefined,
        showToCaregiver,
      });

      toast.success("Mood recorded! Thank you for sharing 💙");
      
      // Reset form
      setSelectedMood(null);
      setNotes("");
      setShowToCaregiver(true);
    } catch (error) {
      toast.error("Failed to record mood");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const moodOptions = [
    { value: "very_happy", icon: "😄", label: "Very Happy", color: "bg-green-100 border-green-300 text-green-800" },
    { value: "happy", icon: "😊", label: "Happy", color: "bg-green-50 border-green-200 text-green-700" },
    { value: "neutral", icon: "😐", label: "Neutral", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { value: "sad", icon: "😔", label: "Sad", color: "bg-orange-50 border-orange-200 text-orange-700" },
    { value: "very_sad", icon: "😢", label: "Very Sad", color: "bg-red-50 border-red-200 text-red-700" },
  ];

  const getMoodIcon = (mood: string) => {
    const option = moodOptions.find(m => m.value === mood);
    return option ? option.icon : "😐";
  };

  const getMoodLabel = (mood: string) => {
    const option = moodOptions.find(m => m.value === mood);
    return option ? option.label : "Neutral";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today? 💭</h2>
        <p className="text-gray-600">
          Tracking your mood helps you and your caregiver understand your well-being
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select your current mood:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedMood(option.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMood === option.value
                      ? option.color
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind? (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Share what's making you feel this way..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="shareWithCaregiver"
              checked={showToCaregiver}
              onChange={(e) => setShowToCaregiver(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="shareWithCaregiver" className="ml-2 text-sm font-medium text-gray-700">
              Share this mood entry with my caregiver
            </label>
          </div>

          <button
            type="submit"
            disabled={!selectedMood || isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Recording Mood..." : "Record My Mood"}
          </button>
        </form>
      </div>

      {moodHistory && moodHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Mood History</h3>
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getMoodIcon(entry.mood)}</span>
                  <div>
                    <div className="font-medium text-gray-800">{getMoodLabel(entry.mood)}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.timestamp).toLocaleDateString()} at{" "}
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-700 mt-1">"{entry.notes}"</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {entry.showToCaregiver ? "👁️ Shared" : "🔒 Private"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
