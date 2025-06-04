import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface FaceNameGameProps {
  game: any;
  onComplete: (gameId: string, score: number, maxScore: number, timeSpent: number, difficulty: string) => void;
  onExit: () => void;
}

export function FaceNameGame({ game, onComplete, onExit }: FaceNameGameProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<"study" | "test" | "complete">("study");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(Date.now());
  const [studyTimeLeft, setStudyTimeLeft] = useState(5);

  const motivationalContent = useQuery(api.memoryGames.getMotivationalContent, {
    score: score,
    maxScore: game.difficulty === "easy" ? 3 : game.difficulty === "medium" ? 4 : 6,
    gameType: "face_name"
  });

  // Sample face-name pairs (in a real app, these would be more diverse)
  const faceNamePairs = [
    { name: "Sarah", face: "👩‍🦰", description: "Red hair, friendly smile" },
    { name: "Michael", face: "👨‍💼", description: "Business attire, confident" },
    { name: "Emma", face: "👩‍🎓", description: "Graduate, intelligent look" },
    { name: "David", face: "👨‍🍳", description: "Chef, warm personality" },
    { name: "Lisa", face: "👩‍⚕️", description: "Doctor, caring expression" },
    { name: "James", face: "👨‍🎨", description: "Artist, creative spirit" },
  ];

  const totalRounds = game.difficulty === "easy" ? 3 : game.difficulty === "medium" ? 4 : 6;
  const currentPair = faceNamePairs[currentRound % faceNamePairs.length];

  useEffect(() => {
    if (gamePhase === "study" && studyTimeLeft > 0) {
      const timer = setTimeout(() => setStudyTimeLeft(studyTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === "study" && studyTimeLeft === 0) {
      setGamePhase("test");
    }
  }, [gamePhase, studyTimeLeft]);

  const generateOptions = () => {
    const correctName = currentPair.name;
    const otherNames = faceNamePairs
      .filter(pair => pair.name !== correctName)
      .map(pair => pair.name)
      .slice(0, 3);
    
    const options = [correctName, ...otherNames].sort(() => Math.random() - 0.5);
    return options;
  };

  const [options] = useState(generateOptions());

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (answer === currentPair.name) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentRound + 1 >= totalRounds) {
        setGamePhase("complete");
      } else {
        setCurrentRound(currentRound + 1);
        setGamePhase("study");
        setStudyTimeLeft(5);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 2000);
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(game._id, score, totalRounds, timeSpent, game.difficulty);
  };

  if (gamePhase === "complete") {
    const percentage = Math.round((score / totalRounds) * 100);
    
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Complete!</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {score}/{totalRounds}
          </div>
          <div className="text-gray-600 mb-4">
            {percentage}% Accuracy
          </div>
          
          {/* Motivational Content */}
          {motivationalContent && (
            <div className="space-y-4 text-left">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🌟 Great Job!</h4>
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Round {currentRound + 1} of {totalRounds}
          </span>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Exit Game
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {gamePhase === "study" ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">{currentPair.face}</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentPair.name}</h3>
              <p className="text-gray-600">{currentPair.description}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-lg font-medium text-blue-800 mb-2">
                Study this person
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {studyTimeLeft}s
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">{currentPair.face}</div>
              <h3 className="text-xl font-medium text-gray-800 mb-6">
                What is this person's name?
              </h3>
            </div>
            
            {!showFeedback ? (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className={`p-4 rounded-lg ${
                  selectedAnswer === currentPair.name 
                    ? "bg-green-100 border border-green-200" 
                    : "bg-red-100 border border-red-200"
                }`}>
                  <div className="text-2xl mb-2">
                    {selectedAnswer === currentPair.name ? "✅" : "❌"}
                  </div>
                  <div className="font-medium">
                    {selectedAnswer === currentPair.name 
                      ? "Correct! Well done!" 
                      : `Incorrect. The correct answer is ${currentPair.name}`
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
