import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PatientOverview } from "./PatientOverview";
import { CreateReminder } from "./CreateReminder";
import { AddPatient } from "./AddPatient";
import { PatientProgress } from "./PatientProgress";

export function CaregiverDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "reminders" | "patients">("overview");
  const profile = useQuery(api.profiles.getCurrentProfile);
  const patients = useQuery(api.profiles.getPatientsByCaregiver);

  if (!profile) return null;

  const tabs = [
    { id: "overview", label: "Patient Overview", icon: "📊" },
    { id: "progress", label: "Progress Dashboard", icon: "📈" },
    { id: "reminders", label: "Manage Reminders", icon: "⏰" },
    { id: "patients", label: "Add Patients", icon: "👥" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">
            Caregiver Dashboard - {profile.name} 🤝
          </h1>
          <p className="text-green-100">
            Managing care for {patients?.length || 0} patient{patients?.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-6 py-4 text-center font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
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
          {activeTab === "overview" && <PatientOverview patients={patients || []} />}
          {activeTab === "progress" && <PatientProgress patients={patients || []} />}
          {activeTab === "reminders" && <CreateReminder patients={patients || []} />}
          {activeTab === "patients" && <AddPatient />}
        </div>
      </div>
    </div>
  );
}
