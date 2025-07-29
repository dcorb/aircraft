import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import type { Flight, WorkPackage } from '../../models/types';

describe('API Integration Tests', () => {
  beforeAll(() => {
    // Database is already initialized by importing ../../app
  });

  afterAll(() => {
    // Database cleanup if needed
  });

  describe('GET /api/flights', () => {
    describe('successful requests', () => {
      it('should return flights for valid time range', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: '2024-04-15T00:00:00.000Z',
            endTime: '2024-04-16T00:00:00.000Z',
          })
          .expect(200);

        expect(response.body).toHaveProperty('flights');
        expect(response.body).toHaveProperty('timeRange');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.flights)).toBe(true);
        expect(response.body.timeRange.startTime).toBe(
          '2024-04-15T00:00:00.000Z',
        );
        expect(response.body.timeRange.endTime).toBe(
          '2024-04-16T00:00:00.000Z',
        );
        expect(response.body.count).toBe(response.body.flights.length);
      });

      it('should return empty array for time range with no flights', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: '2025-01-01T00:00:00.000Z',
            endTime: '2025-01-02T00:00:00.000Z',
          })
          .expect(200);

        expect(response.body.flights).toEqual([]);
        expect(response.body.count).toBe(0);
      });

      it('should filter flights correctly by scheduled departure time', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: '2024-04-15T00:00:00.000Z',
            endTime: '2024-04-15T12:00:00.000Z',
          })
          .expect(200);

        // All returned flights should have schedDepTime within the range
        response.body.flights.forEach((flight: Flight) => {
          const schedDepTime = new Date(flight.schedDepTime);
          const startTime = new Date('2024-04-15T00:00:00.000Z');
          const endTime = new Date('2024-04-15T12:00:00.000Z');

          expect(schedDepTime.getTime()).toBeGreaterThanOrEqual(
            startTime.getTime(),
          );
          expect(schedDepTime.getTime()).toBeLessThan(endTime.getTime());
        });
      });

      it('should return flights in ascending order by schedDepTime', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: '2024-04-15T00:00:00.000Z',
            endTime: '2024-04-16T00:00:00.000Z',
          })
          .expect(200);

        if (response.body.flights.length > 1) {
          for (let i = 1; i < response.body.flights.length; i++) {
            const prev = new Date(response.body.flights[i - 1].schedDepTime);
            const curr = new Date(response.body.flights[i].schedDepTime);
            expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
          }
        }
      });
    });

    describe('error handling', () => {
      it('should return 400 for missing startTime parameter', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            endTime: '2024-04-16T00:00:00.000Z',
          })
          .expect(400);

        expect(response.body.error).toContain(
          'Both startTime and endTime parameters are required',
        );
      });

      it('should return 400 for missing endTime parameter', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: '2024-04-15T00:00:00.000Z',
          })
          .expect(400);

        expect(response.body.error).toContain(
          'Both startTime and endTime parameters are required',
        );
      });

      it('should return 400 for invalid date format', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: 'invalid-date',
            endTime: '2024-04-16T00:00:00.000Z',
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid date format');
      });

      it('should return 400 when startTime is after endTime', async () => {
        const response = await request(app)
          .get('/api/flights')
          .query({
            startTime: '2024-04-16T00:00:00.000Z',
            endTime: '2024-04-15T00:00:00.000Z',
          })
          .expect(400);

        expect(response.body.error).toContain(
          'startTime must be before endTime',
        );
      });
    });
  });

  describe('GET /api/work-packages', () => {
    describe('successful requests', () => {
      it('should return work packages for valid time range', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({
            startTime: '2024-04-15T00:00:00.000Z',
            endTime: '2024-04-16T00:00:00.000Z',
          })
          .expect(200);

        expect(response.body).toHaveProperty('workPackages');
        expect(response.body).toHaveProperty('timeRange');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.workPackages)).toBe(true);
        expect(response.body.count).toBe(response.body.workPackages.length);
      });

      it('should return empty array for time range with no work packages', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({
            startTime: '2025-01-01T00:00:00.000Z',
            endTime: '2025-01-02T00:00:00.000Z',
          })
          .expect(200);

        expect(response.body.workPackages).toEqual([]);
        expect(response.body.count).toBe(0);
      });

      it('should return work packages that overlap with time range', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({
            startTime: '2024-04-16T10:00:00.000Z',
            endTime: '2024-04-16T14:00:00.000Z',
          })
          .expect(200);

        // Check that all returned work packages actually overlap with the query range
        response.body.workPackages.forEach((wp: WorkPackage) => {
          const wpStart = new Date(wp.startDateTime);
          const wpEnd = new Date(wp.endDateTime);
          const queryStart = new Date('2024-04-16T10:00:00.000Z');
          const queryEnd = new Date('2024-04-16T14:00:00.000Z');

          // Work package overlaps if: queryStart < wp.endDateTime AND queryEnd > wp.startDateTime
          const overlaps =
            queryStart.getTime() < wpEnd.getTime() &&
            queryEnd.getTime() > wpStart.getTime();
          expect(overlaps).toBe(true);
        });
      });

      it('should return work packages in ascending order by startDateTime', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({
            startTime: '2024-04-15T00:00:00.000Z',
            endTime: '2024-04-17T00:00:00.000Z',
          })
          .expect(200);

        if (response.body.workPackages.length > 1) {
          for (let i = 1; i < response.body.workPackages.length; i++) {
            const prev = new Date(
              response.body.workPackages[i - 1].startDateTime,
            );
            const curr = new Date(response.body.workPackages[i].startDateTime);
            expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
          }
        }
      });
    });

    describe('error handling', () => {
      it('should return 400 for missing parameters', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({})
          .expect(400);

        expect(response.body.error).toContain(
          'Both startTime and endTime parameters are required',
        );
      });

      it('should return 400 for invalid date format', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({
            startTime: 'invalid-date',
            endTime: '2024-04-16T00:00:00.000Z',
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid date format');
      });

      it('should return 400 when startTime >= endTime', async () => {
        const response = await request(app)
          .get('/api/work-packages')
          .query({
            startTime: '2024-04-16T00:00:00.000Z',
            endTime: '2024-04-15T00:00:00.000Z',
          })
          .expect(400);

        expect(response.body.error).toContain(
          'startTime must be before endTime',
        );
      });
    });
  });
});
