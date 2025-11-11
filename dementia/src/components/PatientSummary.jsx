import React from "react";

export default function PatientSummary({
  T,
  data,
  comfort,
  comfortColor,
  locationName,
  isOutOfZone,
}) {
  return (
    <section className="patient-summary">
      <div>
        <strong>{T.caregiver}:</strong>{" "}
        {data?.caregiver_name || "Arti Deshmukh"}
      </div>
      <div>
        <strong>{T.patient}:</strong>{" "}
        {data?.patient_name || "Mrs. Sunita Joshi"}
      </div>
      <div>
        <strong>{T.condition}:</strong> {data?.condition || T.mild}
      </div>
      <div className="comfort-row">
        <strong>{T.comfort}:</strong>{" "}
        <span className="comfort-badge" style={{ borderColor: comfortColor }}>
          <span className="comfort-dot" style={{ background: comfortColor }} />
          {comfort.toFixed(0)}%
        </span>
      </div>
      <div>
        <strong>{T.map}:</strong> {locationName} (
        {isOutOfZone ? T.zoneOut : T.zoneIn})
      </div>
    </section>
  );
}
