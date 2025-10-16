/**
 * search.js - Handles regex search and highlighting matches
 * This lets you find transactions using powerful patterns! 🔍
 */

/**
 * Safely compile a regex pattern
 * Returns null if the pattern is invalid
 * @param {string} pattern - The regex pattern to compile
 * @param {boolean} caseSensitive - Whether search is case-sensitive
 * @returns {RegExp|null} Compiled regex or null if invalid
 */
export function compileRegex(pattern, caseSensitive = false) {
    // If pattern is empty, return null
    if (!pattern || pattern.trim() === '') {
        return null;
    }
    
    try {
        // Create flags: 'g' for global (find all matches)
        // Add 'i' for case-insensitive if needed
        const flags = caseSensitive ? 'g' : 'gi';
        
        const regex = new RegExp(pattern, flags);
        return regex;
    } catch (error) {
        // If regex is invalid, return null
        console.error('Invalid regex pattern:', error);
        return null;
    }
}

/**
 * Search transactions using a regex pattern
 * @param {Array} transactions - Array of transaction objects
 * @param {RegExp} regex - Compiled regex pattern
 * @returns {Array} Filtered array of matching transactions
 */
export function searchTransactions(transactions, regex) {
    // If no regex, return all transactions
    if (!regex) {
        return transactions;
    }
    
    // Filter transactions that match the pattern
    return transactions.filter(transaction => {
        // Search in description
        if (regex.test(transaction.description)) {
            return true;
        }
        
        // Reset regex (important for global flag!)
        regex.lastIndex = 0;
        
        // Search in amount (convert to string)
        if (regex.test(transaction.amount.toString())) {
            return true;
        }
        
        // Reset regex again
        regex.lastIndex = 0;
        
        // Search in category
        if (regex.test(transaction.category)) {
            return true;
        }
        
        // Reset regex again
        regex.lastIndex = 0;
        
        // Search in date
        if (regex.test(transaction.date)) {
            return true;
        }
        
        // Reset for next iteration
        regex.lastIndex = 0;
        
        return false;
    });
}

/**
 * Highlight matching text with <mark> tags
 * @param {string} text - Text to highlight
 * @param {RegExp} regex - Regex pattern to match
 * @returns {string} Text with <mark> tags around matches
 */
export function highlightMatches(text, regex) {
    // If no regex or no text, return original text
    if (!regex || !text) {
        return text;
    }
    
    try {
        // Convert to string if it's a number
        const textStr = text.toString();
        
        // Replace matches with <mark> tags
        // The $& is a special code that means "the matched text"
        const highlighted = textStr.replace(regex, match => `<mark>${match}</mark>`);
        
        return highlighted;
    } catch (error) {
        console.error('Error highlighting matches:', error);
        return text;
    }
}

/**
 * Get example search patterns for help
 * @returns {Array} Array of example objects
 */
export function getSearchExamples() {
    return [
        {
            pattern: 'coffee',
            description: 'Find any transaction containing "coffee"',
            example: 'Matches: "Coffee with friends", "coffee beans"'
        },
        {
            pattern: 'coffee|tea',
            description: 'Find transactions with "coffee" OR "tea"',
            example: 'Matches: "Coffee break", "Green tea"'
        },
        {
            pattern: '\\.\\.d{2}\\b',
            description: 'Find amounts with cents (has decimal point)',
            example: 'Matches: "12.50", "8.75" but not "45"'
        },
        {
            pattern: '^\\d+$',
            description: 'Find whole number amounts (no cents)',
            example: 'Matches: "12", "45" but not "12.50"'
        },
        {
            pattern: '^[A-Z]',
            description: 'Find descriptions starting with uppercase letter',
            example: 'Matches: "Lunch", "Books" but not "lunch"'
        },
        {
            pattern: '2025-09',
            description: 'Find all transactions from September 2025',
            example: 'Matches any date like "2025-09-29"'
        },
        {
            pattern: '(Food|Books)',
            description: 'Find Food or Books categories',
            example: 'Matches category "Food" or "Books"'
        }
    ];
}

/**
 * Sort transactions by different criteria
 * @param {Array} transactions - Array of transactions
 * @param {string} sortBy - Sort criteria (e.g., 'date-desc', 'amount-asc')
 * @returns {Array} Sorted array
 */
export function sortTransactions(transactions, sortBy) {
    // Make a copy so we don't modify the original
    const sorted = [...transactions];
    
    switch (sortBy) {
        case 'date-desc':
            // Newest first
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
            
        case 'date-asc':
            // Oldest first
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
            
        case 'amount-desc':
            // Highest amount first
            sorted.sort((a, b) => b.amount - a.amount);
            break;
            
        case 'amount-asc':
            // Lowest amount first
            sorted.sort((a, b) => a.amount - b.amount);
            break;
            
        case 'description-asc':
            // A to Z
            sorted.sort((a, b) => a.description.localeCompare(b.description));
            break;
            
        case 'description-desc':
            // Z to A
            sorted.sort((a, b) => b.description.localeCompare(a.description));
            break;
            
        default:
            // Default: newest first
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return sorted;
}

/**
 * Validate if a search pattern is safe to use
 * @param {string} pattern - Pattern to validate
 * @returns {Object} {isValid: boolean, error: string}
 */
export function validateSearchPattern(pattern) {
    // Empty pattern is valid (shows all)
    if (!pattern || pattern.trim() === '') {
        return { isValid: true, error: '' };
    }
    
    // Try to compile it
    try {
        new RegExp(pattern);
        return { isValid: true, error: '' };
    } catch (error) {
        return {
            isValid: false,
            error: 'Invalid regex pattern. Check your syntax.'
        };
    }
}