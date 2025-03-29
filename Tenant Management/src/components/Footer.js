import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <>
            <div className="Footer">
                <div className="footer-container">
                    <div className='nameAndSocial'>
                        <h3><span>ARUNA</span>PALLI</h3>
                        <p>A Place We Call Home</p>
                        <br/>
                        <div className="footer-icons">
                            <i><FaFacebook/></i>
                            <i><FaTwitter/></i>
                            <i><FaInstagram/></i>
                            <i><FaLinkedin/></i>
                        </div>
                    </div>
                    <div className="quickLinks">
                        <h4>Quick Links</h4>
                        <br/>
                        <ul>
                            <li className="nav-item">
                                <Link to="/ContactUs">Contact Us</Link> {/* Use Link component */}
                            </li>
                        </ul>
                    </div>
                    <div className="contact">
                        <h4>Contact</h4>
                        <p> +880 1234567890</p>
                        <p> arunapalli420@gmail.com</p>
                        <p>Arunapalli, Jahangirnagar University<br/>
                            Savar, Dhaka-1342,<br/>
                            Dhaka- 1207, Bangladesh </p>
                    </div>
                </div>
                <div className='Last-footer'>
                    <p>&copy;Design By Team 18</p>
                </div>
            </div>

        </>
    );
}

export default Footer;
