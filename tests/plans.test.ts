// tests/plans.test.ts
// Unit tests for payment plan configuration
import { describe, it, expect } from 'vitest';
import { PLANS } from '../src/lib/plans';

describe('Payment Plans', () => {
  it('has three plan tiers', () => {
    const keys = Object.keys(PLANS);
    expect(keys).toHaveLength(3);
    expect(keys).toContain('student-single');
    expect(keys).toContain('student-premium');
    expect(keys).toContain('school');
  });

  it('student-single has correct pricing', () => {
    expect(PLANS['student-single'].amountNGN).toBe(10000);
    expect(PLANS['student-single'].amountUSD).toBe(650);
    expect(PLANS['student-single'].durationDays).toBe(90);
  });

  it('student-premium has correct pricing', () => {
    expect(PLANS['student-premium'].amountNGN).toBe(25000);
    expect(PLANS['student-premium'].amountUSD).toBe(1600);
    expect(PLANS['student-premium'].durationDays).toBe(90);
  });

  it('school plan has null amounts (custom pricing)', () => {
    expect(PLANS['school'].amountNGN).toBeNull();
    expect(PLANS['school'].amountUSD).toBeNull();
    expect(PLANS['school'].durationDays).toBe(365);
  });

  it('all plans have features array', () => {
    for (const plan of Object.values(PLANS)) {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });

  it('all plans have a name', () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan.name).toBeTypeOf('string');
      expect(plan.name.length).toBeGreaterThan(0);
    }
  });
});
