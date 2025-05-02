import React, { useState } from "react";
import axios from "axios";
import "./Pages.css";

const API_BASE = "/api/chatbot";

function Chatbot() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await axios.post(`${API_BASE}/query/`, null, {
        params: { keyword: query.trim().toLowerCase() },
      });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("Sorry, something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1 className="page-title" style={{ textAlign: "center", fontWeight: 700, fontSize: 32, marginBottom: 24 }}>
        Hi! How can I help you today?
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", marginBottom: 32 }}>
        <textarea
          aria-label="Type your question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a keyword (e.g., appointment, what day, reminder)"
          style={{ width: "100%", minHeight: 80, fontSize: 22, padding: 18, borderRadius: 10, border: "2px solid #1976d2", resize: "vertical", outline: "none" }}
          required
        />
        <button
          type="submit"
          style={{ fontSize: 24, padding: "16px 32px", borderRadius: 10, background: "#1976d2", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>
      <div
        aria-live="polite"
        style={{ minHeight: 80, background: "#f5f5f5", borderRadius: 10, padding: 24, fontSize: 22, color: "#222", boxShadow: "0 2px 8px #eee", marginTop: 8 }}
      >
        {response && <span>{response}</span>}
      </div>
    </div>
  );
}

export default Chatbot;