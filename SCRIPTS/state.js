/**
 * state.js - Manages the application state (the "brain" of the app!)
 * This keeps track of all transactions and settings
 */

import { loadTransactions, saveTransactions, loadSettings, saveSettings } from './storage.js';

/**
 * Application State - This is where we keep everything!
 */
let state = {
    transactions: [],
    settings: {
        budgetCap: 500.00,
        currencies: {
            USD: 1.00,
            EUR: 0.85,
            RWF: 1350
        }
    },
    currentEditId: null, // Which transaction is being edited (if any)
    filters: {
        searchPattern: '',
        sortBy: 'date-desc',
        caseSensitive: false
    }
};

/**
 * Initialize the state
 */
export function initializeState() {
    state.transactions = loadTransactions();
    state.settings = loadSettings();
    console.log('State initialized:', state);
}

/**
 * Get all transactions
 * @returns {Array} Array of all transactions
 */
export function getTransactions() {
    return [...state.transactions]; // Return a copy
}

/**
 * Get a single transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Object|null} Transaction object or null
 */
export function getTransactionById(id) {
    return state.transactions.find(t => t.id === id) || null;
}

/**
 * Add a new transaction
 * @param {Object} transactionData - {description, amount, category, date}
 * @returns {Object} The newly created transaction
 */
export function addTransaction(transactionData) {
    // Generate a unique ID
    const id = generateId();
    
    // Get timestamp
    const now = new Date().toISOString();
    
    // Create the transaction object
    const transaction = {
        id: id,
        description: transactionData.description.trim(),
        amount: parseFloat(transactionData.amount),
        category: transactionData.category,
        date: transactionData.date,
        createdAt: now,
        updatedAt: now
    };
    
    // Add to state
    state.transactions.push(transaction);
    
    // Save to localStorage
    saveTransactions(state.transactions);
    
    console.log('Transaction added:', transaction);
    return transaction;
}

/**
 * Update transaction
 * @param {string} id - Transaction ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated transaction or null if not found
 */
export function updateTransaction(id, updates) {
    const index = state.transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
        console.error('Transaction not found:', id);
        return null;
    }
    
    // Update the transaction
    state.transactions[index] = {
        ...state.transactions[index],
        description: updates.description.trim(),
        amount: parseFloat(updates.amount),
        category: updates.category,
        date: updates.date,
        updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveTransactions(state.transactions);
    
    console.log('Transaction updated:', state.transactions[index]);
    return state.transactions[index];
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteTransaction(id) {
    const index = state.transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
        console.error('Transaction not found, try again!:', id);
        return false;
    }
    
    // Remove from array
    state.transactions.splice(index, 1);
    
    // Save to localStorage
    saveTransactions(state.transactions);
    
    console.log('Transaction deleted successfully!:', id);
    return true;
}

/**
 * Get settings
 * @returns {Object} Settings object
 */
export function getSettings() {
    return { ...state.settings }; // Return
}

/**
 * Update settings
 * @param {Object} newSettings - New settings to merge
 * @returns {Object} Updated settings
 */
export function updateSettings(newSettings) {
    state.settings = {
        ...state.settings,
        ...newSettings
    };
    
    // Save to localStorage
    saveSettings(state.settings);
    
    console.log('Settings updated:', state.settings);
    return state.settings;
}

/**
 * Set current edit ID (when editing a transaction)
 * @param {string|null} id - Transaction ID or null to clear
 */
export function setCurrentEditId(id) {
    state.currentEditId = id;
}

/**
 * Get current edit ID
 * @returns {string|null} Current edit ID
 */
export function getCurrentEditId() {
    return state.currentEditId;
}

/**
 * Update filters (search pattern, sort order)
 * @param {Object} filters - Filter updates
 */
export function updateFilters(filters) {
    state.filters = {
        ...state.filters,
        ...filters
    };
}

/**
 * Get current filters
 * @returns {Object} Current filters
 */
export function getFilters() {
    return { ...state.filters };
}

/**
 * Calculating
 * @returns {Object} Statistics object
 */
export function calculateStats() {
    const transactions = state.transactions;
    
    // Total transactions
    const totalCount = transactions.length;
    
    // Total spent
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryTotals = {};
    transactions.forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
    });
    
    // Find top category
    let topCategory = 'None';
    let maxAmount = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > maxAmount) {
            maxAmount = amount;
            topCategory = category;
        }
    }
    
    // Last 7 days spending
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7Days = transactions
        .filter(t => new Date(t.date) >= sevenDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Budget info
    const budgetCap = state.settings.budgetCap;
    const remaining = budgetCap - totalSpent;
    const percentUsed = totalSpent > 0 ? (totalSpent / budgetCap) * 100 : 0;
    
    return {
        totalCount,
        totalSpent,
        categoryTotals,
        topCategory,
        last7Days,
        budget: {
            cap: budgetCap,
            remaining,
            percentUsed: Math.min(percentUsed, 100) // Cap at 100%
        }
    };
}

/**
 * Generate a unique ID for transactions
 * @returns {string} Unique ID like "txn_1634567890123"
 */
function generateId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Import transactions (replace all existing)
 * @param {Array} transactions - Array of transactions to import
 * @returns {boolean} Success status
 */
export function importTransactions(transactions) {
    try {
        state.transactions = transactions;
        saveTransactions(state.transactions);
        console.log('Transactions imported:', transactions.length);
        return true;
    } catch (error) {
        console.error('Error importing transactions:', error);
        return false;
    }
}

/**
 * Clear all transactions
 * @returns {boolean} Success status
 */
export function clearAllTransactions() {
    state.transactions = [];
    saveTransactions(state.transactions);
    console.log('All transactions cleared');
    return true;
}

// Initialize state when module loads
initializeState();
