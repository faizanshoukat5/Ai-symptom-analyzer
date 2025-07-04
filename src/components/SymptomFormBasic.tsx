import { useState } from 'react';
import Card from './Card';
import Button from './Button';
import TextArea from './TextArea';
import Input from './Input';

interface SymptomFormBasicProps {
  onSubmit: (symptoms: string, age?: number, gender?: string) => void;
  isLoading: boolean;
}

export default function SymptomFormBasic({ onSubmit, isLoading }: SymptomFormBasicProps) {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (symptoms.trim().length < 10) {
      setError('Please provide a more detailed description of your symptoms (at least 10 characters)');
      return;
    }
    
    setError('');
    onSubmit(
      symptoms, 
      age ? parseInt(age, 10) : undefined,
      gender || undefined
    );
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Describe Your Symptoms
        </h2>
        
        <TextArea
          label="Please describe your symptoms in detail"
          placeholder="Describe what you're experiencing. For example: I've had a headache for 3 days, with pain mostly on the right side. The pain is throbbing and gets worse when I bend over..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={6}
          className="text-base"
          error={error}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Age"
            type="number"
            placeholder="Your age (optional)"
            value={age}
            min={1}
            max={120}
            onChange={(e) => setAge(e.target.value)}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Gender (optional)
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
