import React from "react";

interface AIResultCardProps {
  condition: string;
  severity: string;
  advice: string;
  confidence?: number;
  recommendations?: string[];
  whenToSeekHelp?: string;
  aiModelsUsed?: string;
  entitiesExtracted?: string[];
  urgencyScore?: number;
}

const AIResultCard: React.FC<AIResultCardProps> = ({ 
  condition, 
  severity, 
  advice, 
  confidence, 
  recommendations, 
  whenToSeekHelp,
  aiModelsUsed,
  entitiesExtracted,
  urgencyScore 
}) => (
  <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
    <h2 className="text-2xl font-bold mb-2 text-blue-700">Possible Condition</h2>
    <p className="mb-2"><span className="font-semibold">Condition:</span> {condition}</p>
    <p className="mb-2"><span className="font-semibold">Severity:</span> {severity}</p>
    <p className="mb-2"><span className="font-semibold">Advice:</span> {advice}</p>
    
    {confidence && (
      <p className="mb-2"><span className="font-semibold">Confidence:</span> {confidence}%</p>
    )}
    
    {recommendations && recommendations.length > 0 && (
      <div className="mb-2">
        <span className="font-semibold">Recommendations:</span>
        <ul className="list-disc list-inside ml-4 mt-1">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    )}
    
    {whenToSeekHelp && (
      <p className="mb-2"><span className="font-semibold">When to Seek Help:</span> {whenToSeekHelp}</p>
    )}
    
    {aiModelsUsed && (
      <p className="mb-2"><span className="font-semibold">AI Models Used:</span> {aiModelsUsed}</p>
    )}
    
    {urgencyScore && (
      <p className="mb-2"><span className="font-semibold">Urgency Score:</span> {urgencyScore}/10</p>
    )}
    
    {entitiesExtracted && entitiesExtracted.length > 0 && (
      <div className="mb-2">
        <span className="font-semibold">Entities Extracted:</span>
        <ul className="list-disc list-inside ml-4 mt-1">
          {entitiesExtracted.map((entity, index) => (
            <li key={index}>{entity}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default AIResultCard;
