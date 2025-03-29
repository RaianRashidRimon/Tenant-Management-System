import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Assuming you've set up Firebase authentication

// Create the AuthContext
export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap your application and provide authentication context
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Subscribe to Firebase authentication state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Function for signing up
    const signUp = (email, password) => {
        return auth.createUserWithEmailAndPassword(email, password);
    };

    // Function for logging in
    const logIn = (email, password) => {
        return auth.signInWithEmailAndPassword(email, password);
    };

    // Function for logging out
    const logOut = () => {
        return auth.signOut();
    };

    // Value to provide through the context
    const value = {
        currentUser,
        signUp,
        logIn,
        logOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
