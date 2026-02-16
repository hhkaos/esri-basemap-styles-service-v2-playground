import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setWithTTL, getWithTTL, isValid, remove, clear, getTimeRemaining } from './storage';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    globalThis.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('setWithTTL', () => {
    it('should store value with TTL', () => {
      const key = 'test-key';
      const value = { foo: 'bar' };

      setWithTTL(key, value);

      const stored = globalThis.localStorage.getItem(key);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored);
      expect(parsed.value).toEqual(value);
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.ttl).toBeDefined();
    });

    it('should use custom TTL', () => {
      const key = 'test-key';
      const value = 'test-value';
      const customTTL = 5000;

      setWithTTL(key, value, customTTL);

      const stored = globalThis.localStorage.getItem(key);
      const parsed = JSON.parse(stored);
      expect(parsed.ttl).toBe(customTTL);
    });
  });

  describe('getWithTTL', () => {
    it('should retrieve valid (non-expired) value', () => {
      const key = 'test-key';
      const value = { data: 'test' };
      const ttl = 10000; // 10 seconds

      setWithTTL(key, value, ttl);

      const retrieved = getWithTTL(key);
      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent key', () => {
      const retrieved = getWithTTL('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should return null for expired value', () => {
      const key = 'test-key';
      const value = 'test';

      // Manually set expired item
      const now = Date.now();
      const item = {
        value,
        timestamp: now - 2000, // 2 seconds ago
        ttl: 1000, // 1 second TTL (so it's expired)
      };
      globalThis.localStorage.setItem(key, JSON.stringify(item));

      const retrieved = getWithTTL(key);
      expect(retrieved).toBeNull();

      // Should also remove expired item
      expect(globalThis.localStorage.getItem(key)).toBeNull();
    });
  });

  describe('isValid', () => {
    it('should return true for valid item', () => {
      const key = 'test-key';
      setWithTTL(key, 'value', 10000);

      expect(isValid(key)).toBe(true);
    });

    it('should return false for non-existent item', () => {
      expect(isValid('non-existent')).toBe(false);
    });

    it('should return false for expired item', () => {
      const key = 'test-key';

      // Manually set expired item
      const now = Date.now();
      const item = {
        value: 'test',
        timestamp: now - 2000,
        ttl: 1000,
      };
      globalThis.localStorage.setItem(key, JSON.stringify(item));

      expect(isValid(key)).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove item from storage', () => {
      const key = 'test-key';
      setWithTTL(key, 'value');

      expect(globalThis.localStorage.getItem(key)).toBeTruthy();

      remove(key);

      expect(globalThis.localStorage.getItem(key)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      setWithTTL('key1', 'value1');
      setWithTTL('key2', 'value2');
      setWithTTL('key3', 'value3');

      expect(globalThis.localStorage.getItem('key1')).toBeTruthy();

      clear();

      expect(globalThis.localStorage.getItem('key1')).toBeNull();
      expect(globalThis.localStorage.getItem('key2')).toBeNull();
      expect(globalThis.localStorage.getItem('key3')).toBeNull();
    });
  });

  describe('getTimeRemaining', () => {
    it('should return time remaining for valid item', () => {
      const key = 'test-key';
      const ttl = 10000; // 10 seconds

      setWithTTL(key, 'value', ttl);

      const remaining = getTimeRemaining(key);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(ttl);
    });

    it('should return -1 for non-existent item', () => {
      expect(getTimeRemaining('non-existent')).toBe(-1);
    });

    it('should return -1 for expired item', () => {
      const key = 'test-key';

      // Manually set expired item
      const now = Date.now();
      const item = {
        value: 'test',
        timestamp: now - 2000,
        ttl: 1000,
      };
      globalThis.localStorage.setItem(key, JSON.stringify(item));

      expect(getTimeRemaining(key)).toBe(-1);
    });
  });
});
