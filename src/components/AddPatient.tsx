import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AddPatient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addPatientToCaregiver = useMutation(api.connections.addPatientToCaregiver);
  const allPatients = useQuery(api.profiles.getAllPatients);
  const currentCaregiver = useQuery(api.profiles.getCurrentProfile);

  const handleAddPatient = async () => {
    if (!selectedPatient || !currentCaregiver) return;

    setIsLoading(true);
    try {
      await addPatientToCaregiver({
        patientId: selectedPatient as any,
      });
      toast.success("Patient added successfully!");
      setSelectedPatient(null);
      setSearchTerm("");
    } catch (error) {
      toast.error("Failed to add patient");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = allPatients?.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Patient</h2>
        <p className="text-gray-600">
          Search for patients who need a caregiver and add them to your care list
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search for patients
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              placeholder="Type patient name..."
            />
          </div>

          {searchTerm && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">Available Patients</h3>
              {filteredPatients.length === 0 ? (
                <p className="text-gray-500 text-sm">No patients found matching your search.</p>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPatient === patient._id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPatient(patient._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{patient.name}</h4>
                          {patient.dateOfBirth && (
                            <p className="text-sm text-gray-600">
                              Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedPatient && (
            <button
              onClick={() => { void handleAddPatient(); }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding Patient..." : "Add Patient to My Care"}
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">💡 How it works</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Search for patients by name</li>
            <li>• Select a patient who doesn't have a caregiver yet</li>
            <li>• Click "Add Patient" to start managing their care</li>
            <li>• You'll be able to create reminders and track their progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
