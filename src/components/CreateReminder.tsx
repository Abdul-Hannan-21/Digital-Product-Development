import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CreateReminderProps {
  patients: any[];
}

export function CreateReminder({ patients }: CreateReminderProps) {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"medication" | "appointment" | "task" | "meal">("medication");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("daily");
  const [isLoading, setIsLoading] = useState(false);

  const createReminder = useMutation(api.reminders.createReminder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !title || !date || !time) return;

    setIsLoading(true);
    try {
      const scheduledTime = new Date(`${date}T${time}`).toISOString();
      
      await createReminder({
        patientId: selectedPatient as any,
        title,
        description: description || undefined,
        type,
        scheduledTime,
        isRecurring,
        recurringPattern: isRecurring ? (recurringPattern as "daily" | "weekly" | "monthly") : undefined,
      });

      toast.success("Reminder created successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setIsRecurring(false);
      setRecurringPattern("daily");
    } catch (error) {
      toast.error("Failed to create reminder");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No patients to manage
        </h3>
        <p className="text-gray-600">
          You need patients assigned to you before you can create reminders.
        </p>
      </div>
    );
  }

  const typeOptions = [
    { value: "medication", label: "💊 Medication", color: "bg-red-100 text-red-700" },
    { value: "appointment", label: "🏥 Appointment", color: "bg-blue-100 text-blue-700" },
    { value: "meal", label: "🍽️ Meal", color: "bg-orange-100 text-orange-700" },
    { value: "task", label: "✅ Task", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Reminder</h2>
        <p className="text-gray-600">
          Set up reminders to help your patients stay on track
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }} className="space-y-6">
          <div>
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient *
            </label>
            <select
              id="patient"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              required
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reminder Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    type === option.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              placeholder="e.g., Take morning medication"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              placeholder="Additional details or instructions..."
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700">
                Make this a recurring reminder
              </label>
            </div>

            {isRecurring && (
              <div>
                <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Pattern
                </label>
                <select
                  id="pattern"
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedPatient || !title || !date || !time || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Reminder..." : "Create Reminder"}
          </button>
        </form>
      </div>
    </div>
  );
}
