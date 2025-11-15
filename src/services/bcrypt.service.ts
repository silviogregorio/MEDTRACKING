import bcrypt from 'bcrypt';

// Password Hashing Service
export class BcryptService {
  private readonly saltRounds = 10;
  private readonly minPasswordLength = 12;
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  /**
   * Validate password strength
   * Requirements:
   * - Minimum 12 characters
   * - At least one lowercase letter
   * - At least one uppercase letter
   * - At least one number
   * - At least one special character (@$!%*?&)
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.minPasswordLength) {
      errors.push(`Password must be at least ${this.minPasswordLength} characters long`);
    }

    if (!this.passwordRegex.test(password)) {
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[@$!%*?&]/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Hash password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const validation = this.validatePassword(password);
    
    if (!validation.valid) {
      throw new Error(`Invalid password: ${validation.errors.join(', ')}`);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error('Error hashing password');
    }
  }

  /**
   * Compare plain text password with hashed password
   * @param plainPassword Plain text password to compare
   * @param hashedPassword Hashed password from database
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error('Error comparing passwords');
    }
  }

  /**
   * Generate a random password that meets security requirements
   * @returns Random secure password
   */
  generateSecurePassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@$!%*?&';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    const allChars = lowercase + uppercase + numbers + special;
    for (let i = password.length; i < this.minPasswordLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Global Bcrypt Service Instance
export const bcryptService = new BcryptService();
