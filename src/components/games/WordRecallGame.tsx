import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface WordRecallGameProps {
  game: any;
  onComplete: (gameId: string, score: number, maxScore: number, timeSpent: number, difficulty: string) => void;
  onExit: () => void;
}

export function WordRecallGame({ game, onComplete, onExit }: WordRecallGameProps) {
  const [gamePhase, setGamePhase] = useState<"study" | "recall" | "complete">("study");
  const [studyTimeLeft, setStudyTimeLeft] = useState(10);
  const [userInput, setUserInput] = useState("");
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const wordLists = {
    easy: ["apple", "chair", "book", "water", "happy"],
    medium: ["elephant", "guitar", "mountain", "butterfly", "adventure", "rainbow", "telescope"],
    hard: ["magnificent", "perseverance", "serendipity", "kaleidoscope", "metamorphosis", "extraordinary", "philosophical", "unprecedented"]
  };

  const currentWords = wordLists[game.difficulty as keyof typeof wordLists];
  const maxScore = currentWords.length;

  const motivationalContent = useQuery(api.memoryGames.getMotivationalContent, {
    score: score,
    maxScore: maxScore,
    gameType: "word_recall"
  });

  useEffect(() => {
    if (gamePhase === "study" && studyTimeLeft > 0) {
      const timer = setTimeout(() => setStudyTimeLeft(studyTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === "study" && studyTimeLeft === 0) {
      setGamePhase("recall");
    }
  }, [gamePhase, studyTimeLeft]);

  const handleAddWord = () => {
    const word = userInput.trim().toLowerCase();
    if (word && !recalledWords.includes(word)) {
      setRecalledWords([...recalledWords, word]);
      if (currentWords.includes(word)) {
        setScore(score + 1);
      }
      setUserInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddWord();
    }
  };

  const handleFinish = () => {
    setGamePhase("complete");
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(game._id, score, maxScore, timeSpent, game.difficulty);
  };

  if (gamePhase === "complete") {
    const correctWords = recalledWords.filter(word => currentWords.includes(word));
    const incorrectWords = recalledWords.filter(word => !currentWords.includes(word));
    const missedWords = currentWords.filter(word => !recalledWords.includes(word));
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Complete!</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {score}/{maxScore}
          </div>
          <div className="text-gray-600 mb-4">
            {percentage}% Accuracy
          </div>
          
          {/* Motivational Content */}
          {motivationalContent && (
            <div className="space-y-4 text-left mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🌟 Excellent Work!</h4>
                <p className="text-green-700 text-sm">{motivationalContent.message}</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💭 Daily Inspiration</h4>
                <p className="text-yellow-700 text-sm italic">"{motivationalContent.quote}"</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">💡 Memory Tip</h4>
                <p className="text-purple-700 text-sm">{motivationalContent.tip}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ Correct ({correctWords.length})</h4>
            <div className="space-y-1">
              {correctWords.map((word, index) => (
                <div key={index} className="text-green-700 text-sm">{word}</div>
              ))}
            </div>
          </div>
          
          {incorrectWords.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Incorrect ({incorrectWords.length})</h4>
              <div className="space-y-1">
                {incorrectWords.map((word, index) => (
                  <div key={index} className="text-red-700 text-sm">{word}</div>
                ))}
              </div>
            </div>
          )}
          
          {missedWords.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⏭️ Missed ({missedWords.length})</h4>
              <div className="space-y-1">
                {missedWords.map((word, index) => (
                  <div key={index} className="text-yellow-700 text-sm">{word}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-x-4">
          <button
            onClick={handleComplete}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Save Score & Continue
          </button>
          <button
            onClick={onExit}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{game.name}</h2>
        <button
          onClick={onExit}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Exit Game
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {gamePhase === "study" ? (
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Study these words carefully
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                {currentWords.map((word, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 py-3 px-4 rounded-lg font-medium text-center"
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-lg font-medium text-blue-800 mb-2">
                Memorize these words
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {studyTimeLeft}s
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Type the words you remember
              </h3>
              <p className="text-gray-600">
                Enter one word at a time and press Enter or click Add
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a word..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleAddWord}
                disabled={!userInput.trim()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {recalledWords.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">
                  Words you've entered ({recalledWords.length}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recalledWords.map((word, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleFinish}
                className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Finish Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
