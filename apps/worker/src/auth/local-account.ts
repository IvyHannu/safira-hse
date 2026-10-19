import { previewStorage } from './preview-storage';

/** Local preview invitation. A real invite service will replace this adapter. */
export const previewInvitation = {
  code: 'safira-worker-preview',
  email: 'amara.smith@example.com',
  organisation: 'Riverside Group',
  site: 'North Yard',
  role: 'worker' as const,
};

export interface WorkerAccount {
  email: string;
  organisation: string;
  site: string;
  fullName: string;
  jobTitle: string;
  passwordSalt: string;
  passwordDigest: string;
  profileComplete: boolean;
  onboardingComplete: boolean;
}

const accountKey = 'safira.worker.local-account.v1';
const sessionKey = 'safira.worker.local-session.v1';
const legacyRoleKey = 'safira.demo.role.v1';

export function getInvitation(code: string | undefined) {
  return code === previewInvitation.code ? previewInvitation : null;
}

export function readAccount(): WorkerAccount | null {
  try {
    const raw = previewStorage.getItem(accountKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const account = value as Partial<WorkerAccount>;
    if (
      typeof account.email !== 'string' ||
      typeof account.organisation !== 'string' ||
      typeof account.site !== 'string' ||
      typeof account.fullName !== 'string' ||
      typeof account.jobTitle !== 'string' ||
      typeof account.passwordSalt !== 'string' ||
      typeof account.passwordDigest !== 'string' ||
      typeof account.profileComplete !== 'boolean' ||
      typeof account.onboardingComplete !== 'boolean'
    )
      return null;
    return account as WorkerAccount;
  } catch {
    return null;
  }
}

export function readSignedInAccount(): WorkerAccount | null {
  const account = readAccount();
  if (!account) return null;
  try {
    return previewStorage.getItem(sessionKey) === account.email
      ? account
      : null;
  } catch {
    return null;
  }
}

export function saveAccount(account: WorkerAccount) {
  previewStorage.setItem(accountKey, JSON.stringify(account));
  previewStorage.setItem(sessionKey, account.email);
  previewStorage.removeItem(legacyRoleKey);
}

export function clearSession() {
  previewStorage.removeItem(sessionKey);
  previewStorage.removeItem(legacyRoleKey);
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues)
    globalThis.crypto.getRandomValues(bytes);
  else
    for (let index = 0; index < bytes.length; index++)
      bytes[index] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

// This verifier protects only a local preview record. It is not server auth or
// a production password store; the eventual auth provider must replace it.
export function createPasswordVerifier(password: string) {
  const salt = randomSalt();
  return { salt, digest: sha256(`${salt}:${password}`) };
}

export function matchesPassword(account: WorkerAccount, password: string) {
  return (
    sha256(`${account.passwordSalt}:${password}`) === account.passwordDigest
  );
}

function utf8Bytes(value: string): number[] {
  if (typeof TextEncoder !== 'undefined')
    return Array.from(new TextEncoder().encode(value));
  const escaped = encodeURIComponent(value);
  const bytes: number[] = [];
  for (let index = 0; index < escaped.length; index++) {
    if (escaped[index] === '%') {
      bytes.push(parseInt(escaped.slice(index + 1, index + 3), 16));
      index += 2;
    } else bytes.push(escaped.charCodeAt(index));
  }
  return bytes;
}

const roundConstants = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotate(value: number, bits: number) {
  return (value >>> bits) | (value << (32 - bits));
}

/** Small dependency-free SHA-256 for the local preview verifier. */
export function sha256(value: string) {
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let shift = 56; shift >= 0; shift -= 8)
    bytes.push(Math.floor(bitLength / 2 ** shift) & 0xff);
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array<number>(64);
    for (let index = 0; index < 16; index++) {
      const start = offset + index * 4;
      words[index] =
        ((bytes[start] << 24) |
          (bytes[start + 1] << 16) |
          (bytes[start + 2] << 8) |
          bytes[start + 3]) >>>
        0;
    }
    for (let index = 16; index < 64; index++) {
      const a = words[index - 15];
      const b = words[index - 2];
      const small0 = rotate(a, 7) ^ rotate(a, 18) ^ (a >>> 3);
      const small1 = rotate(b, 17) ^ rotate(b, 19) ^ (b >>> 10);
      words[index] =
        (words[index - 16] + small0 + words[index - 7] + small1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index++) {
      const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 =
        (h + s1 + choice + roundConstants[index] + words[index]) >>> 0;
      const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    const next = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < 8; index++)
      hash[index] = (hash[index] + next[index]) >>> 0;
  }
  return hash.map((part) => part.toString(16).padStart(8, '0')).join('');
}
