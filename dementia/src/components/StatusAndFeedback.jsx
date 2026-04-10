import React from "react";

export default function StatusAndFeedback({
  status,
  T,
  feedbackCount,
  sendFeedback,
}) {
  const isUnsafe = status === "Anomaly";
  
  return (
    <div className="panel feedback-section">
      
      <section className="status">
        {isUnsafe ? (
          <>
            <span style={{fontSize: '24px', marginRight: '8px'}}>⚠️</span>
            {T.unsafe}
          </>
        ) : (
          <>
            <span style={{fontSize: '24px', marginRight: '8px'}}>✅</span>
            {T.safe}
          </>
        )}
      </section>

      <h3>{T.feedback}</h3>

      <div className="feedback-buttons">
        <button
          className="feedback-btn calm"
          onClick={() => sendFeedback({ reacted: true })}
        >
          ✅ {T.reacted}
        </button>

        <button
          className="feedback-btn reacted"
          onClick={() => sendFeedback({ reacted: false })}
        >
          ❌ {T.notReacted}
        </button>
      </div>

      <p>
        {T.feedbackNote} — <strong>{feedbackCount % 10}/10</strong>
      </p>

    </div>
  );
}