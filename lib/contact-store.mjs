import { mkdir, readFile, writeFile, rename, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes, randomUUID, createHmac } from 'node:crypto';

const directory = () => process.env.CONTACT_STATE_DIR || join(process.cwd(), '.arxylve-private');
const hash = (salt, value) => createHmac('sha256', salt).update(value).digest('hex');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function transaction(action) {
  const dir = directory();
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const lock = join(dir, 'contact.lock');
  let acquired = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await mkdir(lock); acquired = true; break; }
    catch (error) { if (error.code !== 'EEXIST') throw error; await wait(50); }
  }
  if (!acquired) throw new Error('CONTACT_STORE_BUSY');
  try {
    const file = join(dir, 'contacts.json');
    let state;
    try { state = JSON.parse(await readFile(file, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      state = { version: 1, salt: randomBytes(32).toString('hex'), requests: [] };
    }
    if (state.version !== 1 || !Array.isArray(state.requests) || typeof state.salt !== 'string') throw new Error('CONTACT_STORE_INVALID');
    const result = action(state);
    const temp = join(dir, 'contacts-' + randomUUID() + '.tmp');
    await writeFile(temp, JSON.stringify(state), { mode: 0o600 });
    await rename(temp, file);
    return result;
  } finally { await rmdir(lock); }
}

export async function reserveContact(email, phone, details = null, bypass = false) {
  return transaction(state => {
    const emailHash = hash(state.salt, email), phoneHash = hash(state.salt, phone);
    const pending = state.requests.filter(item => !item.repliedAt && !item.ownerTest && (item.emailHash === emailHash || item.phoneHash === phoneHash));
    if (!bypass && pending.length >= 2) return null;
    const id = randomUUID();
    state.requests.push({ id, emailHash, phoneHash, createdAt: new Date().toISOString(), ...(details ? {details, status:'received', delivery:'sending', ownerTest:bypass} : {}) });
    return id;
  });
}

export async function releaseContact(id) {
  return transaction(state => { state.requests = state.requests.filter(item => item.id !== id); });
}

export async function markReplied(email) {
  return transaction(state => replyToContact(state, hash(state.salt, email.trim().toLowerCase())));
}

function replyToContact(state, emailHash) {
  const phones = new Set(state.requests.filter(item => item.emailHash === emailHash).map(item => item.phoneHash));
  let count = 0;
  for (const item of state.requests) {
    if ((item.emailHash === emailHash || phones.has(item.phoneHash)) && !item.repliedAt) {
      item.repliedAt = new Date().toISOString();
      if (!item.status || item.status === 'received') item.status = 'replied';
      count++;
    }
  }
  return count;
}

export async function confirmContact(id) {
  return transaction(state => {
    const item = state.requests.find(item => item.id === id);
    if (!item) throw new Error('Demande introuvable.');
    item.delivery = 'sent';
  });
}

export async function listContacts() {
  return transaction(state => state.requests.filter(item => item.details).map(({id, createdAt, details, status, delivery, ownerTest, repliedAt}) => ({id, createdAt, details, status, delivery, ownerTest, repliedAt})).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function updateContact(id, status) {
  if (!['received','replied','in-progress','completed'].includes(status)) throw new Error('État invalide.');
  return transaction(state => {
    const item = state.requests.find(item => item.id === id && item.details);
    if (!item) throw new Error('Demande introuvable.');
    if (status !== 'received') replyToContact(state, item.emailHash);
    item.status = status;
  });
}
