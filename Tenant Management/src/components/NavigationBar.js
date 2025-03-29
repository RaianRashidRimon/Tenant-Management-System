import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function NavigationBar({ handleLogout, isAdmin }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const logout = () => {
        setDropdownOpen(false); // Close the dropdown
        // Provide a confirmation prompt before logging out
        if (window.confirm("Are you sure you want to logout?")) {
            handleLogout(); // Logout only if confirmed
            navigate('/');
        }
    };

    return (
        <div className='navbar'>
            <div className='navbar-logo'>
                Aruna Palli
            </div>
            <ul className='navbar-menu'>
                <li><Link to="/profile">Your Profile</Link></li>
                <li><Link to="/properties">Your Properties</Link></li>
                <li><Link to="/payments">Payments</Link></li>
                {isAdmin ? (
                    <li><Link to='/AdminPage'>Admin</Link></li>
                ) : (
                    <li><Link to='/AdminLogIn'>Admin</Link></li>
                )}
                <li className='dropdown' ref={dropdownRef}>
                    <div className='dropdown-item'>
                        <button
                            onClick={toggleDropdown}
                            className={`dropdown-button ${dropdownOpen ? 'active' : ''}`}>
                            Logout
                        </button>
                        {dropdownOpen && (
                            <div className='dropdown-menu'>
                                <p>Do you want to logout?</p>
                                <button className='logout-button' onClick={logout}>Logout</button>
                            </div>
                        )}
                    </div>
                </li>
            </ul>
        </div>
    );
}

export default NavigationBar;
