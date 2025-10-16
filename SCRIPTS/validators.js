// scripts/validators.js
export const patterns = {
  // Description: no leading/trailing spaces (use trimmed check) and length 3-100
  description: /^(.|\s){3,100}$/,
  // Amount: whole or decimal with up to 2 decimal places, disallow leading zeros except "0" or "0.xx"
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  // Date: YYYY-MM-DD with simple month/day checks
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  // Category: letters, spaces, hyphens allowed, no leading/trailing spaces
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
};

// Advanced regex examples (for search or validation helpers)
export const advanced = {
  duplicateWord: /\b(\w+)\s+\1\b/i // back-reference catches repeated words
};

// Helper: validate a record object (returns {ok: boolean, errors: {field:msg}})
export function validateRecord(record) {
  const errors = {};

  // Description: enforce trimmed, collapse multiple spaces
  const desc = (record.description || '').trim().replace(/\s{2,}/g, ' ');
  if (!desc || desc.length < 3 || desc.length > 100) {
    errors.description = 'Description must be 3–100 characters.';
  }
  // Amount
  if (!patterns.amount.test(String(record.amount))) {
    errors.amount = 'Amount must be a number (max 2 decimals).';
  }
  // Date
  if (!patterns.date.test(String(record.date))) {
    errors.date = 'Date must be YYYY-MM-DD.';
  }
  // Category
  if (!patterns.category.test(String(record.category || ''))) {
    errors.category = 'Category must be letters, spaces or hyphens only.';
  }

  return { ok: Object.keys(errors).length === 0, errors, cleaned: { ...record, description: desc } };
}
// Example usage:
// const result = validateRecord({ description: '  Lunch  ', amount: '12.50', category: 'Food', date: '2023-10-05' });
// if (!result.ok) { console.log(result.errors); } else { console.log('Valid record:', result.cleaned); }