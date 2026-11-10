import { describe, it, expect } from 'vitest';
import { generateRandomContent, getRandomElement } from './random.js';

describe('Random Utils', () => {
  it('generateRandomContent returns a non-empty string with length between 5 and 50', () => {
    const str = generateRandomContent();
    expect(typeof str).toBe('string');
    expect(str.length).toBeGreaterThanOrEqual(5);
    expect(str.length).toBeLessThanOrEqual(50);
  });

  it('getRandomElement picks an element from array', () => {
    const list = ['a', 'b', 'c'];
    const chosen = getRandomElement(list);
    expect(list).toContain(chosen);
  });
});
