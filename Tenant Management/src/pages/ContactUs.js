import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { firestore } from '../firebase'; // Import Firestore from your firebase.js file
import '../components/App.css';
import {addDoc, collection} from "firebase/firestore";

const mapStyles = {
    height: "300px",
    width: "100%",
    zIndex: 1
};

const defaultCenter = {
    lat: 23.86850322367032,
    lng: 90.28478626597922
};

function ContactUs() {
    const [query, setQuery] = useState('Share your thoughts');
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (query === 'Share your thoughts') {
            return;
        }

        try {
            // Add query to Firestore collection 'queries'
            const queriesRef = collection(firestore, 'queries');
            await addDoc(queriesRef, {
                queryMessage: query,
                // userId: You can add userId here if available
            });
            setResponseMessage('Your query has been submitted.');
        } catch (error) {
            console.error('Error adding query: ', error);
            setResponseMessage('Failed to submit query: ' + error.message); // Update response message to include error
        }

        setTimeout(() => {
            setResponseMessage('');
        }, 5000);
        setQuery('');
    };


    const handleFocus = () => {
        if (query === 'Share your thoughts') {
            setQuery('');
        }
    };

    const handleBlur = () => {
        if (query === '') {
            setQuery('Share your thoughts');
        }
    };

    return (
        <div>
            <div className='container'>
                <br/><br/><br/>
                <div className='contact-map'>
                    <div className='contactUs-details'>
                        Arunapalli, Jahangirnagar University<br/>
                        Savar, Dhaka-1342,<br/>
                        Dhaka- 1207, Bangladesh
                    </div>
                    <form className='contact-form' onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label htmlFor='query'>Do You Have a Query ?</label>
                            <textarea
                                id='query'
                                name='query'
                                rows='4'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                maxLength={66}
                                required
                            ></textarea>
                            <button className='contact-form-button' type='submit'>
                                Submit
                            </button>

                            {responseMessage && (
                                <div className="response-message">{responseMessage}</div>
                            )}
                        </div>
                    </form>
                    <div className='gmap'>
                        <LoadScript googleMapsApiKey="AIzaSyDZ0v09lcYa3TFt9S23WuCkWyLSlHBpcu0">
                            <GoogleMap className='map'
                                       mapContainerStyle={mapStyles}
                                       zoom={13}
                                       center={defaultCenter}>
                                <Marker position={defaultCenter}/>
                            </GoogleMap>
                        </LoadScript>
                    </div>
                    <br/>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;
