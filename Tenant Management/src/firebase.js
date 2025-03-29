import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBwqQGUIC8V2tkIteCwqj8egyS8E8Ql2uQ",
    authDomain: "tenfc-51e2d.firebaseapp.com",
    projectId: "tenfc-51e2d",
    storageBucket: "tenfc-51e2d.appspot.com",
    messagingSenderId: "687770469884",
    appId: "1:687770469884:web:72b0dad05dfae23318de79",
    measurementId: "G-0GYWWH8ZTF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage, firebaseConfig, };