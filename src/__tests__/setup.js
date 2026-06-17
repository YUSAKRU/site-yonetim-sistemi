import '@testing-library/jest-dom';

const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

if (typeof window !== 'undefined') {
    try {
        Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true, configurable: true });
    } catch (e) {
        window.localStorage = mockLocalStorage;
    }
}

try {
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true, configurable: true });
} catch (e) {
    global.localStorage = mockLocalStorage;
}

