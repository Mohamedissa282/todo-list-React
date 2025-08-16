import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyCG2eDGr2eKVzDldpMoBjLXlwVWDUeIkdQ",

  authDomain: "todo-list-f57d9.firebaseapp.com",

  projectId: "todo-list-f57d9",

  storageBucket: "todo-list-f57d9.firebasestorage.app",

  messagingSenderId: "991959851987",

  appId: "1:991959851987:web:d11dc5024939c9d707c526",

  measurementId: "G-9V12FQC1DS"

};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
