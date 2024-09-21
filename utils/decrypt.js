// utils/decrypt.js
import * as forge from 'node-forge';
import * as pako from 'pako';
import { getKey } from './sessionService';

const aKey = 'T@MiCr097124!iCR';

export function decrypt(value) {
  try {
    const textDecoder = new TextDecoder();
    const iv = '1234567891234567';

    const md = forge.md.sha256.create();
    let k = getKey() || aKey
    md.update(k);
    const key = md.digest();

    const encryptedBytes = forge.util.decode64(value);
    const decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({ iv: iv });

    const length = encryptedBytes.length;
    const chunkSize = 1024 * 64;
    let index = 0;
    let decrypted = '';

    do {
      decrypted += decipher.output.getBytes();
      const buf = forge.util.createBuffer(encryptedBytes.substr(index, chunkSize));
      decipher.update(buf);
      index += chunkSize;
    } while (index < length);

    const result = decipher.finish();
    decrypted += decipher.output.getBytes();

    // Convert decrypted string to Uint8Array
    const decryptedBytes = new Uint8Array(decrypted.length);
    for (let i = 0; i < decrypted.length; ++i) {
      decryptedBytes[i] = decrypted.charCodeAt(i);
    }

    const decodedData = pako.ungzip(decryptedBytes);
    const dataObject = JSON.parse(textDecoder.decode(decodedData));

    return dataObject;
  } catch (err) {
    console.error('Decryption error:', err);
    return value;
  }
}