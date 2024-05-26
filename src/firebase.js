import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDjTrH9qq9geTK8lKoBv-FipeRock48nmo",
    authDomain: "time-tracker-ce3a7.firebaseapp.com",
    projectId: "time-tracker-ce3a7",
    storageBucket: "time-tracker-ce3a7.appspot.com",
    messagingSenderId: "147122880955",
    appId: "1:147122880955:web:9b379c1f0fe753888f849e",
    measurementId: "G-CGVFSXT7DQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db };