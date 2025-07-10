import { useState, useEffect, useRef } from "react";

const RAW_DESIGNATIONS = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Analyst", "Data Scientist", "ML Engineer", "AI Researcher", "Project Manager",
  "Product Manager", "UI/UX Designer", "DevOps Engineer", "System Administrator",
  "Network Engineer", "Cybersecurity Analyst", "QA Engineer", "Business Analyst",
  "Technical Writer", "Database Administrator", "Cloud Architect"
];

const ALL_DESIGNATIONS = Array.from(new Set(RAW_DESIGNATIONS)).sort();

export default function DesignationSelector({ value, onChange }) {
  const [input, setInput] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setInput(value || "");
  }, [value]);

  const handleSelect = (item) => {
    onChange(item);
    setInput(item);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      if (input.trim()) {
        onChange(input.trim());
      }
    }, 100); // Delay so click can register before hiding
  };

  const filtered = ALL_DESIGNATIONS.filter(
    (item) => item.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onBlur={handleBlur}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Select or type designation"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border shadow rounded max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item}
              onMouseDown={() => handleSelect(item)}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
