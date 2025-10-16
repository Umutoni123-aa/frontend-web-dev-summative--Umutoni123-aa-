/**
 * storage.js - Handles saving and loading data from localStorage
 * This is like a filing cabinet that remembers your transactions!
 */

// Keys for storing different types of data
const STORAGE_KEYS = {
    TRANSACTIONS: 'financeTracker:transactions',
    SETTINGS: 'financeTracker:settings',
    BUDGET: 'financeTracker:budget'
};

/**
 * Load transactions from localStorage
 * Returns an array of transactions, or empty array if none exist
 */
export function loadTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
    }
}

/**
 * Save transactions to localStorage
 * @param {Array} transactions - Array of transaction objects
 */
export function saveTransactions(transactions) {
    try {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        return true;
    } catch (error) {
        console.error('Error saving transactions:', error);
        return false;
    }
}

/**
 * Load settings from localStorage
 * Returns settings object with default values if none exist
 */
export function loadSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (data) {
            return JSON.parse(data);
        }
        // Default settings
        return {
            budgetCap: 500.00,
            currencies: {
                USD: 1.00,
                EUR: 0.85,
                RWF: 1300
            }
        };
    } catch (error) {
        console.error('Error loading settings:', error);
        return {
            budgetCap: 500.00,
            currencies: {
                USD: 1.00,
                EUR: 0.85,
                RWF: 1300
            }
        };
    }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object
 */
export function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Clear all data from localStorage
 */
export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.BUDGET);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

/**
 * Export transactions as JSON string
 * @param {Array} transactions - Array of transactions to export
 * @returns {string} JSON string
 */
export function exportToJSON(transactions) {
    try {
        return JSON.stringify(transactions, null, 2);
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        return null;
    }
}

/**
 * Import transactions from JSON string
 * @param {string} jsonString - JSON string to parse
 * @returns {Array|null} Array of transactions or null if invalid
 */
export function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // Validate that it's an array
        if (!Array.isArray(data)) {
            throw new Error('Invalid format: expected an array');
        }
        
        // Validate each transaction has required fields
        for (const item of data) {
            if (!item.id || !item.description || item.amount === undefined || !item.category || !item.date) {
                throw new Error('Invalid transaction format: missing required fields');
            }
        }
        
        return data;
    } catch (error) {
        console.error('Error importing from JSON:', error);
        return null;
    }
}