import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MOCK_USERS } from './authService';

const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY';

const isMockUserActive = () => {
    return isMockMode || localStorage.getItem('mock_user') !== null;
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
    if (isMockUserActive()) {
        return Object.values(MOCK_USERS);
    }

    try {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get all users error:', error);
        throw error;
    }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
    if (isMockUserActive()) {
        return Object.values(MOCK_USERS).filter(u => u.role === role);
    }

    try {
        const q = query(collection(db, 'users'), where('role', '==', role));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get users by role error:', error);
        throw error;
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (uid) => {
    if (isMockUserActive()) {
        const user = Object.values(MOCK_USERS).find(u => u.uid === uid);
        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }
        return user;
    }

    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Kullanıcı bulunamadı');
        }

        return { uid: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

/**
 * Create user profile
 */
export const createUserProfile = async (uid, userData) => {
    if (isMockUserActive()) {
        return true;
    }

    try {
        await setDoc(doc(db, 'users', uid), {
            ...userData,
            created_at: new Date(),
        });
        return true;
    } catch (error) {
        console.error('Create user profile error:', error);
        throw error;
    }
};

/**
 * Update user
 */
export const updateUser = async (uid, updates) => {
    if (isMockUserActive()) {
        return true;
    }

    try {
        const docRef = doc(db, 'users', uid);
        await updateDoc(docRef, {
            ...updates,
            updated_at: new Date(),
        });
        return true;
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};

/**
 * Delete user
 */
export const deleteUser = async (uid) => {
    if (isMockUserActive()) {
        return true;
    }

    try {
        await deleteDoc(doc(db, 'users', uid));
        return true;
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
};

/**
 * Get staff members
 */
export const getStaffMembers = async () => {
    return getUsersByRole('staff');
};

/**
 * Get residents
 */
export const getResidents = async () => {
    return getUsersByRole('resident');
};
