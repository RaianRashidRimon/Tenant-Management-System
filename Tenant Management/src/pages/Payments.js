// import React, { useState, useEffect } from 'react';
// import '../components/App.css';
// import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
//
// function Payments() {
//     const firestore = getFirestore();
//     const auth = getAuth();
//     const [tenantPayments, setTenantPayments] = useState([]);
//     const [ownerPayments, setOwnerPayments] = useState([]);
//     const currentMonth = useState(new Date().getMonth())[0];
//     const currentYear = useState(new Date().getFullYear())[0];
//     const [error, setError] = useState(null);
//     const [showUndoOption, setShowUndoOption] = useState(false);
//     const [paidTenantId, setPaidTenantId] = useState(null);
//
//     useEffect(() => {
//         const user = auth.currentUser;
//         if (user) {
//             const userId = user.uid;
//
//             // Fetch tenant payments
//             const tenantPaymentsQuery = query(
//                 collection(firestore, 'payments'),
//                 where('userId', '==', userId),
//                 where('status', '==', 'due')
//             );
//
//             const unsubscribeTenantPayments = onSnapshot(tenantPaymentsQuery, (snapshot) => {
//                 const tenantPaymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 setTenantPayments(tenantPaymentsData);
//             }, (error) => {
//                 console.error('Error fetching tenant payments:', error);
//                 setError('Error fetching tenant payments. Please try again later.');
//             });
//
//             // Fetch owner payments
//             const ownerPaymentsQuery = query(
//                 collection(firestore, 'ownerPayments'),
//                 where('userId', '==', userId)
//             );
//
//             const unsubscribeOwnerPayments = onSnapshot(ownerPaymentsQuery, (snapshot) => {
//                 const ownerPaymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 setOwnerPayments(ownerPaymentsData);
//             }, (error) => {
//                 console.error('Error fetching owner payments:', error);
//                 setError('Error fetching owner payments. Please try again later.');
//             });
//
//             return () => {
//                 unsubscribeTenantPayments();
//                 unsubscribeOwnerPayments();
//             };
//         }
//     }, [firestore, auth]);
//
//     const handlePaid = async (tenantId) => {
//         try {
//             const paymentRef = doc(firestore, 'payments', tenantId);
//             await updateDoc(paymentRef, { status: 'paid', paymentDate: new Date() });
//
//             // Store the paid tenant ID and display Undo option
//             setPaidTenantId(tenantId);
//             setShowUndoOption(true);
//             // Filter out the paid tenant
//             setTenantPayments(tenantPayments.filter(tenant => tenant.id !== tenantId));
//
//             setTimeout(() => {
//                 setShowUndoOption(false);
//                 setPaidTenantId(null);
//             }, 4000);
//
//         } catch (error) {
//             console.error('Error marking payment as paid:', error);
//             setError('Error marking payment as paid.');
//         }
//     };
//
//     const handleUndo = async () => {
//         if (paidTenantId) {
//             try {
//                 const paymentRef = doc(firestore, 'payments', paidTenantId);
//                 await updateDoc(paymentRef, { status: 'due' });
//
//                 // Restore the paid tenant to the list
//                 const paidTenant = tenantPayments.find(tenant => tenant.id === paidTenantId);
//                 if (paidTenant) {
//                     setTenantPayments([...tenantPayments, paidTenant]);
//                 }
//                 setShowUndoOption(false);
//                 setPaidTenantId(null);
//             } catch (error) {
//                 console.error('Error undoing payment:', error);
//                 setError('Error undoing payment.');
//             }
//         }
//     };
//
//     const monthNames = [
//         'January', 'February', 'March', 'April', 'May', 'June', 'July',
//         'August', 'September', 'October', 'November', 'December'
//     ];
//
//     return (
//         <div className='container'>
//             {error && <div className="error">{error}</div>}
//             <div className='payment-container'>
//                 <div className='tenant'>
//                     <h2>Tenant Payments - {monthNames[currentMonth]} {currentYear}</h2>
//                     <div className='scrollable'>
//                         <table className="tenant-payment-table">
//                             <thead>
//                             <tr>
//                                 <th>Tenant Name</th>
//                                 <th>Property</th>
//                                 <th>Monthly Payment</th>
//                                 <th>Action</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {tenantPayments.length > 0 ? (
//                                 tenantPayments.map(tenant => (
//                                     <tr key={tenant.id}>
//                                         <td>{tenant.tenantName}</td>
//                                         <td>{tenant.propertyName}</td>
//                                         <td>${tenant.monthlyLease}</td>
//                                         <td>
//                                             <button onClick={() => handlePaid(tenant.id)}>Paid</button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="4">No pending payments</td>
//                                 </tr>
//                             )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div className='owner'>
//                     <h2>Your Yearly Payment History</h2>
//                     <div className='scrollable'>
//                         <table className="owner-payment-table">
//                             <thead>
//                             <tr>
//                                 <th>Year</th>
//                                 <th>Amount</th>
//                                 <th>Date Paid</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {ownerPayments.length > 0 ? (
//                                 ownerPayments.map(payment => (
//                                     <tr key={payment.id}>
//                                         <td>{new Date(payment.paymentDate.seconds * 1000).getFullYear()}</td>
//                                         <td>${payment.amount}</td>
//                                         <td>{new Date(payment.paymentDate.seconds * 1000).toLocaleDateString()}</td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="3">No payment history</td>
//                                 </tr>
//                             )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//             {showUndoOption && (
//                 <div className="undo-option">
//                     <button onClick={handleUndo} className="undo-button">Undo</button>
//                     <p className="undo-message">Undo action available for 4 seconds</p>
//                 </div>
//             )}
//         </div>
//     );
// }
//
// export default Payments;

