import React, { useState } from "react";

interface SymptomFormProps {
  onSubmit: (symptoms: string) => void;
  loading: boolean;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, loading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-4 bg-white rounded shadow">
      <label htmlFor="symptoms" className="block mb-2 font-semibold text-gray-700">
        Enter your symptoms:
      </label>
      <textarea
        id="symptoms"
        className="w-full h-32 p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Describe your symptoms here..."
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default SymptomForm;
