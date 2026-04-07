import React from "react";

export default function StatusAndFeedback({
  status,
  T,
  feedbackCount,
  sendFeedback,
}) {
  return (
    <div className="panel feedback-section">

      {/* 🔹 STATUS DISPLAY */}
      <section className="status">
        {status === "Anomaly" ? T.unsafe : T.safe}
      </section>

      {/* 🔹 FEEDBACK UI */}
      <h3>{T.feedback}</h3>

      <div className="feedback-buttons">
        <button
          onClick={() => sendFeedback({ reacted: true })}
        >
          ✅ {T.reacted}
        </button>

        <button
          onClick={() => sendFeedback({ reacted: false })}
        >
          ❌ {T.notReacted}
        </button>
      </div>

      {/* 🔹 COUNT (comes from App.js, not here) */}
      <p>
        {T.feedbackNote} ({feedbackCount % 10}/10)
      </p>

    </div>
  );
}