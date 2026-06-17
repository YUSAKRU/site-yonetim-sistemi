import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { generateId } from '../utils/helpers';

const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY';

const isMockUserActive = () => {
    return isMockMode || localStorage.getItem('mock_user') !== null;
};

const MOCK_TICKETS = [
    {
        id: 'ticket_1',
        title: 'Asansör Arızası A Blok',
        description: 'A blok sağ asansör 3. kat ile 4. kat arasında takılı kalıyor ve gürültülü çalışıyor.',
        category: 'elevator_fix',
        user_id: 'mock-resident-uid',
        block: 'A',
        flat_no: '12',
        status: 'new',
        assigned_to: null,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        rating: null,
        resolution_time: null
    },
    {
        id: 'ticket_2',
        title: 'Bahçe Sulama Sistemi',
        description: 'Bahçedeki fıskiyelerden biri kırılmış, sürekli su kaçırıyor.',
        category: 'garden',
        user_id: 'mock-resident-uid',
        block: 'A',
        flat_no: '12',
        status: 'in_progress',
        assigned_to: 'mock-staff-uid',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        rating: null,
        resolution_time: null
    },
    {
        id: 'ticket_3',
        title: 'Giriş Kapısı Kilidi',
        description: 'Dış giriş kapısının kart okuyucusu bazen kartları okumuyor.',
        category: 'security',
        user_id: 'mock-resident-uid',
        block: 'A',
        flat_no: '12',
        status: 'resolved',
        assigned_to: 'mock-staff-uid',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        rating: 5,
        resolution_time: '4 saat'
    }
];

if (!localStorage.getItem('mock_tickets')) {
    localStorage.setItem('mock_tickets', JSON.stringify(MOCK_TICKETS));
    localStorage.setItem('mock_logs', JSON.stringify([
        {
            id: 'log_1',
            ticket_id: 'ticket_1',
            action: 'created',
            by_user: 'mock-resident-uid',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            details: 'Talep oluşturuldu',
        },
        {
            id: 'log_2',
            ticket_id: 'ticket_2',
            action: 'created',
            by_user: 'mock-resident-uid',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            details: 'Talep oluşturuldu',
        },
        {
            id: 'log_3',
            ticket_id: 'ticket_2',
            action: 'assigned',
            to: 'mock-staff-uid',
            by_user: 'mock-admin-uid',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
        }
    ]));
}

const getMockTickets = () => {
    return JSON.parse(localStorage.getItem('mock_tickets') || '[]');
};

const saveMockTickets = (tickets) => {
    localStorage.setItem('mock_tickets', JSON.stringify(tickets));
};

/**
 * Create a new ticket
 */
export const createTicket = async (ticketData, userId, userProfile) => {
    if (isMockUserActive()) {
        const tickets = getMockTickets();
        const ticket = {
            ...ticketData,
            id: generateId('ticket'),
            user_id: userId,
            block: userProfile.block,
            flat_no: userProfile.flat_no,
            status: 'new',
            assigned_to: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rating: null,
            resolution_time: null,
        };

        tickets.unshift(ticket);
        saveMockTickets(tickets);

        const logs = JSON.parse(localStorage.getItem('mock_logs') || '[]');
        logs.unshift({
            id: generateId('log'),
            ticket_id: ticket.id,
            action: 'created',
            by_user: userId,
            timestamp: new Date().toISOString(),
            details: 'Talep oluşturuldu',
        });
        localStorage.setItem('mock_logs', JSON.stringify(logs));

        return ticket;
    }

    try {
        const ticket = {
            ...ticketData,
            user_id: userId,
            block: userProfile.block,
            flat_no: userProfile.flat_no,
            status: 'new',
            assigned_to: null,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
            rating: null,
            resolution_time: null,
        };

        const docRef = await addDoc(collection(db, 'tickets'), ticket);

        // Create log entry
        await addDoc(collection(db, 'logs'), {
            ticket_id: docRef.id,
            action: 'created',
            by_user: userId,
            timestamp: Timestamp.now(),
            details: 'Talep oluşturuldu',
        });

        return { id: docRef.id, ...ticket };
    } catch (error) {
        console.error('Create ticket error:', error);
        throw error;
    }
};

/**
 * Upload ticket photo
 */
