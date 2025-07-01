import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

interface SymptomRecord {
  id?: string;
  symptoms: string[];
  analysis: string;
  timestamp: Date;
  userId?: string;
}

export const useFirebaseSymptoms = () => {
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save symptom analysis to Firestore
  const saveSymptomAnalysis = async (symptomData: Omit<SymptomRecord, 'id' | 'timestamp'>) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'symptom-analyses'), {
        ...symptomData,
        timestamp: Timestamp.now(),
        createdAt: new Date()
      });
      console.log('Symptom analysis saved with ID: ', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error saving symptom analysis: ', err);
      setError('Failed to save analysis');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's symptom history
  const fetchSymptomHistory = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'symptom-analyses'));
      const symptomList: SymptomRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        symptomList.push({
          id: doc.id,
          symptoms: data.symptoms || [],
          analysis: data.analysis || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          userId: data.userId
        });
      });
      
      // Sort by timestamp (newest first)
      symptomList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setSymptoms(symptomList);
    } catch (err) {
      console.error('Error fetching symptom history: ', err);
      setError('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  return {
    symptoms,
    loading,
    error,
    saveSymptomAnalysis,
    fetchSymptomHistory
  };
};
