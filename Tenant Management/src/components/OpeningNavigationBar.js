import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'
function OpeningNavigationBar() {
    return (
        <div className='navbar'>
            <div className='navbar-logo'>
                Aruna Palli
            </div>
            <ul className='navbar-menu'>
                <li><Link to="/login">Log In</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
            </ul>
        </div>
    );
}

export default OpeningNavigationBar;