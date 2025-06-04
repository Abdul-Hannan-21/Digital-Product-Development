import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PatientOverviewProps {
  patients: any[];
}

export function PatientOverview({ patients }: PatientOverviewProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No patients assigned
        </h3>
        <p className="text-gray-600">
          Patients will appear here once they connect with you as their caregiver.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Patient Overview</h2>
      
      <div className="grid gap-6">
        {patients.map((patient) => (
          <PatientCard key={patient._id} patient={patient} />
        ))}
      </div>
    </div>
  );
}

function PatientCard({ patient }: { patient: any }) {
  const reminderStats = useQuery(api.reminders.getReminderStats, { 
    patientId: patient._id,
    days: 7 
  });
  const gameStats = useQuery(api.memoryGames.getGameStats, { 
    patientId: patient._id,
    days: 7 
  });
  const todaysReminders = useQuery(api.reminders.getTodaysReminders, { 
    patientId: patient._id 
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
          {patient.dateOfBirth && (
            <p className="text-sm text-gray-600">
              Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
            </p>
          )}
          {patient.emergencyContact && (
            <p className="text-sm text-gray-600">
              Emergency: {patient.emergencyContact}
            </p>
          )}
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Patient
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Today's Schedule</h4>
          {todaysReminders ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {todaysReminders.filter(r => r.isCompleted).length}/{todaysReminders.length}
              </div>
              <div className="text-sm text-blue-700">
                {todaysReminders.length === 0 ? "No reminders" : "completed"}
              </div>
            </div>
          ) : (
            <div className="animate-pulse bg-blue-200 h-8 rounded"></div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Weekly Reminders</h4>
          {reminderStats ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {reminderStats.completionRate}%
              </div>
              <div className="text-sm text-green-700">
                {reminderStats.completed}/{reminderStats.total} completed
              </div>
            </div>
          ) : (
            <div className="animate-pulse bg-green-200 h-8 rounded"></div>
          )}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-2">Memory Games</h4>
          {gameStats ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {gameStats.gamesPlayed}
              </div>
              <div className="text-sm text-purple-700">
                games this week
              </div>
              {gameStats.averageScore > 0 && (
                <div className="text-xs text-purple-600">
                  Avg: {gameStats.averageScore}%
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse bg-purple-200 h-8 rounded"></div>
          )}
        </div>
      </div>

      {todaysReminders && todaysReminders.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Today's Reminders</h4>
          <div className="space-y-2">
            {todaysReminders.slice(0, 3).map((reminder) => (
              <div key={reminder._id} className="flex items-center justify-between text-sm">
                <span className={reminder.isCompleted ? "line-through text-gray-500" : "text-gray-700"}>
                  {reminder.title}
                </span>
                <span className="text-gray-500">
                  {new Date(reminder.scheduledTime).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {todaysReminders.length > 3 && (
              <div className="text-xs text-gray-500">
                +{todaysReminders.length - 3} more reminders
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
