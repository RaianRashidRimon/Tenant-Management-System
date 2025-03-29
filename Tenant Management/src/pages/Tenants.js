import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../components/App.css';
import { getFirestore, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

function Tenants() {
    const { propertyId } = useParams();
    const [tenants, setTenants] = useState([]);
    const [error, setError] = useState(null);
    const [editableTenant, setEditableTenant] = useState(null);
    const [editedTenants, setEditedTenants] = useState({});
    const [currentPage] = useState(1);
    const [tenantsPerPage] = useState(10);
    const firestore = getFirestore();

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(firestore, 'properties', propertyId, 'tenants')), (snapshot) => {
            const updatedTenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTenants(updatedTenants);
        }, (error) => {
            console.error('Error fetching tenants:', error);
            setError('Error fetching tenants. Please try again later.');
        });

        return () => unsubscribe();
    }, [firestore, propertyId]);

    const handleAddTenant = async () => {
        try {
            await addDoc(collection(firestore, 'properties', propertyId, 'tenants'), {
                tenantName: '',
                tenantAge: 0,
                tenantDocumentsURL: [],
                tenantPhotoURL: ''
            });
        } catch (error) {
            console.error('Error adding tenant:', error);
        }
    };

    const handleEditTenant = (tenantId) => {
        setEditableTenant(tenantId);
        setEditedTenants({ [tenantId]: { ...tenants.find(tenant => tenant.id === tenantId) } });
    };

    const handleSaveTenant = async (tenantId) => {
        try {
            const tenantRef = doc(firestore, 'properties', propertyId, 'tenants', tenantId);
            await updateDoc(tenantRef, editedTenants[tenantId]);
            setEditableTenant(null);
            setEditedTenants({});
        } catch (error) {
            console.error('Error saving tenant:', error);
        }
    };

    const handleDeleteTenant = async (tenantId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this tenant?');
        if (confirmDelete) {
            try {
                const tenantRef = doc(firestore, 'properties', propertyId, 'tenants', tenantId);
                await deleteDoc(tenantRef);
            } catch (error) {
                console.error('Error deleting tenant:', error);
            }
        }
    };

    const handleInputChange = (e, tenantId, field) => {
        const value = field === 'tenantAge' ? parseInt(e.target.value) : e.target.value;
        if (field === 'tenantAge' && value < 0) return;
        setEditedTenants({
            ...editedTenants,
            [tenantId]: {
                ...editedTenants[tenantId],
                [field]: value
            }
        });
    };

    const handlePhotoChange = (e, tenantId) => {
        const file = e.target.files[0];
        if (!file || !(file instanceof Blob)) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setEditedTenants({
                ...editedTenants,
                [tenantId]: {
                    ...editedTenants[tenantId],
                    tenantPhotoURL: reader.result
                }
            });
        };
        reader.readAsDataURL(file);
    };

    const handleDocumentsChange = (e, tenantId) => {
        const files = Array.from(e.target.files);
        const newDocuments = [];

        files.forEach(file => {
            if (!(file instanceof Blob)) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                newDocuments.push(reader.result);
                if (newDocuments.length === files.length) {
                    setEditedTenants(prevState => ({
                        ...prevState,
                        [tenantId]: {
                            ...prevState[tenantId],
                            tenantDocumentsURL: newDocuments
                        }
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const renderTenantFields = (tenant) => (
        <>
            <td>
                <input className='tenant-input'
                       type="text"
                       value={editedTenants[tenant.id]?.tenantName || ''}
                       onChange={(e) => handleInputChange(e, tenant.id, 'tenantName')}
                />
            </td>
            <td>
                <input className='tenant-input'
                       type="number"
                       value={editedTenants[tenant.id]?.tenantAge || 0}
                       onChange={(e) => handleInputChange(e, tenant.id, 'tenantAge')}
                />
            </td>
            <td>
                <input className='documents-input'
                       type="file"
                       multiple
                       onChange={(e) => handleDocumentsChange(e, tenant.id)}
                />
            </td>
            <td>
                <input className='photo-input'
                       type="file"
                       accept="image/*"
                       onChange={(e) => handlePhotoChange(e, tenant.id)}
                />
            </td>
        </>
    );

    const renderTenantInfo = (tenant) => (
        <>
            <td>{tenant.tenantName}</td>
            <td>{tenant.tenantAge}</td>
            <td>
                {tenant.tenantDocumentsURL.map((doc, index) => (
                    <a key={index} href={doc} target="_blank" rel="noopener noreferrer">Document {index + 1}</a>
                ))}
            </td>
            <td className='photo-preview'>
                {tenant.tenantPhotoURL && <img src={tenant.tenantPhotoURL} alt={`Tenant ${tenant.id}`} width={50} />}
            </td>
        </>
    );

    const indexOfLastTenant = currentPage * tenantsPerPage;
    const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
    const currentTenants = tenants.slice(indexOfFirstTenant, indexOfLastTenant);

    return (
        <div className='container'>
            <br/><br/><br/>
            <div className='tenant-container'>
                <h2 className='tittle'>Tenants</h2>
                <div className='actions'>
                    <Link to="/properties" className='button-go-back'>&#8592; Back</Link>
                    <button className='button-add-tenant' onClick={handleAddTenant}>Add Tenant</button>
                </div>
                {error && <div className="error">{error}</div>}
                <div className='tenant-list'>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Documents</th>
                            <th>Photo</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody className='tenants-list'>
                        {currentTenants.map(tenant => (
                            <tr key={tenant.id}>
                                {editableTenant === tenant.id ? renderTenantFields(tenant) : renderTenantInfo(tenant)}
                                <td>
                                    {editableTenant === tenant.id ? (
                                        <>
                                            <button className='button-save-button' onClick={() => handleSaveTenant(tenant.id)}>Save</button>
                                            <button className='button-cancel-button' onClick={() => setEditableTenant(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className='button-edit-button' onClick={() => handleEditTenant(tenant.id)}>Edit</button>
                                        </>
                                    )}
                                    <button className='button-delete-button' onClick={() => handleDeleteTenant(tenant.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Tenants;
