// utils/encrypt.js
import * as forge from 'node-forge';
import * as pako from 'pako';

export const aKey = 'T@MiCr097124!iCR';

export function encrypt(value, scretKey) {
  try {
    const textEncoder = new TextEncoder();
    const iv = '1234567891234567';
    const md = forge.md.sha256.create();
    md.update(scretKey || aKey);
    const key = md.digest();
    const encodedData = textEncoder.encode(JSON.stringify(value));
    const gzippedData = pako.gzip(encodedData);
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(gzippedData));
    cipher.finish();
    const encrypted = cipher.output;
    return { data: forge.util.encode64(encrypted.data) };
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
}

export function generateHash(timestamp, ip) {
  const crypto = require('crypto-js');
  return crypto.SHA512(timestamp + ip + aKey).toString();
}