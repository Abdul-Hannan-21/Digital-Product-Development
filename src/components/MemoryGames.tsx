import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaceNameGame } from "./games/FaceNameGame";
import { WordRecallGame } from "./games/WordRecallGame";
import { toast } from "sonner";

export function MemoryGames() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameInProgress, setGameInProgress] = useState(false);
  
  const profile = useQuery(api.profiles.getCurrentProfile);
  const games = useQuery(api.memoryGames.getAvailableGames);
  const recentScores = useQuery(api.memoryGames.getRecentActivity, 
    profile ? { patientId: profile._id } : "skip"
  ) || [];
  const recordScore = useMutation(api.memoryGames.saveGameScore);

  const handleGameComplete = async (gameId: string, score: number, maxScore: number, timeSpent: number, difficulty: string) => {
    try {
      await recordScore({
        gameId: gameId as any,
        score,
        maxScore,
        timeSpent,
        difficulty,
      });
      toast.success(`Great job! You scored ${score}/${maxScore}! 🎉`);
      setSelectedGame(null);
      setGameInProgress(false);
    } catch (error) {
      toast.error("Failed to save score");
    }
  };

  if (!games) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (gameInProgress && selectedGame) {
    const game = games.find(g => g._id === selectedGame);
    if (!game) return null;

    if (game._id.includes("face_name")) {
      return (
        <FaceNameGame
          game={game}
          onComplete={handleGameComplete}
          onExit={() => {
            setSelectedGame(null);
            setGameInProgress(false);
          }}
        />
      );
    } else if (game._id.includes("word_recall")) {
      return (
        <WordRecallGame
          game={game}
          onComplete={handleGameComplete}
          onExit={() => {
            setSelectedGame(null);
            setGameInProgress(false);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Memory Games 🧠</h2>
        <p className="text-gray-600">
          Exercise your mind with fun, scientifically-designed games
        </p>
      </div>

      {recentScores && recentScores.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">Recent Scores 📊</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentScores.slice(0, 4).map((score, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 text-sm">
                    {score.gameId.includes('face') ? 'Face-Name Game' : 'Word Recall Game'}
                  </span>
                  <span className={`font-bold ${(score.percentage || 0) >= 80 ? 'text-green-600' : (score.percentage || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score.percentage || 0}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{score.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all cursor-pointer"
            onClick={() => {
              setSelectedGame(game._id);
              setGameInProgress(true);
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">
                {game._id.includes("face_name") ? "👥" : "📝"}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {game.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {game._id.includes("face_name") 
                  ? "Match faces with their names to strengthen memory connections"
                  : "Remember and recall words to improve cognitive function"
                }
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  game.difficulty === "easy" ? "bg-green-100 text-green-700" :
                  game.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                </span>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all">
                Play Game
              </button>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No games available
          </h3>
          <p className="text-gray-600">
            Games are being set up. Please check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
