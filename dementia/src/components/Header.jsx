import React from "react";

export default function Header({ T, language, setLanguage }) {
  return (
    <header className="header">
      <div className="title">{T.title}</div>
      <div className="right">
        <select
          className="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="mr">मराठी</option>
        </select>
      </div>
    </header>
  );
}
