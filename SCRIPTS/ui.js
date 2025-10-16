/**
 * ui.js - Controls everything you see and interact with!
 * This is the "artist" that paints the screen 🎨
 */

import { 
    getTransactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    getSettings,
    updateSettings,
    setCurrentEditId,
    getCurrentEditId,
    calculateStats,
    importTransactions,
    clearAllTransactions
} from './state.js';

import { 
    validateTransaction,
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    validateBudgetCap
} from './validators.js';

import {
    compileRegex,
    searchTransactions,
    highlightMatches,
    sortTransactions,
    validateSearchPattern
} from './search.js';

import {
    exportToJSON,
    importFromJSON
} from './storage.js';

/**
 * Initialize the UI when page loads
 */
function initializeUI() {
    const currentPage = getCurrentPage();
    
    console.log('Initializing UI for page:', currentPage);
    
    // Initialize based on current page
    if (currentPage === 'dashboard') {
        initializeDashboard();
    } else if (currentPage === 'transactions') {
        initializeTransactions();
    } else if (currentPage === 'settings') {
        initializeSettings();
    }
}

/**
 * Get current page name from URL
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('transactions')) return 'transactions';
    if (path.includes('settings')) return 'settings';
    return 'home';
}

/**
 * ======================
 * DASHBOARD PAGE
 * ======================
 */
function initializeDashboard() {
    updateDashboardStats();
    updateBudgetDisplay();
    updateCategoryBreakdown();
    updateRecentTransactions();
}

function updateDashboardStats() {
    const stats = calculateStats();
    
    // Update stat cards
    const totalTransEl = document.getElementById('total-transactions');
    const totalSpentEl = document.getElementById('total-spent');
    const topCategoryEl = document.getElementById('top-category');
    const last7DaysEl = document.getElementById('last-seven-days');
    
    if (totalTransEl) totalTransEl.textContent = stats.totalCount;
    if (totalSpentEl) totalSpentEl.textContent = `$${stats.totalSpent.toFixed(2)}`;
    if (topCategoryEl) topCategoryEl.textContent = stats.topCategory;
    if (last7DaysEl) last7DaysEl.textContent = `$${stats.last7Days.toFixed(2)}`;
}

