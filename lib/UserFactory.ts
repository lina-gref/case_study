/**
 * UserFactory: Centralized test user creation
 * 
 * Why a factory?
 * - Single source of truth for test credentials and roles
 * - Easy to add new user types without changing tests
 * - Supports different environments (staging, prod) without code duplication
 */

export interface TestUser {
  email: string;
  password: string;
  userId: string;
  plan: 'premium' | 'free' | 'admin';
  credits: number;
}

export class UserFactory {
  static create(userType: 'premium' | 'free' | 'admin'): TestUser {
    const users: Record<'premium' | 'free' | 'admin', TestUser> = {
      premium: {
        email: 'premium-user@everai.test',
        password: 'SecurePassword123!',
        userId: 'user_premium_001',
        plan: 'premium',
        credits: 5000,
      },
      free: {
        email: 'free-user@everai.test',
        password: 'SecurePassword123!',
        userId: 'user_free_001',
        plan: 'free',
        credits: 10,
      },
      admin: {
        email: 'admin@everai.test',
        password: 'AdminPassword123!',
        userId: 'user_admin_001',
        plan: 'admin',
        credits: 10000,
      },
    };
    return users[userType];
  }
}
