import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdvancedChart } from "./AdvancedChart";

interface PatientProgressProps {
  patients: any[];
}

export function PatientProgress({ patients }: PatientProgressProps) {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(
    patients.length > 0 ? patients[0]._id : null
  );
  const [timeRange, setTimeRange] = useState(7);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");

  const reminderStats = useQuery(
    api.reminders.getReminderStats,
    selectedPatient ? { patientId: selectedPatient as any, days: timeRange } : "skip"
  );
  const gameStats = useQuery(
    api.memoryGames.getGameStats,
    selectedPatient ? { patientId: selectedPatient as any, days: timeRange } : "skip"
  );
  const moodHistory = useQuery(
    api.mood.getVisibleMoodHistory,
    selectedPatient ? { patientId: selectedPatient as any, days: timeRange } : "skip"
  );
  const progressData = useQuery(
    api.analytics.getPatientProgressData,
    selectedPatient ? { patientId: selectedPatient as any, days: timeRange } : "skip"
  );

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No patients to track
        </h3>
        <p className="text-gray-600">
          Add patients to your care list to view their progress and analytics.
        </p>
      </div>
    );
  }

  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "very_happy": return "😄";
      case "happy": return "😊";
      case "neutral": return "😐";
      case "sad": return "😔";
      case "very_sad": return "😢";
      default: return "😐";
    }
  };

  const getProgressInsight = (reminderRate: number, gameScore: number) => {
    if (reminderRate >= 90 && gameScore >= 80) {
      return { icon: "🌟", message: "Exceptional progress! Patient is thriving!", color: "text-green-600" };
    } else if (reminderRate >= 80 && gameScore >= 70) {
      return { icon: "✅", message: "Excellent progress! Keep up the great work!", color: "text-green-600" };
    } else if (reminderRate >= 70 && gameScore >= 60) {
      return { icon: "👍", message: "Good progress! Steady improvement noted.", color: "text-blue-600" };
    } else if (reminderRate >= 60 || gameScore >= 50) {
      return { icon: "📈", message: "Making progress! Encourage continued effort.", color: "text-yellow-600" };
    } else {
      return { icon: "💪", message: "Needs support. Consider adjusting care plan.", color: "text-orange-600" };
    }
  };

  // Enhanced mood trend data
  const moodTrendData = moodHistory ? moodHistory.slice(0, timeRange).map(entry => {
    const moodValue = {
      "very_sad": 1,
      "sad": 2,
      "neutral": 3,
      "happy": 4,
      "very_happy": 5
    }[entry.mood] || 3;

    return {
      date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: moodValue,
      label: entry.mood.replace('_', ' '),
      category: "Mood"
    };
  }).reverse() : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Patient Progress Dashboard</h2>
        
        <div className="flex gap-4">
          <select
            value={selectedPatient || ""}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as "line" | "bar" | "area")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
      </div>

      {selectedPatientData && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Progress for {selectedPatientData.name}
            </h3>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">📅 Reminder Compliance</h4>
                {reminderStats ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {reminderStats.completionRate}%
                    </div>
                    <div className="text-sm text-blue-700">
                      {reminderStats.completed} of {reminderStats.total} completed
                    </div>
                    <div className="text-xs text-blue-600">
                      {reminderStats.missed} missed reminders
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse bg-blue-200 h-16 rounded"></div>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-3">🧠 Memory Games</h4>
                {gameStats ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600">
                      {gameStats.gamesPlayed}
                    </div>
                    <div className="text-sm text-purple-700">
                      games played
                    </div>
                    {gameStats.averageScore > 0 && (
                      <div className="text-xs text-purple-600">
                        Average: {gameStats.averageScore}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-pulse bg-purple-200 h-16 rounded"></div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3">💭 Mood Tracking</h4>
                {moodHistory ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {moodHistory.length}
                    </div>
                    <div className="text-sm text-green-700">
                      mood entries shared
                    </div>
                    {moodHistory.length > 0 && (
                      <div className="text-xs text-green-600">
                        Latest: {getMoodIcon(moodHistory[0].mood)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-pulse bg-green-200 h-16 rounded"></div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-3">🎯 Overall Progress</h4>
                {reminderStats && gameStats ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round((reminderStats.completionRate + (gameStats.averageScore || 0)) / 2)}%
                    </div>
                    <div className="text-sm text-orange-700">
                      combined score
                    </div>
                    {(() => {
                      const insight = getProgressInsight(reminderStats.completionRate, gameStats.averageScore || 0);
                      return (
                        <div className={`text-xs ${insight.color} flex items-center`}>
                          <span className="mr-1">{insight.icon}</span>
                          {insight.message}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="animate-pulse bg-orange-200 h-16 rounded"></div>
                )}
              </div>
            </div>

            {/* Enhanced Progress Charts */}
            {progressData && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <AdvancedChart 
                  data={progressData.reminderTrend} 
                  title="Daily Reminder Completion %" 
                  color="blue-500"
                  type={chartType}
                  height={300}
                  animate={true}
                />
                <AdvancedChart 
                  data={progressData.gameScoreTrend} 
                  title="Memory Game Performance %" 
                  color="purple-500"
                  type={chartType}
                  height={300}
                  animate={true}
                />
              </div>
            )}

            {/* Mood Trend Chart */}
            {moodTrendData.length > 0 && (
              <div className="mb-6">
                <AdvancedChart 
                  data={moodTrendData} 
                  title="Mood Trend (1=Very Sad, 5=Very Happy)" 
                  color="green-500"
                  type={chartType}
                  height={250}
                  animate={true}
                />
              </div>
            )}

            {/* Activity Heatmap */}
            {gameStats && gameStats.recentScores.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-4">Activity Heatmap - Last {timeRange} Days</h4>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: timeRange }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (timeRange - 1 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    
                    const dayActivity = gameStats.recentScores.filter(score => 
                      new Date(score.date).toISOString().split('T')[0] === dateStr
                    );
                    
                    const activityLevel = dayActivity.length > 0 ? 
                      (dayActivity.reduce((sum, score) => sum + score.percentage, 0) / dayActivity.length) / 100 : 0;
                    
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded text-xs flex items-center justify-center text-white font-medium transition-all hover:scale-110 cursor-pointer ${
                          activityLevel > 0.8 ? 'bg-green-500' :
                          activityLevel > 0.6 ? 'bg-green-400' :
                          activityLevel > 0.4 ? 'bg-yellow-400' :
                          activityLevel > 0.2 ? 'bg-orange-400' :
                          activityLevel > 0 ? 'bg-red-400' : 'bg-gray-200 text-gray-600'
                        }`}
                        title={`${date.toLocaleDateString()}: ${Math.round(activityLevel * 100)}% activity`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>Less active</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                  </div>
                  <span>More active</span>
                </div>
              </div>
            )}

            {/* Enhanced Smart Care Insights */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-3">🔔 Smart Care Insights & Recommendations</h4>
              <div className="space-y-3 text-sm">
                {reminderStats && reminderStats.completionRate < 70 && (
                  <div className="flex items-start text-red-700 bg-red-50 p-3 rounded-lg">
                    <span className="mr-2 text-lg">🚨</span>
                    <div>
                      <div className="font-medium">Low Reminder Compliance ({reminderStats.completionRate}%)</div>
                      <div className="text-xs mt-1">
                        <strong>Immediate Actions:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          <li>Review reminder timing - align with daily routine</li>
                          <li>Simplify reminder language and instructions</li>
                          <li>Consider visual/audio cues or family assistance</li>
                          <li>Check for medication side effects affecting compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {gameStats && gameStats.gamesPlayed === 0 && (
                  <div className="flex items-start text-orange-700 bg-orange-50 p-3 rounded-lg">
                    <span className="mr-2 text-lg">🎮</span>
                    <div>
                      <div className="font-medium">No Recent Brain Exercise</div>
                      <div className="text-xs mt-1">
                        <strong>Engagement Strategies:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          <li>Start with 5-minute easy-level games</li>
                          <li>Schedule games during peak alertness times</li>
                          <li>Celebrate small wins and progress</li>
                          <li>Consider playing together initially for support</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {moodHistory && moodHistory.filter(m => m.mood === "sad" || m.mood === "very_sad").length > moodHistory.length / 2 && moodHistory.length > 0 && (
                  <div className="flex items-start text-purple-700 bg-purple-50 p-3 rounded-lg">
                    <span className="mr-2 text-lg">💭</span>
                    <div>
                      <div className="font-medium">Mood Support Needed</div>
                      <div className="text-xs mt-1">
                        <strong>Support Recommendations:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          <li>Increase check-in frequency and quality time</li>
                          <li>Engage in favorite activities and hobbies</li>
                          <li>Consider professional counseling support</li>
                          <li>Review medication effects on mood</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {reminderStats && gameStats && reminderStats.completionRate >= 80 && gameStats.averageScore >= 75 && (
                  <div className="flex items-start text-green-700 bg-green-50 p-3 rounded-lg">
                    <span className="mr-2 text-lg">🌟</span>
                    <div>
                      <div className="font-medium">Excellent Progress!</div>
                      <div className="text-xs mt-1">
                        Patient is thriving with {reminderStats.completionRate}% reminder compliance and {gameStats.averageScore}% game performance. 
                        <strong> Continue current care approach and consider gradually increasing challenge levels.</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Summary */}
                <div className="flex items-start text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <span className="mr-2 text-lg">📊</span>
                  <div>
                    <div className="font-medium">Weekly Summary</div>
                    <div className="text-xs mt-1">
                      <strong>This week:</strong> {gameStats?.gamesPlayed || 0} games played, {reminderStats?.completed || 0} reminders completed, {moodHistory?.length || 0} mood entries shared.
                      {gameStats && gameStats.gamesPlayed > 0 && (
                        <span> Average game score: {gameStats.averageScore}%.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Mood Entries */}
              {moodHistory && moodHistory.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Recent Mood Entries</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {moodHistory.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getMoodIcon(entry.mood)}</span>
                          <div>
                            <div className="font-medium text-gray-800 capitalize">
                              {entry.mood.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(entry.timestamp).toLocaleDateString()} at{" "}
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </div>
                            {entry.notes && (
                              <div className="text-sm text-gray-700 mt-1">"{entry.notes}"</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Game Performance */}
              {gameStats && gameStats.recentScores.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Recent Game Performance</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {gameStats.recentScores.slice(0, 6).map((score, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-800">
                            {score.date}
                          </span>
                          <span className={`font-bold ${
                            score.percentage >= 80 ? 'text-green-600' : 
                            score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {score.percentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {score.score}/{score.maxScore} correct • {score.difficulty}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <span className="mr-2">
                            {score.gameId.includes('face') ? '👥' : '📝'}
                          </span>
                          {score.gameId.includes('face') ? 'Face-Name' : 'Word Recall'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
