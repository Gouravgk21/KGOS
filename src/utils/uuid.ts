import crypto from 'crypto';

/**
 * Deterministically generates a valid RFC 4122 v5 UUID from an input string (like a Clerk user ID).
 * Uses SHA-1 hashing under the hood, compatible with standard UUID v5 generation.
 */
export function getDeterministicUuid(input: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)) {
    return input; // Already a valid UUID
  }
  
  const hash = crypto.createHash('sha1').update(input).digest();
  
  // Set version (5)
  hash[6] = (hash[6] & 0x0f) | 0x50;
  // Set variant (RFC 4122)
  hash[8] = (hash[8] & 0x3f) | 0x80;
  
  const hex = hash.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}
