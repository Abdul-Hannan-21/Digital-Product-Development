import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { PatientDashboard } from "./components/PatientDashboard";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { NotificationCenter } from "./components/NotificationCenter";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b border-blue-200 shadow-sm px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">CareMate 2.0</h2>
        </div>
        <Authenticated>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <SignOutButton />
          </div>
        </Authenticated>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (loggedInUser === undefined || profile === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to our <span className="text-blue-600">Care Mate 2.0</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Supporting memory care with gentle reminders, engaging games, and caregiver connection
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Gentle Reminders</h3>
              <p className="text-gray-600 text-sm">Never miss medications or appointments with our caring reminder system</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Memory Games</h3>
              <p className="text-gray-600 text-sm">Fun, scientifically-designed games to help maintain cognitive function</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Caring Support</h3>
              <p className="text-gray-600 text-sm">Connect with caregivers and get help whenever you need it</p>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {!profile ? (
          <ProfileSetup />
        ) : profile.role === "patient" ? (
          <PatientDashboard />
        ) : (
          <CaregiverDashboard />
        )}
      </Authenticated>
    </div>
  );
}
