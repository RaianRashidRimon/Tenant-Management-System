import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from "react-icons/fa";
import { auth, firestore } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AdminLogIn = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleAdminSubmit = async (event) => {
        event.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if the user has admin privileges
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                onLogin(true);
                navigate('/AdminPage');
            } else {
                throw new Error('You do not have admin privileges.');
            }
        } catch (error) {
            console.error('Error logging in as admin:', error);
            setErrorMessage('You are not authorized to access this page.');
        }
    };

    const handleAdminEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleAdminPasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleInputFocus = () => {
        setErrorMessage('');
    };

    return (
        <div className='container'>
            <div className='admin-container'>
                <div className='left'></div>
                <div className='right'>
                    <h2>Admin LogIn</h2>
                    <form onSubmit={handleAdminSubmit}>
                        <br/>
                        <div className='input'>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={handleAdminEmailChange}
                                onFocus={handleInputFocus}
                                required
                            />
                            <FaEnvelope className='icon'/>
                        </div>
                        <br/>
                        <br/>
                        <div className='input'>
                            <input
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={handleAdminPasswordChange}
                                onFocus={handleInputFocus}
                                required
                            />
                            <FaLock className='icon'/>
                        </div>
                        <br/>
                        <button type="submit">Login</button>
                    </form>
                    {errorMessage && (
                        <div className="admin-login-error-message">
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogIn;

