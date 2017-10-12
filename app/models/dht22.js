'use strict';

const Core      = process.mainModule.require('nodejs-lib');
const BaseModel = require('./basemodel.js');
const dhtSensor = require('node-dht-sensor');

const DHT_SENSOR_TYPE = 22;
const DHT_SENSOR_PIN  = 19;

class Dht22Model extends BaseModel {

    constructor(listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);

    }

    /**
     * Define Schema
     *
     * @override
     */
    defineSchema() {

        let schemaObject = {

            temperature: {type: Number, required: true},
            humidity: {type: Number, required: true},

            createdAt: {type: Date, 'default': Date.now, index: true}
        };

        // Creating DBO Schema
        let DBOSchema = this.createSchema(schemaObject);

        // Registering schema and initializing model
        this.registerSchema(DBOSchema);

        // Easy logic for now
        setInterval(() => {

            this.readSensor((err, data) => {
                if (err) return this.logger.error(err);

                const dataInstance = new modelInstance.model(data);

                dataInstance.save(err => {
                    if (err) this.logger.error(err);
                });
            });

        }, 1000 * 60 * 15); // Store temperature information each 15 minutes
    }

    readSensor(callback) {

        dhtSensor.read(DHT_SENSOR_TYPE, DHT_SENSOR_PIN, (err, temperature, humidity) => {
            if (err) return this.logger.warning(err);

            callback(null, {
                temperature: temperature.toFixed(1),
                humidity: humidity.toFixed(1)
            });
        });
    }
}

const modelInstance = new Dht22Model('dht22');

/**
 * Exporting Model
 *
 * @type {Function}
 */
module.exports = modelInstance;