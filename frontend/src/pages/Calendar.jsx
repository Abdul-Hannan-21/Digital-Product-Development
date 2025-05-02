import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "/api/calendar";

function getUserId() {
  // Placeholder: Replace with real user auth logic
  return 1;
}

function formatDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDatetime, setEventDatetime] = useState("");
  const [reminder, setReminder] = useState(null);

  const userId = getUserId();

  const fetchEvents = async () => {
    const res = await axios.get(`${API_BASE}/events/${userId}`);
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for reminders
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 60000);
    const upcoming = events.find(
      (e) => new Date(e.event_datetime) > now && new Date(e.event_datetime) <= soon
    );
    if (upcoming) {
      setReminder(upcoming);
    } else {
      setReminder(null);
    }
  }, [events]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !eventDatetime) return;
    await axios.post(`${API_BASE}/events/`, {
      title,
      description,
      event_datetime: eventDatetime,
      user_id: userId,
    });
    setTitle("");
    setDescription("");
    setEventDatetime("");
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE}/events/${id}`);
    fetchEvents();
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", fontWeight: 700 }}>Calendar</h2>
      {reminder && (
        <div style={{ background: "#ffe066", padding: 16, borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          Reminder: Upcoming event "{reminder.title}" at {formatDateTime(reminder.event_datetime)}
        </div>
      )}
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: 18, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ fontSize: 16, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="datetime-local"
          value={eventDatetime}
          onChange={(e) => setEventDatetime(e.target.value)}
          style={{ fontSize: 16, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
          required
        />
        <button
          type="submit"
          style={{ fontSize: 20, padding: 12, borderRadius: 8, background: "#1976d2", color: "#fff", border: "none", fontWeight: 700 }}
        >
          Add Event
        </button>
      </form>
      <div>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888" }}>No events scheduled.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((event) => (
              <li
                key={event.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{event.title}</div>
                  <div style={{ color: "#555", fontSize: 15 }}>{formatDateTime(event.event_datetime)}</div>
                  {event.description && <div style={{ color: "#888", fontSize: 14 }}>{event.description}</div>}
                </div>
                <button
                  onClick={() => handleDelete(event.id)}
                  style={{ fontSize: 18, padding: 10, borderRadius: 8, background: "#e53935", color: "#fff", border: "none", fontWeight: 700 }}
                  aria-label="Delete event"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}