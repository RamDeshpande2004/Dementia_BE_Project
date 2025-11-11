import React from "react";

export default function Notifications({ alerts, T }) {
  return (
    <section className="panel">
      <h3>{T.notifications}</h3>

      {alerts.length ? (
        <ul className="alerts">
          {alerts.map((a) => (
            <li key={a.id}>
              <span className="time">{a.time}</span>
              <span className="msg">{a.msg}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-alerts">{T.noAlerts}</p>
      )}
    </section>
  );
}
