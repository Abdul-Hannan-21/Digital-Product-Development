import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function TodaysReminders() {
  const reminders = useQuery(api.reminders.getTodaysReminders, {});
  const completeReminder = useMutation(api.reminders.completeReminder);

  const handleComplete = async (reminderId: string) => {
    try {
      await completeReminder({ reminderId: reminderId as any });
      toast.success("Great job! Reminder completed! 🎉");
    } catch (error) {
      toast.error("Failed to mark reminder as complete");
    }
  };

  if (!reminders) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌟</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          You have a free day today!
        </h3>
        <p className="text-gray-600">
          No scheduled reminders. Enjoy your relaxing day!
        </p>
      </div>
    );
  }

  const completed = reminders.filter(r => r.isCompleted);
  const pending = reminders.filter(r => !r.isCompleted);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medication": return "💊";
      case "appointment": return "🏥";
      case "meal": return "🍽️";
      case "task": return "✅";
      default: return "📝";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medication": return "bg-red-50 border-red-200 text-red-700";
      case "appointment": return "bg-blue-50 border-blue-200 text-blue-700";
      case "meal": return "bg-orange-50 border-orange-200 text-orange-700";
      case "task": return "bg-green-50 border-green-200 text-green-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Today's Schedule</h2>
        <div className="text-sm text-gray-600">
          {completed.length} of {reminders.length} completed
        </div>
      </div>

      {completed.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2 flex items-center">
            <span className="mr-2">✅</span>
            Completed ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((reminder) => (
              <div key={reminder._id} className="flex items-center text-green-700 text-sm">
                <span className="mr-2">{getTypeIcon(reminder.type)}</span>
                <span className="line-through">{reminder.title}</span>
                <span className="ml-auto text-xs">
                  {new Date(reminder.scheduledTime).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center">
            <span className="mr-2">⏰</span>
            Coming Up ({pending.length})
          </h3>
          {pending.map((reminder) => (
            <div
              key={reminder._id}
              className={`border-2 rounded-lg p-4 transition-all ${getTypeColor(reminder.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">{getTypeIcon(reminder.type)}</span>
                    <div>
                      <h4 className="font-semibold text-lg">{reminder.title}</h4>
                      <p className="text-sm opacity-80">
                        {new Date(reminder.scheduledTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {reminder.description && (
                    <p className="text-sm opacity-90 ml-8">{reminder.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleComplete(reminder._id)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 font-medium transition-all text-sm"
                >
                  Mark Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pending.length === 0 && completed.length > 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Amazing! All done for today!
          </h3>
          <p className="text-gray-600">
            You've completed everything on your schedule. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
