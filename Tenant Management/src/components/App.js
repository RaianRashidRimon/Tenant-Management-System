import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Profile from '../pages/Profile';
import Properties from '../pages/Properties';
import Payments from '../pages/Payments';
import Tenants from '../pages/Tenants';
import Login from '../pages/LogIn';
import SignUp from '../pages/SignUp';
import ContactUs from '../pages/ContactUs';
import AdminLogIn from "../pages/AdminLogIn";
import AdminPage from "../pages/AdminPage";
import NavigationBar from "../components/NavigationBar";
import OpeningNavigationBar from "../components/OpeningNavigationBar";
import Footer from './Footer';
import './App.css';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const admin = localStorage.getItem('isAdmin') === 'true';
        setIsLoggedIn(loggedIn);
        setIsAdmin(admin);
    }, []);

    const handleLogin = (admin = false) => {
        setIsLoggedIn(true);
        setIsAdmin(admin);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', admin.toString());
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.setItem('isAdmin', 'false');
    };

    return (
        <Router>
            {isLoggedIn ? <NavigationBar handleLogout={handleLogout} isAdmin={isAdmin} /> : <OpeningNavigationBar />}
            <Routes>
                <Route path="/" element={<Login onLogin={handleLogin} />} />
                <Route path="/SignUp" element={<SignUp />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Properties" element={<Properties />} />
                <Route path="/Payments" element={<Payments />} />
                <Route path="/Tenants/:propertyId" element={<Tenants />} />
                <Route path="/ContactUs" element={<ContactUs />} />
                <Route path="/AdminLogIn" element={<AdminLogIn onLogin={(admin) => handleLogin(admin)} />} />
                <Route path="/AdminPage" element={isAdmin ? <AdminPage /> : <Navigate to="/AdminLogIn" />} />
                <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
