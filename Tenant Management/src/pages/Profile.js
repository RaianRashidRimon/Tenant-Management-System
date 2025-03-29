import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import '../components/App.css';

const Profile = () => {
    const [profile, setProfile] = useState({
        email: '',
        phoneNumber: '',
        address: '',
        username: '',
        fullName: '',
        photoURL: '',
        memberID: ''
    });

    const [originalProfile, setOriginalProfile] = useState({ ...profile });
    const [isEditing, setIsEditing] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const auth = getAuth();
    const firestore = getFirestore();
    const storage = getStorage();

    useEffect(() => {
        const savedProfile = JSON.parse(localStorage.getItem('profile'));
        if (savedProfile) {
            setProfile(savedProfile);
            setOriginalProfile(savedProfile);
        }

        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                    if (userDoc.exists()) {
                        const profileData = userDoc.data();
                        setProfile(profileData);
                        setOriginalProfile(profileData);
                        localStorage.setItem('profile', JSON.stringify(profileData));
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Error fetching profile data');
            }
        };
        fetchData().then(() => {
            console.log('Profile data fetched successfully.');
        }).catch((error) => {
            console.error('Error fetching profile data:', error);
            setError('Error fetching profile data');
        });
    }, [auth, firestore]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({ ...prevProfile, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const user = auth.currentUser;
            let updatedProfile = { ...profile };
            if (photo) {
                const storageRef = ref(storage, `profilePictures/${user.uid}/${photo.name}`);
                await uploadBytes(storageRef, photo);
                updatedProfile.photoURL = await getDownloadURL(storageRef);
            }
            await updateDoc(doc(firestore, 'users', user.uid), updatedProfile);
            setProfile(updatedProfile);
            setOriginalProfile(updatedProfile);
            localStorage.setItem('profile', JSON.stringify(updatedProfile));
            alert('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setProfile({ ...originalProfile });
        setIsEditing(false);
    };

    const triggerFileInput = () => {
        document.getElementById('photoInput').click();
    };

    return (
        <div>
            <div className='container'>
                <br /><br /><br />
                <div className='userProfile'>
                    <div className='userPhoto'>
                        <img src={profile.photoURL || 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg'} alt="User Picture" />
                        {isEditing && (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    id="photoInput"
                                    style={{ display: 'none' }}
                                />
                                <button onClick={triggerFileInput}>Upload New Photo</button>
                            </>
                        )}
                    </div>
                    <div className='userInfo'>
                        {error && <div className="error">{error}</div>}
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                />
                                <input
                                    type="text"
                                    name="username"
                                    value={profile.username}
                                    onChange={handleChange}
                                    placeholder="Username"
                                />
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                />
                                <input
                                    type="text"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                />
                                <div>
                                    <button onClick={handleSave} disabled={isSaving}>Save</button>
                                    <button onClick={handleCancel} disabled={isSaving}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p><strong>Full Name:</strong> {profile.fullName}</p>
                                <p><strong>Username:</strong> {profile.username}</p>
                                <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
                                <p><strong>Address:</strong> {profile.address}</p>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Member ID:</strong> {profile.memberID}</p> {/* Displaying memberID */}
                                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
