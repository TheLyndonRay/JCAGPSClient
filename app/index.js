const GPSClient = require('./gps_client');
const prompt = require('prompt-sync')();

const clientName = prompt('Client name: ');
const exchangeName = 'gpsExchange';
const queueName = 'gpsQueue_' + clientName
const routingKey = 'gpsKey_' + clientName;

const gpsClient = new GPSClient(exchangeName, queueName, routingKey);
gpsClient.initialize()
    .then(() => {
        gpsClient.startCycle();
    }).catch((error) => {
        console.error('Something bad happened:', error);
    });