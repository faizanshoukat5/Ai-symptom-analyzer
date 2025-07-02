import React, { useState } from "react";

interface SymptomFormProps {
  onSubmit: (symptoms: string) => void;
  loading: boolean;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, loading }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!input.trim()) {
      setError("Please describe your symptoms before submitting.");
      return;
    }
    
    if (input.trim().length < 10) {
      setError("Please provide more details about your symptoms (at least 10 characters).");
      return;
    }
    
    onSubmit(input.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your symptoms
          </label>
          <textarea
            id="symptoms"
            value={input}
            onChange={handleInputChange}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please describe your symptoms in detail. Include when they started, how severe they are, and any relevant context..."
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze Symptoms"}
        </button>
      </form>
    </div>
  );
};

export default SymptomForm;
