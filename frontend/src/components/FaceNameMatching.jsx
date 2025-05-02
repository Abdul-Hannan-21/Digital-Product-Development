import React, { useState } from "react";

const faces = [
  { id: 1, name: "Alice", img: "https://randomuser.me/api/portraits/women/1.jpg" },
  { id: 2, name: "Bob", img: "https://randomuser.me/api/portraits/men/2.jpg" },
  { id: 3, name: "Carol", img: "https://randomuser.me/api/portraits/women/3.jpg" }
];

const shuffledNames = faces.map(f => f.name).sort(() => Math.random() - 0.5);

export default function FaceNameMatching({ onScore }) {
  const [matches, setMatches] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (faceId, name) => {
    setMatches({ ...matches, [faceId]: name });
  };

  const handleSubmit = () => {
    let correct = 0;
    faces.forEach(f => {
      if (matches[f.id] === f.name) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    if (onScore) onScore(correct);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Face-Name Matching</h3>
      <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
        {faces.map(face => (
          <div key={face.id} style={{ margin: 8 }}>
            <img src={face.img} alt={face.name} style={{ width: 80, borderRadius: "50%" }} />
            <div>
              <select
                value={matches[face.id] || ""}
                onChange={e => handleSelect(face.id, e.target.value)}
                disabled={submitted}
              >
                <option value="">Select name</option>
                {shuffledNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button style={{ marginTop: 16 }} onClick={handleSubmit} disabled={Object.keys(matches).length < 3}>
          Submit
        </button>
      ) : (
        <div style={{ marginTop: 16, fontWeight: "bold", color: score === 3 ? "green" : "#e67e22" }}>
          {score === 3 ? "Great job!" : "Try again tomorrow!"} ({score}/3 correct)
        </div>
      )}
    </div>
  );
}