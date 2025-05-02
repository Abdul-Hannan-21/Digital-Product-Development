import React, { useState, useEffect } from "react";

const WORDS = ["apple", "river", "cloud", "guitar", "mountain", "pencil", "window", "orange", "train", "garden"];

function getRandomWords(n) {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function ItemRecall({ onScore }) {
  const [words, setWords] = useState([]);
  const [showWords, setShowWords] = useState(true);
  const [timer, setTimer] = useState(10);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setWords(getRandomWords(5));
    setShowWords(true);
    setTimer(10);
    setInput("");
    setSubmitted(false);
    setScore(0);
  }, []);

  useEffect(() => {
    if (showWords && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (showWords && timer === 0) {
      setShowWords(false);
    }
  }, [showWords, timer]);

  const handleSubmit = () => {
    const recalled = input
      .split(/\s|,|;/)
      .map(w => w.trim().toLowerCase())
      .filter(Boolean);
    const correct = words.filter(w => recalled.includes(w)).length;
    setScore(correct);
    setSubmitted(true);
    if (onScore) onScore(correct);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Item Recall</h3>
      {showWords ? (
        <div>
          <div style={{ fontSize: 24, margin: 16 }}>{words.join(" • ")}</div>
          <div style={{ margin: 8 }}>Memorize these words!</div>
          <div style={{ fontWeight: "bold", color: "#2980b9" }}>Time left: {timer}s</div>
        </div>
      ) : !submitted ? (
        <div>
          <div style={{ margin: 8 }}>Type as many words as you remember:</div>
          <textarea
            rows={2}
            style={{ width: 240, fontSize: 16 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={submitted}
          />
          <br />
          <button style={{ marginTop: 12 }} onClick={handleSubmit} disabled={input.trim() === ""}>Submit</button>
        </div>
      ) : (
        <div style={{ marginTop: 16, fontWeight: "bold", color: score === 5 ? "green" : "#e67e22" }}>
          {score === 5 ? "Great job!" : "Try again tomorrow!"} ({score}/5 correct)
          <div style={{ marginTop: 8, fontSize: 14 }}>
            Words were: {words.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}