import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient } from '../utils/supabase-mock';

describe('Auth Integration', () => {
  let supabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    supabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      supabase.auth.signUp.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle registration error', async () => {
      const mockError = { message: 'Email already exists' };
      supabase.auth.signUp.mockResolvedValue({ 
        data: { user: null }, 
        error: mockError 
      });

      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithPassword', () => {
    it('should login user successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123', refresh_token: 'refresh123' };
      
      supabase.auth.signInWithPassword.mockResolvedValue({ 
        data: { user: mockUser, session: mockSession }, 
        error: null 
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle login error', async () => {
      const mockError = { message: 'Invalid credentials' };
      supabase.auth.signInWithPassword.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: mockError 
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});