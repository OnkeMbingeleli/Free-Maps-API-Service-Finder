import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './firebase';
export const firestore = getFirestore(app);

export async function saveServiceSuggestion(data) {
  return addDoc(collection(firestore, 'service_suggestions'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
