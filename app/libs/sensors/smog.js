'use strict';

const BaseSensor = require('./base');
const rigModel   = require('../../models/rig');

/**
 * Smog Sensor
 */
class SmogSensor extends BaseSensor {

    /**
     * Class constructor
     *
     * @param pinNumber {number} GPIO pin number
     * @param [options] {object}
     * @param [options.pollTimeout] {number} sensor poll timeout in ms
     */
    constructor(pinNumber, options) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(pinNumber, options);

        /**
         * Alarm factor
         *
         * @type {number}
         */
        this.alarmFactor = 10;

        BaseSensor.logger.error('Smog sensor running..');
    }
}

let sensor = new SmogSensor(29);

sensor.on('alarm', () => {

    BaseSensor.logger.error(`Smog detected!!! Show down all rigs in progress..`);

    rigModel.shutDownRigs(err => {
        if (err) BaseSensor.logger.error(err);

        BaseSensor.logger.error(`Add rigs are disabled`);
    });
});

module.exports = sensor;