import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAMt9mXmLqZ76cHhM73DSU8K9w_6aijDAA",
  authDomain: "chess-game-f4bc4.firebaseapp.com",
  databaseURL: "https://chess-game-f4bc4-default-rtdb.firebaseio.com",
  projectId: "chess-game-f4bc4",
  storageBucket: "chess-game-f4bc4.firebasestorage.app",
  messagingSenderId: "340317785810",
  appId: "1:340317785810:web:e0930aa2cc74b00e15a70b"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
