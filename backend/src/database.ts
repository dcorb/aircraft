import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Create in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE flights (
    flightId TEXT PRIMARY KEY,
    airline TEXT,
    registration TEXT,
    aircraftType TEXT,
    flightNum TEXT,
    schedDepTime TEXT,
    schedArrTime TEXT,
    actualDepTime TEXT,
    actualArrTime TEXT,
    estimatedDepTime TEXT,
    estimatedArrTime TEXT,
    schedDepStation TEXT,
    schedArrStation TEXT,
    depStand TEXT,
    origDepStand TEXT,
    arrStand TEXT,
    origArrStand TEXT
  );

  CREATE TABLE workPackages (
    workPackageId TEXT PRIMARY KEY,
    name TEXT,
    station TEXT,
    status TEXT,
    area TEXT,
    registration TEXT,
    startDateTime TEXT,
    endDateTime TEXT
  );
`);

// Seed data from JSON files
function seedDatabase() {
  try {
    // Load flights data
    const flightsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/flights.json'), 'utf8'),
    );

    // Load work packages data
    const workPackagesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../data/workPackages.json'),
        'utf8',
      ),
    );

    // Insert flights
    const insertFlight = db.prepare(`
      INSERT INTO flights (
        flightId, airline, registration, aircraftType, flightNum,
        schedDepTime, schedArrTime, actualDepTime, actualArrTime,
        estimatedDepTime, estimatedArrTime, schedDepStation, schedArrStation,
        depStand, origDepStand, arrStand, origArrStand
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const flight of flightsData) {
      insertFlight.run(
        flight.flightId,
        flight.airline,
        flight.registration,
        flight.aircraftType,
        flight.flightNum,
        flight.schedDepTime,
        flight.schedArrTime,
        flight.actualDepTime,
        flight.actualArrTime,
        flight.estimatedDepTime,
        flight.estimatedArrTime,
        flight.schedDepStation,
        flight.schedArrStation,
        flight.depStand,
        flight.origDepStand,
        flight.arrStand,
        flight.origArrStand,
      );
    }

    // Insert work packages
    const insertWorkPackage = db.prepare(`
      INSERT INTO workPackages (
        workPackageId, name, station, status, area, registration, startDateTime, endDateTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const wp of workPackagesData) {
      insertWorkPackage.run(
        wp.workPackageId,
        wp.name,
        wp.station,
        wp.status,
        wp.area,
        wp.registration,
        wp.startDateTime,
        wp.endDateTime,
      );
    }

    console.log(
      `Seeded database with ${flightsData.length} flights and ${workPackagesData.length} work packages`,
    );
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Seed the database on startup
seedDatabase();

export { db };
