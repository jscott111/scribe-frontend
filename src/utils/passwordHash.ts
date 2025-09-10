import CryptoJS from 'crypto-js'

/**
 * Hash a password on the client side before sending to server
 * This prevents the plaintext password from being transmitted over the network
 * 
 * @param password - The plaintext password to hash
 * @param salt - Optional salt (if not provided, generates a random one)
 * @returns Object containing the hashed password and salt
 */
export const hashPassword = (password: string, salt?: string): { hash: string; salt: string } => {
  // Generate a random salt if not provided
  const actualSalt = salt || CryptoJS.lib.WordArray.random(32).toString()
  
  // Hash the password with the salt using SHA-256
  const hash = CryptoJS.PBKDF2(password, actualSalt, {
    keySize: 256 / 32, // 256 bits
    iterations: 10000  // 10,000 iterations for security
  }).toString()
  
  return {
    hash,
    salt: actualSalt
  }
}

/**
 * Verify a password against a hash and salt
 * This is used for login verification on the client side
 * 
 * @param password - The plaintext password to verify
 * @param hash - The stored hash
 * @param salt - The stored salt
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const testHash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString()
  
  return testHash === hash
}

/**
 * Generate a secure random salt
 * 
 * @returns A random salt string
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString()
}
