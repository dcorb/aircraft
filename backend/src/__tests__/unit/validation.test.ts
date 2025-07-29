import { describe, it, expect } from 'vitest';
import { isValidISODate, validateTimeRangeQuery } from '../../utils/validation';

describe('Validation Utils', () => {
  describe('isValidISODate', () => {
    describe('valid dates', () => {
      it('should accept standard ISO 8601 format', () => {
        expect(isValidISODate('2024-04-15T00:00:00.000Z')).toBe(true);
      });

      it('should accept end of year date', () => {
        expect(isValidISODate('2024-12-31T23:59:59.999Z')).toBe(true);
      });

      it('should accept leap year date', () => {
        expect(isValidISODate('2024-02-29T12:30:45.123Z')).toBe(true);
      });
    });

    describe('invalid dates', () => {
      it('should reject date without time', () => {
        expect(isValidISODate('2024-04-15')).toBe(false);
      });

      it('should reject date without timezone', () => {
        expect(isValidISODate('2024-04-15T00:00:00')).toBe(false);
      });

      it('should reject completely invalid format', () => {
        expect(isValidISODate('invalid-date')).toBe(false);
      });

      it('should reject slash-separated dates', () => {
        expect(isValidISODate('2024/04/15')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidISODate('')).toBe(false);
      });

      it('should reject invalid leap year date', () => {
        expect(isValidISODate('2023-02-29T00:00:00.000Z')).toBe(false);
      });
    });
  });

  describe('validateTimeRangeQuery', () => {
    describe('valid queries', () => {
      it('should accept valid time range', () => {
        const query = {
          startTime: '2024-04-15T00:00:00.000Z',
          endTime: '2024-04-16T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.data).toEqual(query);
      });

      it('should accept same day time range', () => {
        const query = {
          startTime: '2024-04-15T09:00:00.000Z',
          endTime: '2024-04-15T17:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(query);
      });
    });

    describe('missing parameters', () => {
      it('should reject null query', () => {
        const result = validateTimeRangeQuery(null);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Query parameters are required');
        expect(result.data).toBeUndefined();
      });

      it('should reject missing startTime', () => {
        const query = { endTime: '2024-04-16T00:00:00.000Z' };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain(
          'Both startTime and endTime parameters are required',
        );
      });

      it('should reject missing endTime', () => {
        const query = { startTime: '2024-04-15T00:00:00.000Z' };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain(
          'Both startTime and endTime parameters are required',
        );
      });

      it('should reject empty object', () => {
        const result = validateTimeRangeQuery({});

        expect(result.isValid).toBe(false);
        expect(result.error).toContain(
          'Both startTime and endTime parameters are required',
        );
      });
    });

    describe('invalid parameter types', () => {
      it('should reject non-string startTime', () => {
        const query = {
          startTime: 1234567890,
          endTime: '2024-04-16T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('must be strings in ISO 8601 format');
      });

      it('should reject array as endTime', () => {
        const query = {
          startTime: '2024-04-15T00:00:00.000Z',
          endTime: ['2024-04-16T00:00:00.000Z'],
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('must be strings in ISO 8601 format');
      });
    });

    describe('invalid date formats', () => {
      it('should reject invalid startTime format', () => {
        const query = {
          startTime: 'invalid-date',
          endTime: '2024-04-16T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid date format');
      });

      it('should reject partial ISO format', () => {
        const query = {
          startTime: '2024-04-15T00:00:00',
          endTime: '2024-04-16T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid date format');
      });
    });

    describe('logical errors', () => {
      it('should reject when startTime equals endTime', () => {
        const query = {
          startTime: '2024-04-15T00:00:00.000Z',
          endTime: '2024-04-15T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('startTime must be before endTime');
      });

      it('should reject when startTime is after endTime', () => {
        const query = {
          startTime: '2024-04-16T00:00:00.000Z',
          endTime: '2024-04-15T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('startTime must be before endTime');
      });

      it('should reject time travel scenario', () => {
        const query = {
          startTime: '2025-01-01T00:00:00.000Z',
          endTime: '2024-01-01T00:00:00.000Z',
        };

        const result = validateTimeRangeQuery(query);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('startTime must be before endTime');
      });
    });
  });
});
