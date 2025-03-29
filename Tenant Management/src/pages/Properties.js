import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../components/App.css';
import Pagination from '../components/Pagination';
import { getAuth } from 'firebase/auth';

function Properties() {
    const [properties, setProperties] = useState([]);
    const [editableProperty, setEditableProperty] = useState(null);
    const [editedProperties, setEditedProperties] = useState({});
    const propertiesPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);

    const firestore = getFirestore();
    const storage = getStorage();
    const auth = getAuth();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, 'properties'));
                    const propertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProperties(propertiesData);
                    localStorage.setItem('properties', JSON.stringify(propertiesData));
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                setError('Error fetching properties. Please try again later.');
            }
        };

        const savedProperties = JSON.parse(localStorage.getItem('properties'));
        if (savedProperties) {
            setProperties(savedProperties);
        }

        fetchProperties().catch(error => console.error('Error fetching properties:', error));
    }, [auth, firestore]);

    useEffect(() => {
        localStorage.setItem('properties', JSON.stringify(properties));
    }, [properties]);

    const handleEdit = (propertyId) => {
        setEditableProperty(propertyId);
        setEditedProperties({
            ...editedProperties,
            [propertyId]: {
                ...properties.find(property => property.id === propertyId)
            }
        });
    };

    const handleSave = async (propertyId) => {
        const updatedProperty = editedProperties[propertyId];
        try {
            const user = auth.currentUser;
            const propertyDocRef = doc(firestore, 'users', user.uid, 'properties', propertyId);
            await updateDoc(propertyDocRef, updatedProperty);
            const updatedProperties = properties.map(property =>
                property.id === propertyId ? updatedProperty : property
            );
            setProperties(updatedProperties);
            setEditableProperty(null);
            setEditedProperties({});
        } catch (error) {
            console.error('Error updating property:', error);
            setError('Error updating property. Please try again later.');
        }
    };

    const handleCancel = () => {
        setEditableProperty(null);
        setEditedProperties({});
    };

    const handleInputChange = (e, propertyId, field) => {
        let value = e.target.value;
        if ((field === 'numberOfRooms' || field === 'numberOfBathrooms') && value < 0) {
            value = 0;
        }
        setEditedProperties({
            ...editedProperties,
            [propertyId]: {
                ...editedProperties[propertyId],
                [field]: value
            }
        });
    };

    const handlePhotoChange = async (e, propertyId) => {
        const file = e.target.files[0];

        const user = auth.currentUser;
        const storageRef = ref(storage, `propertyPhotos/${user.uid}/${propertyId}/${file.name}`);

        await uploadBytes(storageRef, file);

        const photoURL = await getDownloadURL(storageRef);

        setEditedProperties({
            ...editedProperties,
            [propertyId]: {
                ...editedProperties[propertyId],
                propertyPhotoURL: photoURL
            }
        });
    };

    const handleAddProperty = async () => {
        try {
            const user = auth.currentUser;
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();

            const newProperty = {
                propertyName: `Property ${properties.length + 1}`,
                location: '',
                propertySize: '',
                numberOfRooms: 0,
                numberOfBathrooms: 0,
                monthlyLease: '',
                propertyPhotoURL: '',
                ownerMemberID: userData.memberID
            };

            const docRef = await addDoc(collection(firestore, 'users', user.uid, 'properties'), newProperty);
            const addedProperty = { id: docRef.id, ...newProperty };
            setProperties([...properties, addedProperty]);
            setCurrentPage(Math.ceil((properties.length + 1) / propertiesPerPage));
        } catch (error) {
            console.error('Error adding property:', error);
            setError('Error adding property. Please try again later.');
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this property?');
        if (confirmDelete) {
            try {
                const user = auth.currentUser;
                await deleteDoc(doc(firestore, 'users', user.uid, 'properties', propertyId));
                const newProperties = properties.filter(property => property.id !== propertyId);
                setProperties(newProperties);
                if ((currentPage - 1) * propertiesPerPage >= newProperties.length && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                console.error('Error deleting property:', error);
                setError('Error deleting property. Please try again later.');
            }
        }
    };

    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = properties.slice(indexOfFirstProperty, indexOfLastProperty);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPropertyInfo = (property) => (
        <>
            <h3>{property.propertyName}</h3>
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Size:</strong> {property.propertySize}</p>
            <p><strong>Rooms:</strong> {property.numberOfRooms}</p>
            <p><strong>Bathrooms:</strong> {property.numberOfBathrooms}</p>
            <p><strong>Monthly Lease:</strong> {property.monthlyLease}</p>
        </>
    );

    const renderPropertyEditFields = (property) => (
        <>
            <input
                className='property-input'
                type="text"
                value={editedProperties[property.id]?.propertyName || ''}
                placeholder='Property Name'
                onChange={(e) => handleInputChange(e, property.id, 'propertyName')}
            />
            <input
                className='property-input'
                type="text"
                value={editedProperties[property.id]?.location || ''}
                placeholder='Property Location'
                onChange={(e) => handleInputChange(e, property.id, 'location')}
            />
            <input
                className='property-input'
                type="text"
                value={editedProperties[property.id]?.propertySize || ''}
                placeholder='Property Size'
                onChange={(e) => handleInputChange(e, property.id, 'propertySize')}
            />
            <label className='property-label' htmlFor="numberOfRooms">Number of Rooms</label>
            <input
                className='property-input'
                type="number"
                value={editedProperties[property.id]?.numberOfRooms || 0}
                placeholder='Number of Rooms'
                onChange={(e) => handleInputChange(e, property.id, 'numberOfRooms')}
                min="0"
            />
            <label className='property-label' htmlFor="numberOfRooms">Number of Bathrooms</label>
            <input
                className='property-input'
                type="number"
                value={editedProperties[property.id]?.numberOfBathrooms || 0}
                placeholder='Number of Bathrooms'
                onChange={(e) => handleInputChange(e, property.id, 'numberOfBathrooms')}
                min="0"
            />
            <input
                className='property-input'
                type="text"
                value={editedProperties[property.id]?.monthlyLease || ''}
                placeholder='Monthly Lease'
                onChange={(e) => handleInputChange(e, property.id, 'monthlyLease')}
            />
        </>
    );

    const renderProperties = (property) => (
        <div className='property-card' key={property.id}>
            <div className='property-photo'>
                {editableProperty === property.id ? (
                    <input
                        className='property-input'
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoChange(e, property.id)}
                    />
                ) : (
                    <img src={property.propertyPhotoURL || 'https://via.placeholder.com/250'} alt={`Property ${property.id}`} />
                )}
            </div>
            <div className='property-info'>
                {editableProperty === property.id
                    ? renderPropertyEditFields(property)
                    : renderPropertyInfo(property)
                }
            </div>
            <div className='property-actions'>
                {editableProperty === property.id ? (
                    <>
                        <button className="save-button" onClick={() => handleSave(property.id)}>Save</button>
                        <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <button className="edit-button" onClick={() => handleEdit(property.id)}>Edit</button>
                )}
                <button className="delete-button" onClick={() => handleDeleteProperty(property.id)}>Delete</button>
            </div>
            <Link to={`/Tenants/${property.id}`} className='tenant-button'>
                Tenants
            </Link>
        </div>
    );

    return (
        <div className='container'>
            <br /><br /><br />
            <div className='property-container'>
                <div className="header">
                    <button className="add-button" onClick={handleAddProperty}>Add Property</button>
                </div>
                {error && <div className="error">{error}</div>}
                <div className='properties-list'>
                    {currentProperties.map(renderProperties)}
                </div>
                <Pagination
                    itemsPerPage={propertiesPerPage}
                    totalItems={properties.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
}

export default Properties;
