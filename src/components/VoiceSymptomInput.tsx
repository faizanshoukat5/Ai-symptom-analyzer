import React, { useState, useRef, useEffect } from 'react';

interface VoiceSymptomInputProps {
  onTranscriptChange: (transcript: string) => void;
  onSubmit: (symptoms: string) => void;
}

const VoiceSymptomInput: React.FC<VoiceSymptomInputProps> = ({ onTranscriptChange, onSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          onTranscriptChange(transcript + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [transcript, onTranscriptChange]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscriptChange('');
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 text-sm">
          Voice input is not supported in your browser. Please type your symptoms manually.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Input</h3>
      
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white shadow-lg`}
        >
          {isListening ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        
        {transcript && (
          <button
            onClick={clearTranscript}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          {isListening ? 'Listening... Speak clearly about your symptoms' : 'Click the microphone to start voice input'}
        </p>
      </div>

      {transcript && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Transcript:</h4>
          <p className="text-gray-900">{transcript}</p>
        </div>
      )}

      {transcript && (
        <div className="flex space-x-3">
          <button
            onClick={() => onSubmit(transcript)}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Analyze Symptoms
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSymptomInput;
