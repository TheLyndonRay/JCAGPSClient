const amqp = require('amqplib');
const distance = require('gps-distance');

const cycle = 1000;
const exchangeType = 'fanout';

class GPSClient {

    constructor(exchangeName, queueName, routingKey) {
        this.exchangeName = exchangeName;
        this.queueName = queueName;
        this.routingKey = routingKey;

        // start location hard coded - Memory Express
        this.currentGPS = {
            LAT : 49.8997107,
            LONG : -97.2055954
        }
    }

    buildPayload() {
        return {
            exchange : this.exchangeName,
            queue : this.queueName,
            key : this.routingKey,
            gps : this.currentGPS
        }
    }

    async initialize() {
        try {
            const connection = await amqp.connect('amqp://localhost');
            this.channel = await connection.createChannel();

            await this.channel.assertExchange(this.exchangeName, exchangeType, { durable: false });
            const { queue } = await this.channel.assertQueue(this.queueName, { exclusive: true });
            await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);

            console.log('Waiting for other devices...');

            this.channel.consume(queue, (message) => {
                if (message) {
                    const gpsPayload = JSON.parse(message.content.toString());
                    if (gpsPayload.queue !== this.queueName) {
                        // We're looking at a different device/gpsClient
                        const distanceKm = this.calculateDistanceInKm(gpsPayload.gps);
                        
                        console.log(`GPS Client ${gpsPayload.queue} is ${distanceKm} kms away.`);

                        this.channel.ack(message);
                    }
                }
            });
        } catch (error) {
            console.error('Something went wrong:', error);
        }
    }

    // check gps every 1 sec and call randomMove() to move
    startCycle() {
        const gpsCycle = setInterval(() => {
            this.randomMove();

            if (this.channel) {
                const bufferedPayload = Buffer.from(JSON.stringify(this.buildPayload()));
                this.channel.publish(this.exchangeName, this.routingKey, bufferedPayload);
            } else {
                console.log('Something went wrong. Check channel.');
            }

        }, cycle);
    }

    // Randomly move in straight line
    randomMove() {
        const direction = Math.random() < 0.5;
        const axis = Math.random() < 0.5;
        let distance = Math.floor(Math.random() * 100) / 100;

        if (!direction) {
            distance = distance * -1;
        }

        if (axis) {
            this.currentGPS.LAT = (this.currentGPS.LAT + distance);
        } else {
            this.currentGPS.LONG = (this.currentGPS.LONG + distance);
        }
    }

    calculateDistanceInKm(otherGps) {
        const distanceKm = distance(this.currentGPS.LAT, this.currentGPS.LONG, otherGps.LAT, otherGps.LONG);
        return Math.round(distanceKm * 100) / 100;
    }
}

module.exports = GPSClient;