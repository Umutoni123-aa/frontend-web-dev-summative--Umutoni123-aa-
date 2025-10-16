/**
 * validators.js - Validates user input using Regular Expressions (Regex)
 * Regex is like a pattern-matching superpower! 🦸‍♀️
 */

/**
 * REGEX PATTERNS - These are the rules for checking if input is correct
 */

// 1. Description: No leading/trailing spaces, no double spaces
// Example: "Lunch at cafe" ✅  "  Lunch  " ❌
export const REGEX_PATTERNS = {
    description: /^\S(?:.*\S)?$/,
    
    // 2. Amount: Numbers with optional 2 decimal places
    // Examples: "12" ✅ "12.50" ✅ "0.99" ✅ "-5" ❌ "12.5" ❌
    amount: /^(0|[1-9]\d*)(\.\d{2})?$/,
    
    // 3. Date: YYYY-MM-DD format
    // Example: "2025-09-29" ✅ "2025-9-29" ❌
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    
    // 4. Category: Letters, spaces, hyphens only
    // Examples: "Food" ✅ "Books-Stationery" ✅ "Food123" ❌
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    
    // 5. ADVANCED: Duplicate word detector (back-reference)
    // This catches when someone types the same word twice
    // Example: "lunch lunch" will be caught!
    duplicateWord: /\b(\w+)\s+\1\b/i,
    
    // 6. ADVANCED: Find amounts with cents (for search)
    // Example: matches "12.50" but not "12"
    hasCents: /\.\d{2}\b/,
    
    // 7. Budget cap validation (positive number)
    budgetCap: /^[1-9]\d*(\.\d{2})?$/
};

/**
 * Validate description
 * @param {string} value - Description to validate
 * @returns {Object} {isValid: boolean, error: string}
 */
export function validateDescription(value) {
    // Check if empty
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            error: 'Description is required'
        };
    }
    
    // Check for leading/trailing spaces
    if (value !== value.trim()) {
        return {
            isValid: false,
            error: 'Description cannot have leading or trailing spaces'
        };
    }
    
    // Check regex pattern
    if (!REGEX_PATTERNS.description.test(value)) {
        return {
            isValid: false,
            error: 'Description cannot have double spaces'
        };
    }
    
    // Check for duplicate words (ADVANCED REGEX!)
    if (REGEX_PATTERNS.duplicateWord.test(value)) {
        return {
            isValid: false,
            error: 'Description has duplicate words'
        };
    }
    
    // Check length
    if (value.length < 3) {
        return {
            isValid: false,
            error: 'Description must be at least 3 characters'
        };
    }
    
    if (value.length > 100) {
        return {
            isValid: false,
            error: 'Description must be less than 100 characters'
        };
    }
    
    return { isValid: true, error: '' };
}

/**
 * Validate amount
 * @param {string} value - Amount to validate
 * @returns {Object} {isValid: boolean, error: string}
 */
export function validateAmount(value) {
    // Check if empty
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            error: 'Amount is required'
        };
    }
    
    // Check regex pattern
    if (!REGEX_PATTERNS.amount.test(value)) {
        return {
            isValid: false,
            error: 'Amount must be a valid number (e.g., 12.50)'
        };
    }
    
    // Check if amount is too large
    const numValue = parseFloat(value);
    if (numValue > 999999) {
        return {
            isValid: false,
            error: 'Amount is too large'
        };
    }
    
    if (numValue === 0) {
        return {
            isValid: false,
            error: 'Amount must be greater than 0'
        };
    }
    
    return { isValid: true, error: '' };
}

/**
 * Validate date
 * @param {string} value - Date to validate (YYYY-MM-DD)
 * @returns {Object} {isValid: boolean, error: string}
 */
export function validateDate(value) {
    // Check if empty
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            error: 'Date is required'
        };
    }
    
    // Check regex pattern
    if (!REGEX_PATTERNS.date.test(value)) {
        return {
            isValid: false,
            error: 'Date must be in YYYY-MM-DD format'
        };
    }
    
    // Check if date is valid (not in the future too much)
    const selectedDate = new Date(value);
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setFullYear(today.getFullYear() + 1);
    
    if (selectedDate > futureLimit) {
        return {
            isValid: false,
            error: 'Date cannot be more than 1 year in the future'
        };
    }
    
    // Check if date is too old
    const pastLimit = new Date();
    pastLimit.setFullYear(today.getFullYear() - 10);
    
    if (selectedDate < pastLimit) {
        return {
            isValid: false,
            error: 'Date cannot be more than 10 years in the past'
        };
    }
    
    return { isValid: true, error: '' };
}

/**
 * Validate category
 * @param {string} value - Category to validate
 * @returns {Object} {isValid: boolean, error: string}
 */
export function validateCategory(value) {
    // Check if empty
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            error: 'Category is required'
        };
    }
    
    // Check regex pattern
    if (!REGEX_PATTERNS.category.test(value)) {
        return {
            isValid: false,
            error: 'Category can only contain letters, spaces, and hyphens'
        };
    }
    
    return { isValid: true, error: '' };
}

/**
 * Validate budget cap
 * @param {string} value - Budget cap to validate
 * @returns {Object} {isValid: boolean, error: string}
 */
export function validateBudgetCap(value) {
    // Check if empty
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            error: 'Budget cap is required'
        };
    }
    
    // Check regex pattern
    if (!REGEX_PATTERNS.budgetCap.test(value)) {
        return {
            isValid: false,
            error: 'Budget cap must be a positive number (e.g., 500.00)'
        };
    }
    
    const numValue = parseFloat(value);
    if (numValue < 1) {
        return {
            isValid: false,
            error: 'Budget cap must be at least $1'
        };
    }
    
    if (numValue > 1000000) {
        return {
            isValid: false,
            error: 'Budget cap is too large'
        };
    }
    
    return { isValid: true, error: '' };
}

/**
 * Validate all form fields at once
 * @param {Object} formData - Object with description, amount, category, date
 * @returns {Object} {isValid: boolean, errors: Object}
 */
export function validateTransaction(formData) {
    const errors = {};
    
    const descValidation = validateDescription(formData.description);
    if (!descValidation.isValid) {
        errors.description = descValidation.error;
    }
    
    const amountValidation = validateAmount(formData.amount);
    if (!amountValidation.isValid) {
        errors.amount = amountValidation.error;
    }
    
    const categoryValidation = validateCategory(formData.category);
    if (!categoryValidation.isValid) {
        errors.category = categoryValidation.error;
    }
    
    const dateValidation = validateDate(formData.date);
    if (!dateValidation.isValid) {
        errors.date = dateValidation.error;
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}