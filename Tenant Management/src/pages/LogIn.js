import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope } from "react-icons/fa";
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            onLogin(user); // Assuming onLogin might take user data as a parameter
            navigate('/profile');
        } catch (error) {
            setErrorMessage('Authentication failed. Please check your email and password.');
        }
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleInputFocus = () => {
        setErrorMessage('');
    };

    return (
        <div className='container'>
            <div className='login-container'>
                <div className='left'></div>
                <div className='right'>
                    <h2>LogIn</h2>
                    <form onSubmit={handleSubmit}>
                        <br />
                        <div className='input'>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={handleEmailChange}
                                onFocus={handleInputFocus}
                                required
                            />
                            <FaEnvelope className='icon' />
                        </div>
                        <br />
                        <br />
                        <div className='input'>
                            <input
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={handleInputFocus}
                                required
                            />
                            <FaLock className='icon' />
                        </div>
                        <br />
                        <button type="submit">Login</button>
                    </form>
                    {errorMessage && (
                        <div className='redirect-signup'>
                            {errorMessage === 'You don\'t have an account, please ' ? (
                                <span>
                                    {errorMessage} <a href="/signup">SignUp</a>
                                </span>
                            ) : (
                                <span>{errorMessage}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
