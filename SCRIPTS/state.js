// scripts/state.js
import * as storage from './storage.js';
import { validateRecord } from './validators.js';

function nowIso(){ return new Date().toISOString(); }

let records = storage.load() || [];

// If empty, then load seed.json automatically.
export function initWithSeed(seedArray = []) {
  if (records.length === 0 && Array.isArray(seedArray) && seedArray.length > 0) {
    records = seedArray.map(r => ({ ...r }));
    storage.save(records);
  } else {
    records = storage.load() || [];
  }
}

export function all() {
  return [...records]; // keep shallow copy
}

export function findById(id) {
  return records.find(r => String(r.id) === String(id));
}

export function create(data) {
  const prepared = {
    id: `txn_${Date.now()}${Math.floor(Math.random()*1000)}`,
    description: String(data.description || '').trim().replace(/\s{2,}/g, ' '),
    amount: Number(String(data.amount).trim()) || 0,
    category: String(data.category || 'Other').trim(),
    date: String(data.date || new Date().toISOString().substring(0,10)),
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  const validation = validateRecord(prepared);
  if (!validation.ok) return { ok: false, errors: validation.errors };

  records.push(prepared);
  storage.save(records);
  return { ok: true, record: prepared };
}

export function update(id, data) {
  const idx = records.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return { ok: false, error: 'not_found' };

  const merged = { ...records[idx], ...data, updatedAt: nowIso() };

  // Clean description
  merged.description = String(merged.description || '').trim().replace(/\s{2,}/g, ' ');

  const validation = validateRecord(merged);
  if (!validation.ok) return { ok: false, errors: validation.errors };

  records[idx] = merged;
  storage.save(records);
  return { ok: true, record: merged };
}

export function remove(id) {
  const before = records.length;
  records = records.filter(r => String(r.id) !== String(id));
  storage.save(records);
  return { ok: records.length < before };
}

export function replaceAll(newRecords) {
  // expect validated array
  records = Array.isArray(newRecords) ? newRecords : [];
  storage.save(records);
}

export function appendMany(newRecords) {
  records = records.concat(newRecords);
  storage.save(records);
}

export function clear() {
  records = [];
  storage.clearAll();
}

export function exportJson() {
  return JSON.stringify(records, null, 2);
}
