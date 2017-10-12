'use strict';

const async  = require('async');
const Core   = require('nodejs-lib');
const events = require('events');
const gpio   = require('pi-gpio');

/**
 * Base sensor
 */
class BaseSensor extends events.EventEmitter {

    /**
     * Class constructor
     *
     * @param pinNumber {number} GPIO pin number
     * @param [options] {object}
     * @param [options.pollTimeout] {number} sensor poll timeout in ms
     */
    constructor(pinNumber, options) {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        options = options || {};

        /**
         * Sensor pin number
         *
         * @type {number}
         */
        this.pinNumber = pinNumber;

        /**
         * Poll timeout
         *
         * @type {number}
         */
        this.pollTimeout = options.pollTimeout || 100;

        /**
         * First read flag
         *
         * @type {boolean}
         */
        this.isFirstRead = true;

        /**
         * Pooling disabled flag
         *
         * @type {boolean}
         */
        this.isPoolingDisabled = false;

        /**
         * Initial sensor value
         *
         * @type {number}
         */
        this.initialValue = 0;

        /**
         * Current sensor value
         *
         * @type {number}
         */
        this.currentValue = this.initialValue;

        /**
         * Alarm counter
         *
         * @type {number}
         */
        this.alarmCounter = 0;

        /**
         * Alarm factor. Number from 1 to pollTimeout.
         *
         * @type {number}
         */
        this.alarmFactor = 1;
    }

    /**
     * Application logger getter
     *
     * @returns {*|exports|module.exports}
     */
    static get logger() {
        return Core.ApplicationFacade.instance.logger;
    }

    /**
     * Set alarm factor
     *
     * @param alarmFactor
     */
    setAlarmFactor(alarmFactor) {

        if (this.pollTimeout < alarmFactor) {
            throw new Error(`BaseSensor::setAlarmFactor: alarmFactor (${alarmFactor}) ` +
                `can't be greater then pollTimeout (${this.pollTimeout})`);
        }

        this.alarmFactor = alarmFactor;
    }

    /**
     * Start sensor
     *
     * @param callback
     */
    run(callback) {

        async.series([callback => {

            this.bind(callback);

        }, callback => {

            this.poll();
            callback();

        }], err => {
            if (err) {
                BaseSensor.logger.error(err);

                return callback(err);
            }

            BaseSensor.logger.debug(`BaseSensor::start: pinNumber: ${this.pinNumber}, pollTimeout: ${this.pollTimeout}`);
            callback();
        });
    }

    /**
     * Bind gpio pin
     *
     * @param callback
     */
    bind(callback) {

        BaseSensor.logger.debug(`BaseSensor::bind: pinNumber: ${this.pinNumber}`);

        this.doBind(err => {
            if (err) return this.handleBindError(callback, err);

            callback();
        });
    }

    /**
     * Do bind gpio pin
     *
     * @param callback
     */
    doBind(callback) {

        BaseSensor.logger.debug(`BaseSensor::doBind: pinNumber: ${this.pinNumber}`);

        try {
            gpio.open(this.pinNumber, 'input', callback);
        } catch (err) {
            BaseSensor.logger.debug(`BaseSensor::doBind: ${err}`);

            callback(err);
        }
    }

    /**
     * Start pooling
     */
    poll() {

        this.doPoll();
    }

    /**
     * Pooling loop
     */
    doPoll() {

        if (this.isPoolingDisabled) return;

        gpio.read(this.pinNumber, (err, value) => {
            if (err) {
                if (this.isFirstRead) {
                    this.handleFirstReadError(err);
                } else {
                    this.handleReadError(err);
                }

                return;
            }

            this.isFirstRead = false;

            this.emit('value', value);

            this.handleSensorValue(value);

            setTimeout(() => {
                this.doPoll();
            }, this.pollTimeout);
        });
    }

    /**
     * Handle sensor value
     *
     * @param value
     */
    handleSensorValue(value) {

        if (this.currentValue !== value) {

            BaseSensor.logger.debug(`BaseSensor::handleSensorValue: pinNumber: ${this.pinNumber}, value: ${value}`);

            this.emit('change', value);

            this.currentValue = value;
        }

        if (this.initialValue !== this.currentValue) {

            this.alarmCounter += 1 * this.alarmFactor;

            if (this.alarmCounter > 100) {

                BaseSensor.logger.info(`BaseSensor::handleSensorValue: pinNumber: ${this.pinNumber}, alarm!`);

                this.emit('alarm');
                this.alarmCounter = 0;
            }

        } else if (this.alarmCounter > 1) {

            this.alarmCounter -= 1;
        }
    }

    /**
     * Close relay PIN
     *
     * @param callback
     */
    close(callback) {

        try {
            gpio.close(this.pinNumber, callback);
        } catch (err) {
            BaseSensor.logger.debug(`BaseSensor::close: ${err}`);

            callback(err);
        }
    }

    /**
     * Handle pin bind error
     *
     * Try to close & rebind
     *
     * @param callback
     * @param error
     */
    handleBindError(callback, error) {

        BaseSensor.logger.error(`BaseSensor::handleBindError: ` + error);

        try {
            gpio.close(this.pinNumber, err => {
                if (err) return callback(err);

                this.doBind(callback);
            });

        } catch (err) {
            BaseSensor.logger.error(`BaseSensor::handleBindError: ${err}`);

            callback(err);
        }
    }

    /**
     * Handle pin first read error
     *
     * TODO: Try to reconnect ?
     *
     * @param error
     */
    handleFirstReadError(error) {

        BaseSensor.logger.error(`BaseSensor::handleFirstReadError: ${error}`);

        this.emit('error', error);
        this.isPoolingDisabled = true;
    }

    /**
     * Handle pin read error
     *
     * TODO: Try to reconnect ?
     *
     * @param error
     */
    handleReadError(error) {

        BaseSensor.logger.error(`BaseSensor::handleReadError: ${error}`);

        this.emit('error', error);
        this.isPoolingDisabled = true;
    }
}

/**
 * Exporting Sensor
 *
 * @type {Function}
 */
module.exports = BaseSensor;