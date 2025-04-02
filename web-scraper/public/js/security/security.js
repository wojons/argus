/**
 * Advanced Web Scraper with LLM Integration
 * Security Module - Handles secure storage of API keys using IndexedDB
 */

// Database name and version
const DB_NAME = 'WebScraperSecureDB';
const DB_VERSION = 1;
const API_KEYS_STORE = 'apiKeys';

/**
 * Initialize the IndexedDB database
 * @returns {Promise} A promise that resolves when the database is ready
 */
function initializeDB() {
    return new Promise((resolve, reject) => {
        // Open the database
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        // Handle database upgrade (first time or version change)
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store for API keys if it doesn't exist
            if (!db.objectStoreNames.contains(API_KEYS_STORE)) {
                const store = db.createObjectStore(API_KEYS_STORE, { keyPath: 'service' });
                console.log('API keys object store created');
            }
        };
        
        // Handle success
        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };
        
        // Handle error
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(new Error('Failed to open database: ' + event.target.error.message));
        };
    });
}

/**
 * Save an API key securely in IndexedDB
 * @param {string} apiKey - The API key to save
 * @param {string} service - The service name (default: 'openrouter')
 * @returns {Promise} A promise that resolves when the key is saved
 */
function saveApiKey(apiKey, service = 'openrouter') {
    return new Promise((resolve, reject) => {
        // Basic validation
        if (!apiKey) {
            reject(new Error('API key cannot be empty'));
            return;
        }
        
        // Initialize the database
        initializeDB()
            .then(db => {
                // Start a transaction
                const transaction = db.transaction([API_KEYS_STORE], 'readwrite');
                const store = transaction.objectStore(API_KEYS_STORE);
                
                // Encrypt the API key before storing (in a real app, use a more secure encryption)
                // For this demo, we'll use a simple encoding as a placeholder
                // In a production environment, consider using the Web Crypto API
                const encryptedKey = btoa(apiKey); // Base64 encoding (NOT secure encryption)
                
                // Store the API key
                const request = store.put({ service, key: encryptedKey });
                
                request.onsuccess = () => {
                    resolve();
                };
                
                request.onerror = (event) => {
                    console.error('Error saving API key:', event.target.error);
                    reject(new Error('Failed to save API key: ' + event.target.error.message));
                };
                
                // Close the database when the transaction is complete
                transaction.oncomplete = () => {
                    db.close();
                };
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Get an API key from IndexedDB
 * @param {string} service - The service name (default: 'openrouter')
 * @returns {Promise<string|null>} A promise that resolves with the API key or null if not found
 */
function getApiKey(service = 'openrouter') {
    return new Promise((resolve, reject) => {
        // Initialize the database
        initializeDB()
            .then(db => {
                // Start a transaction
                const transaction = db.transaction([API_KEYS_STORE], 'readonly');
                const store = transaction.objectStore(API_KEYS_STORE);
                
                // Get the API key
                const request = store.get(service);
                
                request.onsuccess = () => {
                    const result = request.result;
                    if (result && result.key) {
                        // Decrypt the API key
                        try {
                            const decryptedKey = atob(result.key); // Base64 decoding
                            resolve(decryptedKey);
                        } catch (error) {
                            console.error('Error decrypting API key:', error);
                            reject(new Error('Failed to decrypt API key'));
                        }
                    } else {
                        resolve(null); // No API key found
                    }
                };
                
                request.onerror = (event) => {
                    console.error('Error getting API key:', event.target.error);
                    reject(new Error('Failed to get API key: ' + event.target.error.message));
                };
                
                // Close the database when the transaction is complete
                transaction.oncomplete = () => {
                    db.close();
                };
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Delete an API key from IndexedDB
 * @param {string} service - The service name (default: 'openrouter')
 * @returns {Promise} A promise that resolves when the key is deleted
 */
function deleteApiKey(service = 'openrouter') {
    return new Promise((resolve, reject) => {
        // Initialize the database
        initializeDB()
            .then(db => {
                // Start a transaction
                const transaction = db.transaction([API_KEYS_STORE], 'readwrite');
                const store = transaction.objectStore(API_KEYS_STORE);
                
                // Delete the API key
                const request = store.delete(service);
                
                request.onsuccess = () => {
                    resolve();
                };
                
                request.onerror = (event) => {
                    console.error('Error deleting API key:', event.target.error);
                    reject(new Error('Failed to delete API key: ' + event.target.error.message));
                };
                
                // Close the database when the transaction is complete
                transaction.oncomplete = () => {
                    db.close();
                };
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Clear all stored data from IndexedDB
 * @returns {Promise} A promise that resolves when all data is cleared
 */
function clearStorage() {
    return new Promise((resolve, reject) => {
        // Initialize the database
        initializeDB()
            .then(db => {
                // Start a transaction
                const transaction = db.transaction([API_KEYS_STORE], 'readwrite');
                const store = transaction.objectStore(API_KEYS_STORE);
                
                // Clear all data
                const request = store.clear();
                
                request.onsuccess = () => {
                    resolve();
                };
                
                request.onerror = (event) => {
                    console.error('Error clearing storage:', event.target.error);
                    reject(new Error('Failed to clear storage: ' + event.target.error.message));
                };
                
                // Close the database when the transaction is complete
                transaction.oncomplete = () => {
                    db.close();
                };
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Check if IndexedDB is supported by the browser
 * @returns {boolean} True if IndexedDB is supported, false otherwise
 */
function isIndexedDBSupported() {
    return !!window.indexedDB;
}

// Make functions available globally
window.saveApiKey = saveApiKey;
window.getApiKey = getApiKey;
window.deleteApiKey = deleteApiKey;
window.clearStorage = clearStorage;

// Log a warning if IndexedDB is not supported
if (!isIndexedDBSupported()) {
    console.error('IndexedDB is not supported by this browser. API key storage will not work.');
    if (window.WebScraper && window.WebScraper.UI) {
        window.WebScraper.UI.logMessage('Your browser does not support secure storage. API key storage will not work.', 'error');
    }
}

// Export the security module
window.WebScraper = window.WebScraper || {};
window.WebScraper.Security = {
    saveApiKey,
    getApiKey,
    deleteApiKey,
    clearStorage,
    isIndexedDBSupported
};