export const uploadTicketPhoto = async (file, ticketId) => {
    if (isMockUserActive()) {
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500';
    }

    try {
        const fileName = `${ticketId}_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `tickets/${fileName}`);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Upload photo error:', error);
        throw error;
    }
};

/**
 * Get all tickets
 */
export const getAllTickets = async (filters = {}) => {
    if (isMockUserActive()) {
        let list = getMockTickets();

        if (filters.status) {
            list = list.filter(t => t.status === filters.status);
        }

        if (filters.category) {
            list = list.filter(t => t.category === filters.category);
        }

        if (filters.block) {
            list = list.filter(t => t.block === filters.block);
        }

        if (filters.assigned_to) {
            list = list.filter(t => t.assigned_to === filters.assigned_to);
        }

        // Simulating desc order by date
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (filters.limit) {
            list = list.slice(0, filters.limit);
        }

        return list;
    }

    try {
        let q = collection(db, 'tickets');
        const constraints = [];

        if (filters.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters.category) {
            constraints.push(where('category', '==', filters.category));
        }

        if (filters.block) {
            constraints.push(where('block', '==', filters.block));
        }

        if (filters.assigned_to) {
            constraints.push(where('assigned_to', '==', filters.assigned_to));
        }

        constraints.push(orderBy('created_at', 'desc'));

        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }

        if (constraints.length > 0) {
            q = query(q, ...constraints);
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get all tickets error:', error);
        throw error;
    }
};

/**
 * Get user tickets
 */
export const getUserTickets = async (userId) => {
    if (isMockUserActive()) {
        const list = getMockTickets().filter(t => t.user_id === userId);
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list;
    }

    try {
        const q = query(
            collection(db, 'tickets'),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get user tickets error:', error);
        throw error;
    }
};

/**
 * Get staff tickets (assigned to staff)
 */
export const getStaffTickets = async (staffId) => {
    if (isMockUserActive()) {
        const list = getMockTickets().filter(t => t.assigned_to === staffId);
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list;
    }

    try {
        const q = query(
            collection(db, 'tickets'),
            where('assigned_to', '==', staffId),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get staff tickets error:', error);
        throw error;
    }
};

/**
 * Get single ticket
 */
export const getTicket = async (ticketId) => {
    if (isMockUserActive()) {
        const ticket = getMockTickets().find(t => t.id === ticketId);
        if (!ticket) {
            throw new Error('Talep bulunamadı');
        }
        return ticket;
    }

    try {
        const docRef = doc(db, 'tickets', ticketId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Talep bulunamadı');
        }

        return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error('Get ticket error:', error);
        throw error;
    }
};

/**
 * Update ticket
 */
export const updateTicket = async (ticketId, updates, userId) => {
    if (isMockUserActive()) {
        const tickets = getMockTickets();
        const idx = tickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
            tickets[idx] = {
                ...tickets[idx],
                ...updates,
                updated_at: new Date().toISOString(),
            };
            saveMockTickets(tickets);

            const logs = JSON.parse(localStorage.getItem('mock_logs') || '[]');
            logs.unshift({
                id: generateId('log'),
                ticket_id: ticketId,
                action: 'updated',
                by_user: userId,
                timestamp: new Date().toISOString(),
                details: Object.keys(updates).join(', ') + ' güncellendi',
            });
            localStorage.setItem('mock_logs', JSON.stringify(logs));
            return true;
        }
        return false;
    }

    try {
        const docRef = doc(db, 'tickets', ticketId);

        const updateData = {
            ...updates,
            updated_at: Timestamp.now(),
        };

        await updateDoc(docRef, updateData);

        // Create log entry
        await addDoc(collection(db, 'logs'), {
            ticket_id: ticketId,
            action: 'updated',
            by_user: userId,
            timestamp: Timestamp.now(),
            details: Object.keys(updates).join(', ') + ' güncellendi',
        });

        return true;
    } catch (error) {
        console.error('Update ticket error:', error);
        throw error;
    }
};

/**
 * Assign ticket to staff
 */
export const assignTicket = async (ticketId, staffId, adminId) => {
    if (isMockUserActive()) {
        const tickets = getMockTickets();
        const idx = tickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
            tickets[idx] = {
                ...tickets[idx],
                assigned_to: staffId,
                status: 'assigned',
                updated_at: new Date().toISOString(),
            };
            saveMockTickets(tickets);

            const logs = JSON.parse(localStorage.getItem('mock_logs') || '[]');
            logs.unshift({
                id: generateId('log'),
                ticket_id: ticketId,
                action: 'assigned',
                from: null,
                to: staffId,
                by_user: adminId,
                timestamp: new Date().toISOString(),
            });
            localStorage.setItem('mock_logs', JSON.stringify(logs));
            return true;
        }
        return false;
    }

    try {
        const docRef = doc(db, 'tickets', ticketId);

        await updateDoc(docRef, {
            assigned_to: staffId,
            status: 'assigned',
            updated_at: Timestamp.now(),
        });

        // Create log entry
        await addDoc(collection(db, 'logs'), {
            ticket_id: ticketId,
            action: 'assigned',
            from: null,
            to: staffId,
            by_user: adminId,
            timestamp: Timestamp.now(),
        });

        return true;
    } catch (error) {
        console.error('Assign ticket error:', error);
        throw error;
    }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (ticketId, newStatus, userId) => {
    if (isMockUserActive()) {
        const tickets = getMockTickets();
        const idx = tickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
            const oldStatus = tickets[idx].status;
            tickets[idx] = {
                ...tickets[idx],
                status: newStatus,
                updated_at: new Date().toISOString(),
            };

            if (newStatus === 'resolved') {
                tickets[idx].resolved_at = new Date().toISOString();
                const durationHrs = Math.round((new Date() - new Date(tickets[idx].created_at)) / (1000 * 60 * 60)) || 1;
                tickets[idx].resolution_time = `${durationHrs} saat`;
            }

            saveMockTickets(tickets);

            const logs = JSON.parse(localStorage.getItem('mock_logs') || '[]');
            logs.unshift({
                id: generateId('log'),
                ticket_id: ticketId,
                action: 'status_change',
                from: oldStatus,
                to: newStatus,
                by_user: userId,
                timestamp: new Date().toISOString(),
            });
            localStorage.setItem('mock_logs', JSON.stringify(logs));
            return true;
        }
        return false;
    }

    try {
        const docRef = doc(db, 'tickets', ticketId);
        const ticket = await getTicket(ticketId);

        const updateData = {
            status: newStatus,
            updated_at: Timestamp.now(),
        };

        if (newStatus === 'resolved') {
            updateData.resolved_at = Timestamp.now();
        }

        await updateDoc(docRef, updateData);

        // Create log entry
        await addDoc(collection(db, 'logs'), {
            ticket_id: ticketId,
            action: 'status_change',
            from: ticket.status,
            to: newStatus,
            by_user: userId,
            timestamp: Timestamp.now(),
        });

        return true;
    } catch (error) {
        console.error('Update status error:', error);
        throw error;
    }
};

/**
 * Rate ticket
 */
export const rateTicket = async (ticketId, rating, userId) => {
    if (isMockUserActive()) {
        const tickets = getMockTickets();
        const idx = tickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
            tickets[idx] = {
                ...tickets[idx],
                rating,
                status: 'closed',
                updated_at: new Date().toISOString(),
            };
            saveMockTickets(tickets);

            const logs = JSON.parse(localStorage.getItem('mock_logs') || '[]');
            logs.unshift({
                id: generateId('log'),
                ticket_id: ticketId,
                action: 'rated',
                by_user: userId,
                timestamp: new Date().toISOString(),
                details: `${rating} yıldız verildi`,
            });
            localStorage.setItem('mock_logs', JSON.stringify(logs));
            return true;
        }
        return false;
    }

    try {
        const docRef = doc(db, 'tickets', ticketId);

        await updateDoc(docRef, {
            rating,
            status: 'closed',
            updated_at: Timestamp.now(),
        });

        // Create log entry
        await addDoc(collection(db, 'logs'), {
            ticket_id: ticketId,
            action: 'rated',
            by_user: userId,
            timestamp: Timestamp.now(),
            details: `${rating} yıldız verildi`,
        });

        return true;
    } catch (error) {
        console.error('Rate ticket error:', error);
        throw error;
    }
};

/**
 * Delete ticket
 */
export const deleteTicket = async (ticketId) => {
    if (isMockUserActive()) {
        let tickets = getMockTickets();
        tickets = tickets.filter(t => t.id !== ticketId);
        saveMockTickets(tickets);
        return true;
    }

    try {
        await deleteDoc(doc(db, 'tickets', ticketId));
        return true;
    } catch (error) {
        console.error('Delete ticket error:', error);
        throw error;
    }
};

/**
 * Get ticket logs
 */
export const getTicketLogs = async (ticketId) => {
    if (isMockUserActive()) {
        const logs = JSON.parse(localStorage.getItem('mock_logs') || '[]');
        return logs.filter(l => l.ticket_id === ticketId);
    }

    try {
        const q = query(
            collection(db, 'logs'),
            where('ticket_id', '==', ticketId),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get ticket logs error:', error);
        throw error;
    }
};
