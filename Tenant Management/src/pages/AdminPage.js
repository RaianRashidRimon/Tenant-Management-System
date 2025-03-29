import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, deleteDoc, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const AdminPage = () => {
    const navigate = useNavigate();
    const [queries, setQueries] = useState([]);
    const [propertyOwners, setPropertyOwners] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [markedPaidOwners, setMarkedPaidOwners] = useState([]);
    getAuth();
    const firestore = getFirestore();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
            navigate('/AdminLogIn');
        } else {
            fetchQueries()
                .then(() => console.log("Queries fetched successfully!"))
                .catch(err => setError(err.message));
            fetchPropertyOwners()
                .then(() => console.log("Property owners fetched successfully!"))
                .catch(err => setError(err.message));
            fetchUsers()
                .then(() => console.log("Users fetched successfully!"))
                .catch(err => setError(err.message));
        }
    }, [navigate]);

    const fetchQueries = async () => {
        try {
            const queriesCollection = collection(firestore, 'queries');
            const querySnapshot = await getDocs(queriesCollection);
            const queriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQueries(queriesData);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchPropertyOwners = async () => {
        try {
            const ownersCollection = collection(firestore, 'ownerPayments');
            const ownersSnapshot = await getDocs(ownersCollection);
            const ownersData = ownersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPropertyOwners(ownersData);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersCollection = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        } catch (error) {
            setError(error.message);
        }
    };

    const deleteQuery = async (queryId) => {
        try {
            await deleteDoc(doc(firestore, 'queries', queryId));
            setQueries(prevQueries => prevQueries.filter(query => query.id !== queryId));
        } catch (error) {
            setError(error.message);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const confirmed = window.confirm(`Are you sure you want to delete the user?`);
            if (confirmed) {
                await deleteDoc(doc(firestore, 'users', userId));
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const markAsPaid = async (ownerId, userId) => {
        try {
            const ownerPaymentsRef = doc(firestore, 'ownerPayments', ownerId);
            await updateDoc(ownerPaymentsRef, { status: 'paid' });

            // Filter out the marked owner from the propertyOwners state
            setPropertyOwners(prevOwners =>
                prevOwners.filter(owner => owner.id !== ownerId)
            );

            setMarkedPaidOwners(prev => [...prev, ownerId]);

            setTimeout(() => {
                setMarkedPaidOwners(prev => prev.filter(id => id !== ownerId));
            }, 4000);
        } catch (error) {
            setError(error.message);
        }
    };


    const undoMarkAsPaid = async (memberID) => {
        try {
            const ownerPaymentsQuery = collection(firestore, 'ownerPayments');
            const querySnapshot = await getDocs(ownerPaymentsQuery);
            const ownerDoc = querySnapshot.docs.find(doc => doc.data().memberID === memberID);

            if (ownerDoc) {
                const ownerId = ownerDoc.id;
                await updateDoc(doc(firestore, 'ownerPayments', ownerId), { status: 'unpaid' });

                setPropertyOwners(prevOwners =>
                    prevOwners.map(owner =>
                        owner.id === ownerId ? { ...owner, status: 'unpaid' } : owner
                    )
                );
                setMarkedPaidOwners(prev => prev.filter(id => id !== memberID));
            } else {
                setError('Owner not found');
            }
        } catch (error) {
            setError(error.message);
        }
    };


    const exitAdminMode = () => {
        localStorage.setItem('isAdmin', 'false');
        navigate('/AdminLogIn');
    };

    return (
        <div className='container'>
            <div className="admin-page">
                <div className="admin-content">
                    <h1>Welcome to Admin Page</h1>
                    <button className='admin-exit-button' onClick={exitAdminMode}>&larr; Exit Admin Mode</button>
                    <div className='admin-content-box'>
                        <div className='admin-left'>
                            <div className='admin-section-queries'>
                                <h2>Queries</h2>
                                <div className='admin-list'>
                                    {queries.map(query => (
                                        <div key={query.id} className='admin-list-item'>
                                            <p>{query.queryMessage}</p>
                                            <button className='admin-delete-button' onClick={() => deleteQuery(query.id)}>Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='admin-section-owner-profile'>
                                <h2>User Profiles</h2>
                                <div className='admin-list'>
                                    {users.map(user => (
                                        <div key={user.id} className='admin-list-item'>
                                            <p>{user.username} - Email: {user.email}</p>
                                            <button className='admin-delete-button'
                                                    onClick={() => deleteUser(user.id)}>Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='admin-right'>
                            <div className='admin-section-owner-payment'>
                                <h2>Property Owners Yearly Payment</h2>
                                <div className='admin-list-payment'>
                                    {Array.isArray(propertyOwners) && propertyOwners
                                        .filter(owner => owner.status === 'unpaid')
                                        .map(owner => (
                                            <div key={owner.id} className='admin-list-item'>
                                                <p>Member ID: {owner.memberID} </p>
                                                {owner.status !== 'paid' && (
                                                    <button className='admin-mark-button'
                                                            onClick={() => markAsPaid(owner.id, owner.memberID)}>Mark as
                                                        Paid</button>
                                                )}
                                                {markedPaidOwners.includes(owner.id) && (
                                                    <button className='admin-undo-button'
                                                            onClick={() => undoMarkAsPaid(owner.id)}>Undo</button>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>

                        </div>
                        {error && <p className='admin-error-message'>Error: {error}</p>}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminPage;