function updateBudgetDisplay() {
    const stats = calculateStats();
    const budget = stats.budget;
    
    // Update budget amounts
    const budgetCapEl = document.getElementById('budget-cap');
    const budgetRemainingEl = document.getElementById('budget-remaining');
    const budgetProgressEl = document.getElementById('budget-progress');
    const budgetAlertEl = document.getElementById('budget-alert');
    
    if (budgetCapEl) budgetCapEl.textContent = `$${budget.cap.toFixed(2)}`;
    if (budgetRemainingEl) {
        budgetRemainingEl.textContent = `$${budget.remaining.toFixed(2)}`;
        
        // Change color based on remaining
        if (budget.remaining < 0) {
            budgetRemainingEl.style.color = '#dc3545';
        } else if (budget.remaining < budget.cap * 0.2) {
            budgetRemainingEl.style.color = '#ffc107';
        } else {
            budgetRemainingEl.style.color = '#28a745';
        }
    }
    
    // Update progress bar
    if (budgetProgressEl) {
        const percent = Math.min(budget.percentUsed, 100);
        budgetProgressEl.style.width = `${percent}%`;
        budgetProgressEl.setAttribute('aria-valuenow', percent);
        
        const progressText = budgetProgressEl.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${percent.toFixed(0)}%`;
        }
        
        // Change color based on percentage
        budgetProgressEl.classList.remove('warning', 'danger');
        if (percent >= 100) {
            budgetProgressEl.classList.add('danger');
        } else if (percent >= 80) {
            budgetProgressEl.classList.add('warning');
        }
    }
    
    // Update alert message
    if (budgetAlertEl) {
        budgetAlertEl.classList.remove('warning', 'danger');
        
        if (budget.percentUsed >= 100) {
            budgetAlertEl.classList.add('danger');
            budgetAlertEl.setAttribute('aria-live', 'assertive');
            budgetAlertEl.innerHTML = '<p><strong>⚠️ Budget Exceeded!</strong> You have spent more than your budget cap.</p>';
        } else if (budget.percentUsed >= 80) {
            budgetAlertEl.classList.add('warning');
            budgetAlertEl.setAttribute('aria-live', 'polite');
            budgetAlertEl.innerHTML = '<p><strong>Warning:</strong> You are approaching your budget limit!</p>';
        } else {
            budgetAlertEl.innerHTML = '<p>You\'re doing great! Keep tracking your expenses.</p>';
        }
    }
}

function updateCategoryBreakdown() {
    const stats = calculateStats();
    const container = document.getElementById('category-breakdown');
    
    if (!container) return;
    
    const categories = stats.categoryTotals;
    
    if (Object.keys(categories).length === 0) {
        container.innerHTML = '<p class="empty-state">No transactions yet. Start adding some!</p>';
        return;
    }
    
    // Sort categories by amount
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    
    let html = '';
    sorted.forEach(([category, amount]) => {
        html += `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-amount">$${amount.toFixed(2)}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateRecentTransactions() {
    const transactions = getTransactions();
    const container = document.getElementById('recent-transactions');
    
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent transactions to display.</p>';
        return;
    }
    
    // Get 5 most recent
    const recent = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    let html = '';
    recent.forEach(t => {
        html += `
            <div class="recent-item">
                <div class="recent-info">
                    <h4>${t.description}</h4>
                    <p class="recent-meta">${t.category} • ${t.date}</p>
                </div>
                <div class="recent-amount">$${t.amount.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * ======================
 * TRANSACTIONS PAGE
 * ======================
 */
function initializeTransactions() {
    setupTransactionForm();
    setupSearchAndSort();
    renderTransactions();
}

function setupTransactionForm() {
    const form = document.getElementById('transaction-form');
    if (!form) return;
    
    // Set today's date as default
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Cancel edit button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        description: form.description.value,
        amount: form.amount.value,
        category: form.category.value,
        date: form.date.value
    };
    
    // Validate
    const validation = validateTransaction(formData);
    
    if (!validation.isValid) {
        displayFormErrors(validation.errors);
        return;
    }
    
    // Clear errors
    clearFormErrors();
    
    // Check if editing or adding
    const editId = getCurrentEditId();
    
    if (editId) {
        // Update existing
        updateTransaction(editId, formData);
        showFormStatus('Transaction updated successfully!', 'success');
        cancelEdit();
    } else {
        // Add new
        addTransaction(formData);
        showFormStatus('Transaction added successfully!', 'success');
        form.reset();
        
        // Reset date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    // Re-render transactions
    renderTransactions();
    
    // Update dashboard if on that page
    if (getCurrentPage() === 'dashboard') {
        updateDashboardStats();
        updateBudgetDisplay();
    }
}

function validateField(input) {
    const name = input.name;
    const value = input.value;
    const errorEl = document.getElementById(`${name}-error`);
    
    let validation;
    
    if (name === 'description') {
        validation = validateDescription(value);
    } else if (name === 'amount') {
        validation = validateAmount(value);
    } else if (name === 'date') {
        validation = validateDate(value);
    } else if (name === 'category') {
        validation = validateCategory(value);
    }
    
    if (validation && !validation.isValid) {
        input.classList.add('error');
        if (errorEl) errorEl.textContent = validation.error;
    } else {
        input.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
    }
}

function displayFormErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
        const input = document.getElementById(field);
        const errorEl = document.getElementById(`${field}-error`);
        
        if (input) input.classList.add('error');
        if (errorEl) errorEl.textContent = message;
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const inputs = document.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
}

function showFormStatus(message, type) {
    const statusEl = document.getElementById('form-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    
    // Clear after 3 seconds
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
    }, 3000);
}

function setupSearchAndSort() {
    const searchInput = document.getElementById('search-input');
    const caseSensitiveCheckbox = document.getElementById('case-sensitive');
    const sortSelect = document.getElementById('sort-by');
    const searchError = document.getElementById('search-error');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const pattern = searchInput.value;
            const validation = validateSearchPattern(pattern);
            
            if (!validation.isValid) {
                if (searchError) searchError.textContent = validation.error;
            } else {
                if (searchError) searchError.textContent = '';
                renderTransactions();
            }
        });
    }
    
    if (caseSensitiveCheckbox) {
        caseSensitiveCheckbox.addEventListener('change', renderTransactions);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', renderTransactions);
    }
}

function renderTransactions() {
    let transactions = getTransactions();
    
    // Apply search filter
    const searchInput = document.getElementById('search-input');
    const caseSensitiveCheckbox = document.getElementById('case-sensitive');
    
    if (searchInput && searchInput.value) {
        const caseSensitive = caseSensitiveCheckbox ? caseSensitiveCheckbox.checked : false;
        const regex = compileRegex(searchInput.value, caseSensitive);
        
        if (regex) {
            transactions = searchTransactions(transactions, regex);
        }
    }
    
    // Apply sorting
    const sortSelect = document.getElementById('sort-by');
    const sortBy = sortSelect ? sortSelect.value : 'date-desc';
    transactions = sortTransactions(transactions, sortBy);
    
    // Update count
    const showingCount = document.getElementById('showing-count');
    const totalCount = document.getElementById('total-count');
    
    if (showingCount) showingCount.textContent = transactions.length;
    if (totalCount) totalCount.textContent = getTransactions().length;
    
    // Render desktop table
    renderDesktopTable(transactions);
    
    // Render mobile cards
    renderMobileCards(transactions);
}

function renderDesktopTable(transactions) {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions found.</td></tr>';
        return;
    }
    
    const searchInput = document.getElementById('search-input');
    const caseSensitiveCheckbox = document.getElementById('case-sensitive');
    const regex = searchInput && searchInput.value 
        ? compileRegex(searchInput.value, caseSensitiveCheckbox ? caseSensitiveCheckbox.checked : false)
        : null;
    
    let html = '';
    transactions.forEach(t => {
        const description = regex ? highlightMatches(t.description, regex) : t.description;
        const amount = regex ? highlightMatches(t.amount.toString(), regex) : t.amount.toFixed(2);
        const category = regex ? highlightMatches(t.category, regex) : t.category;
        const date = regex ? highlightMatches(t.date, regex) : t.date;
        
        html += `
            <tr>
                <td>${description}</td>
                <td>$${amount}</td>
                <td>${category}</td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="window.editTransaction('${t.id}')" aria-label="Edit ${t.description}">Edit</button>
                        <button class="btn-delete" onclick="window.confirmDelete('${t.id}')" aria-label="Delete ${t.description}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function renderMobileCards(transactions) {
    const container = document.getElementById('transactions-cards');
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">No transactions found.</p>';
        return;
    }
    
    const searchInput = document.getElementById('search-input');
    const caseSensitiveCheckbox = document.getElementById('case-sensitive');
    const regex = searchInput && searchInput.value 
        ? compileRegex(searchInput.value, caseSensitiveCheckbox ? caseSensitiveCheckbox.checked : false)
        : null;
    
    let html = '';
    transactions.forEach(t => {
        const description = regex ? highlightMatches(t.description, regex) : t.description;
        const amount = regex ? highlightMatches(t.amount.toString(), regex) : t.amount.toFixed(2);
        const category = regex ? highlightMatches(t.category, regex) : t.category;
        const date = regex ? highlightMatches(t.date, regex) : t.date;
        
        html += `
            <div class="transaction-card">
                <div class="card-header">
                    <div class="card-description">${description}</div>
                    <div class="card-amount">$${amount}</div>
                </div>
                <div class="card-meta">
                    <span>${category}</span>
                    <span>${date}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="window.editTransaction('${t.id}')">Edit</button>
                    <button class="btn-delete" onclick="window.confirmDelete('${t.id}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Make functions available globally for onclick handlers
window.editTransaction = function(id) {
    const transaction = getTransactions().find(t => t.id === id);
    if (!transaction) return;
    
    // Fill form
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('category').value = transaction.category;
    document.getElementById('date').value = transaction.date;
    
    // Update UI
    document.getElementById('btn-text').textContent = 'Update Transaction';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    
    // Set edit ID
    setCurrentEditId(id);
    
    // Scroll to form
    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
};

window.confirmDelete = function(id) {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    // Set up confirm button
    const confirmBtn = document.getElementById('confirm-delete');
    const cancelBtn = document.getElementById('cancel-delete');
    
    confirmBtn.onclick = () => {
        deleteTransaction(id);
        modal.style.display = 'none';
        renderTransactions();
        
        // Update dashboard if exists
        if (getCurrentPage() === 'dashboard') {
            updateDashboardStats();
            updateBudgetDisplay();
        }
    };
    
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };
};

function cancelEdit() {
    setCurrentEditId(null);
    
    const form = document.getElementById('transaction-form');
    if (form) form.reset();
    
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('btn-text').textContent = 'Add Transaction';
    document.getElementById('cancel-btn').style.display = 'none';
    
    clearFormErrors();
}

/**
 * ======================
 * SETTINGS PAGE
 * ======================
 */
function initializeSettings() {
    setupBudgetForm();
    setupCurrencyForm();
    setupDataManagement();
}

function setupBudgetForm() {
    const form = document.getElementById('budget-form');
    if (!form) return;
    
    // Load current budget
    const settings = getSettings();
    const budgetInput = document.getElementById('budget-cap');
    if (budgetInput) {
        budgetInput.value = settings.budgetCap.toFixed(2);
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const value = budgetInput.value;
        const validation = validateBudgetCap(value);
        
        if (!validation.isValid) {
            const errorEl = document.getElementById('budget-cap-error');
            if (errorEl) errorEl.textContent = validation.error;
            return;
        }
        
        // Clear error
        const errorEl = document.getElementById('budget-cap-error');
        if (errorEl) errorEl.textContent = '';
        
        // Update settings
        updateSettings({ budgetCap: parseFloat(value) });
        
        // Show success
        const statusEl = document.getElementById('budget-status');
        if (statusEl) {
            statusEl.textContent = 'Budget cap updated successfully!';
            statusEl.className = 'form-status success';
            
            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'form-status';
            }, 3000);
        }
    });
}

function setupCurrencyForm() {
    const form = document.getElementById('currency-form');
    if (!form) return;
    
    // Load current rates
    const settings = getSettings();
    const eurInput = document.getElementById('eur-rate');
    const rwfInput = document.getElementById('rwf-rate');
    
    if (eurInput) eurInput.value = settings.currencies.EUR;
    if (rwfInput) rwfInput.value = settings.currencies.RWF;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newSettings = {
            currencies: {
                USD: 1.00,
                EUR: parseFloat(eurInput.value),
                RWF: parseFloat(rwfInput.value)
            }
        };
        
        updateSettings(newSettings);
        
        // Show success
        const statusEl = document.getElementById('currency-status');
        if (statusEl) {
            statusEl.textContent = 'Currency rates updated successfully!';
            statusEl.className = 'form-status success';
            
            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'form-status';
            }, 3000);
        }
    });
}

function setupDataManagement() {
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const transactions = getTransactions();
            const json = exportToJSON(transactions);
            
            if (json) {
                // Create download
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }
    
    // Import button
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            const file = importFile.files[0];
            if (!file) {
                showImportStatus('Please select a file first.', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const json = e.target.result;
                const data = importFromJSON(json);
                
                if (data) {
                    importTransactions(data);
                    showImportStatus(`Successfully imported ${data.length} transactions!`, 'success');
                    
                    // Refresh if on transactions page
                    if (getCurrentPage() === 'transactions') {
                        renderTransactions();
                    }
                } else {
                    showImportStatus('Invalid JSON file. Please check the format.', 'error');
                }
            };
            
            reader.readAsText(file);
        });
    }
    
    // Clear data button
    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const modal = document.getElementById('clear-modal');
            if (modal) modal.style.display = 'flex';
        });
    }
    
    // Clear modal buttons
    const confirmClear = document.getElementById('confirm-clear');
    const cancelClear = document.getElementById('cancel-clear');
    
    if (confirmClear) {
        confirmClear.addEventListener('click', () => {
            clearAllTransactions();
            const modal = document.getElementById('clear-modal');
            if (modal) modal.style.display = 'none';
            
            // Refresh if on transactions page
            if (getCurrentPage() === 'transactions') {
                renderTransactions();
            }
            
            alert('All data has been cleared!');
        });
    }
    
    if (cancelClear) {
        cancelClear.addEventListener('click', () => {
            const modal = document.getElementById('clear-modal');
            if (modal) modal.style.display = 'none';
        });
    }
}

function showImportStatus(message, type) {
    const statusEl = document.getElementById('import-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    initializeUI();
}