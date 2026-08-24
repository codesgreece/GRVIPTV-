import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_PATTERN = /^[A-Za-z0-9]{20,64}$/;

export function createMagicToken(length = 24) {
  const bytes = randomBytes(length);
  let token = "";
  for (const byte of bytes) {
    token += ALPHABET[byte % ALPHABET.length];
  }
  return token;
}

export function createCustomerId() {
  return randomBytes(12).toString("hex");
}

export function isValidMagicToken(token: string) {
  return TOKEN_PATTERN.test(token);
}
