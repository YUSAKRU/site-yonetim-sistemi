import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY';

const authSubscribers = new Set();

const notifyAuthSubscribers = (user) => {
    authSubscribers.forEach((callback) => {
        try {
            callback(user);
        } catch (e) {
            console.error('Error in auth subscriber callback:', e);
        }
    });
};

export const MOCK_USERS = {
    'admin@site.com': {
        uid: 'mock-admin-uid',
        email: 'admin@site.com',
        full_name: 'Site Yöneticisi',
        role: 'admin',
        block: 'A',
        flat_no: '0'
    },
    'staff@site.com': {
        uid: 'mock-staff-uid',
        email: 'staff@site.com',
        full_name: 'Örnek Personel',
        role: 'staff',
        block: 'B',
        flat_no: '0'
    },
    'resident@site.com': {
        uid: 'mock-resident-uid',
        email: 'resident@site.com',
        full_name: 'Örnek Sakin',
        role: 'resident',
        block: 'A',
        flat_no: '12'
    }
};

/**
 * Sign in with email and password
 */
export const loginUser = async (email, password) => {
    // Hybrid Mode: Always allow instant login for the predefined test accounts with any password
    const mockUser = MOCK_USERS[email];
    if (mockUser) {
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        notifyAuthSubscribers(mockUser);
        return mockUser;
    }

    if (isMockMode) {
        throw new Error('Giriş başarısız. Email veya şifrenizi kontrol edin.');
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            throw new Error('Kullanıcı profili bulunamadı');
        }

        return {
            uid: user.uid,
            email: user.email,
            ...userDoc.data(),
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
    localStorage.removeItem('mock_user');
    notifyAuthSubscribers(null);

    if (isMockMode) {
        return;
    }

    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
    if (isMockMode || MOCK_USERS[email]) {
        return true;
    }

    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async (uid) => {
    // If local mock session is active
    const stored = localStorage.getItem('mock_user');
    if (stored) {
        const mockUser = JSON.parse(stored);
        if (mockUser.uid === uid) {
            return mockUser;
        }
    }

    if (isMockMode) {
        return null;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            return null;
        }

        return {
            uid,
            ...userDoc.data(),
        };
    } catch (error) {
        console.error('Get user profile error:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, data) => {
    const stored = localStorage.getItem('mock_user');
    if (stored) {
        const user = JSON.parse(stored);
        if (user.uid === uid) {
            const updated = { ...user, ...data };
            localStorage.setItem('mock_user', JSON.stringify(updated));
            return true;
        }
    }

    if (isMockMode) {
        return true;
    }

    try {
        await setDoc(doc(db, 'users', uid), data, { merge: true });

        // Update auth profile if display name changed
        if (data.full_name && auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: data.full_name,
            });
        }

        return true;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
    authSubscribers.add(callback);

    // Initial state setup
    const stored = localStorage.getItem('mock_user');
    if (stored) {
        callback(JSON.parse(stored));
    } else if (isMockMode) {
        callback(null);
    }

    let unsubscribeFirebase = () => {};
    if (!isMockMode) {
        unsubscribeFirebase = onAuthStateChanged(auth, async (user) => {
            // Only update via Firebase if no mock session exists
            if (!localStorage.getItem('mock_user')) {
                if (user) {
                    const profile = await getCurrentUserProfile(user.uid);
                    callback(profile);
                } else {
                    callback(null);
                }
            }
        });
    }

    return () => {
        authSubscribers.delete(callback);
        unsubscribeFirebase();
    };
};

/**
 * Check if user has role
 */
export const hasRole = (user, role) => {
    if (!user) return false;
    return user.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
    return hasRole(user, 'admin');
};

/**
 * Check if user is staff
 */
export const isStaff = (user) => {
    return hasRole(user, 'staff');
};

/**
 * Check if user is resident
 */
export const isResident = (user) => {
    return hasRole(user, 'resident');
};
