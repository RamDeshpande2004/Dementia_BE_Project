import React from "react";

export default function StatusAndFeedback({
  status,
  T,
  feedbackCount,
  sendFeedback,
}) {
  return (
    <>
      {/* 🔹 Status Section */}
      <StatusAndFeedback
        status={status}
        T={T}
        feedbackCount={feedbackCount}
        sendFeedback={sendFeedback}
      />
    </>
  );
}