import React, { useState, useEffect } from 'react';
import '../components/App.css';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function Payments() {
    const firestore = getFirestore();
    const auth = getAuth();
    const [tenantPayments, setTenantPayments] = useState([]);
    const [ownerPayments, setOwnerPayments] = useState([]);
    const currentMonth = useState(new Date().getMonth())[0];
    const currentYear = useState(new Date().getFullYear())[0];
    const [error, setError] = useState(null);
    const [showUndoOption, setShowUndoOption] = useState(false);
    const [paidTenantId, setPaidTenantId] = useState(null);

    // Dummy data for tenant payments
    useEffect(() => {
        setTenantPayments([
            { id: '1', tenantName: 'Mamunur Roshid', propertyName: 'House #3 Road #2', monthlyLease: 18000, status: 'due' },
            { id: '2', tenantName: 'Md. Mahfuzur Rahman', propertyName: 'House # 4 Road #20', monthlyLease: 20000, status: 'due' },


        ]);

        // Dummy data for owner payments
        setOwnerPayments([
            { id: '1', paymentDate: { seconds: 1640995200 }, amount: 3000 }, // Jan 1, 2022
            { id: '2', paymentDate: { seconds: 1672531200 }, amount: 3200 }, // Jan 1, 2023
        ]);
    }, []);

    const handlePaid = async (tenantId) => {
        try {
            // Simulate updating payment status in Firestore
            const paymentIndex = tenantPayments.findIndex(tenant => tenant.id === tenantId);
            if (paymentIndex !== -1) {
                const updatedPayments = [...tenantPayments];
                updatedPayments[paymentIndex].status = 'paid';
                updatedPayments[paymentIndex].paymentDate = new Date();

                // Store the paid tenant ID and display Undo option
                setPaidTenantId(tenantId);
                setShowUndoOption(true);
                // Filter out the paid tenant
                setTenantPayments(updatedPayments.filter(tenant => tenant.id !== tenantId));

                setTimeout(() => {
                    setShowUndoOption(false);
                    setPaidTenantId(null);
                }, 4000);
            }

        } catch (error) {
            //console.error('Error marking payment as paid:', error);
            //setError('Error marking payment as paid.');
        }
    };

    const handleUndo = () => {
        if (paidTenantId) {
            try {
                // Find the paid tenant in the owner payments array
                const paidTenant = tenantPayments.find(tenant => tenant.id === paidTenantId);
                if (paidTenant) {
                    // Restore the paid tenant to the list
                    setTenantPayments([...tenantPayments, paidTenant]);
                }

                // Reset paidTenantId and showUndoOption
                setPaidTenantId(null);
                setShowUndoOption(false);
            } catch (error) {
                console.error('Error undoing payment:', error);
                setError('Error undoing payment.');
            }
        }
    };


    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className='container'>
            {error && <div className="error">{error}</div>}
            <div className='payment-container'>
                <div className='tenant'>
                    <h2>Tenant Payments - {monthNames[currentMonth]} {currentYear}</h2>
                    <div className='scrollable'>
                        <table className="tenant-payment-table">
                            <thead>
                            <tr>
                                <th>Tenant Name</th>
                                <th>Property</th>
                                <th>Monthly Payment</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tenantPayments.length > 0 ? (
                                tenantPayments.map(tenant => (
                                    <tr key={tenant.id}>
                                        <td>{tenant.tenantName}</td>
                                        <td>{tenant.propertyName}</td>
                                        <td>Tk{tenant.monthlyLease}</td>
                                        <td>
                                            <button onClick={() => handlePaid(tenant.id)}>Paid</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No pending payments</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='owner'>
                    <h2>Your Yearly Payment History</h2>
                    <div className='scrollable'>
                        <table className="owner-payment-table">
                            <thead>
                            <tr>
                                <th>Year</th>
                                <th>Amount</th>
                                <th>Date Paid</th>
                            </tr>
                            </thead>
                            <tbody>
                            {ownerPayments.length > 0 ? (
                                ownerPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>{new Date(payment.paymentDate.seconds * 1000).getFullYear()}</td>
                                        <td>${payment.amount}</td>
                                        <td>{new Date(payment.paymentDate.seconds * 1000).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No payment history</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {showUndoOption && (
                    <div className="undo-option">
                        <button onClick={handleUndo} className="undo-button">Undo</button>
                        <p className="undo-message">available for 4 s</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Payments;
