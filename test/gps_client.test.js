const GPSClient = require('../app/gps_client');

describe('GPSClient', () => {
    const gpsClient = new GPSClient();

    test('Test distance from JCA', () => {
        const jcaGps = {LAT:49.8928044,LONG:-97.2092846};
        const distanceFromJCA = 0.81; // in Km
        expect(gpsClient.calculateDistanceInKm(jcaGps)).toEqual(distanceFromJCA);
    });

    test('Test distance from Memory Express', () => {
        const memexGps = {LAT:49.8997107,LONG:-97.2055954};
        const distanceFromMemex = 0; // in Km
        expect(gpsClient.calculateDistanceInKm(memexGps)).toEqual(distanceFromMemex);
    });
});
