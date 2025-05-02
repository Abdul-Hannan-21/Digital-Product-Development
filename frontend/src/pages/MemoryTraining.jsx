import React, { useState } from 'react'
import './Pages.css'
import FaceNameMatching from '../components/FaceNameMatching'
import ItemRecall from '../components/ItemRecall'

function MemoryTraining() {
  const [activeExercise, setActiveExercise] = useState(null)
  const [score, setScore] = useState(null);
  const [gameType, setGameType] = useState(null);

  const exercises = [
    {
      id: 1,
      title: 'Number Sequence',
      description: 'Memorize a sequence of numbers and recall them in the correct order.',
      difficulty: 'Easy'
    },
    {
      id: 2,
      title: 'Word Association',
      description: 'Create mental connections between pairs of words to improve recall.',
      difficulty: 'Medium'
    },
    {
      id: 3,
      title: 'Visual Memory',
      description: 'Remember the positions of objects on a grid and recreate the pattern.',
      difficulty: 'Hard'
    },
    {
      id: 4,
      title: 'Face-Name Matching',
      description: 'Practice associating names with faces to improve social memory.',
      difficulty: 'Medium'
    },
    {
      id: 5,
      title: 'Item Recall',
      description: 'Memorize a list of words and recall as many as possible.',
      difficulty: 'Easy'
    }
  ];

  const handleStart = (id) => {
    setActiveExercise(id);
    setScore(null);
    setGameType(null);
  };

  const handleScore = (scoreValue, type) => {
    setScore(scoreValue);
    setGameType(type);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Memory Training</h1>
      <div className="card">
        <h2>Exercise Your Memory</h2>
        <p>
          Regular practice with these exercises will help strengthen different aspects of your memory.
          Choose an exercise below to get started.
        </p>
      </div>
      {activeExercise === 4 ? (
        <div className="active-exercise">
          <FaceNameMatching onScore={score => handleScore(score, 'Face-Name Matching')} />
          <button style={{marginTop:16}} onClick={() => setActiveExercise(null)}>Back to Exercises</button>
        </div>
      ) : activeExercise === 5 ? (
        <div className="active-exercise">
          <ItemRecall onScore={score => handleScore(score, 'Item Recall')} />
          <button style={{marginTop:16}} onClick={() => setActiveExercise(null)}>Back to Exercises</button>
        </div>
      ) : activeExercise ? (
        <div className="active-exercise">
          <h2>{exercises.find(ex => ex.id === activeExercise).title}</h2>
          <p>{exercises.find(ex => ex.id === activeExercise).description}</p>
          <div className="exercise-content">
            <p>Exercise content will be implemented here.</p>
          </div>
          <button onClick={() => setActiveExercise(null)}>Back to Exercises</button>
        </div>
      ) : (
        <div className="features-grid">
          {exercises.map(exercise => (
            <div key={exercise.id} className="feature-card">
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
              <button onClick={() => handleStart(exercise.id)}>Start</button>
            </div>
          ))}
        </div>
      )}
      {score !== null && (
        <div style={{marginTop:24, fontWeight:'bold', color: score > 0 ? 'green' : '#e67e22'}}>
          {score > 0 ? 'Great job!' : 'Try again tomorrow!'}
          {gameType && (
            <span style={{marginLeft:8}}>
              ({gameType} score: {score})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MemoryTraining