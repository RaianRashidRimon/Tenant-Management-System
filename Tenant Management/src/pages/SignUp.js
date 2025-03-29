import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaAddressBook, FaEnvelope, FaIdCard, FaLock, FaPhone, FaUser } from "react-icons/fa";
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phoneNumber: '',
        memberID: '',
        address: '',
        username: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');   // reset the error message
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Store additional user information in Firestore
            await setDoc(doc(firestore, 'users', user.uid), {
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                memberID: formData.memberID,
                address: formData.address,
                username: formData.username,
                role: 'user', // Default role for new users
                photoURL: '', // Initially empty
                fullName: ''
            });

            navigate('/login');
        } catch (error) {
            console.error('Error signing up:', error);
            setErrorMessage('Error signing up. Please try again.');
        }
    };

    return (
        <div>
            <div className='container'>
                <div className='signup-container'>
                    <div className='left'>
                        <h2>Sign Up</h2>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className='input'><input type="email" name="email" placeholder="Email"
                                                          value={formData.email} onChange={handleChange} required/>
                                <FaEnvelope className='icon'/></div>
                            <br/>
                            <div className='input'><input type="password" name="password" placeholder="Password"
                                                          value={formData.password} onChange={handleChange} required/>
                                <FaLock className='icon'/></div>
                            <br/>
                            <div className='input'><input type="tel" name="phoneNumber" placeholder="Phone Number"
                                                          value={formData.phoneNumber} onChange={handleChange}
                                                          required/>
                                <FaPhone className='icon'/></div>
                            <br/>
                            <div className='input'><input type="text" name="memberID" placeholder="Member ID"
                                                          value={formData.memberID} onChange={handleChange} required/>
                                <FaIdCard className='icon'/></div>
                            <br/>
                            <div className='input'><input type="text" name="address" placeholder="Address"
                                                          value={formData.address} onChange={handleChange} required/>
                                <FaAddressBook className='icon'/></div>
                            <br/>
                            <div className='input'><input type="text" name="username" placeholder="Username"
                                                          value={formData.username} onChange={handleChange} required/>
                                <FaUser className='icon'/></div>
                            <br/>
                            <button type="submit">Sign Up</button>
                        </form>
                    </div>
                    <div className='right'>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
