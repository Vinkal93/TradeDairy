import { EncryptedCredential } from '../types';

const encode = (bytes: Uint8Array) => btoa(Array.from(bytes, value => String.fromCharCode(value)).join(''));
const decode = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
async function derive(passphrase: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: 310000, hash: 'SHA-256' }, material,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encryptPassword(password: string, passphrase: string): Promise<EncryptedCredential> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(password));
  return { salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
}
export async function decryptPassword(value: EncryptedCredential, passphrase: string): Promise<string> {
  const key = await derive(passphrase, decode(value.salt));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(value.iv) as BufferSource }, key, decode(value.ciphertext) as BufferSource);
  return new TextDecoder().decode(decrypted);
}
