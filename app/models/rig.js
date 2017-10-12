'use strict';

const Core      = process.mainModule.require('nodejs-lib');
const BaseModel = require('./basemodel.js');
const async     = require('async');
const moment    = require('moment');

const REBOOT_INTERVAL_IN_MINUTES    = 10;
const MAX_NUMBER_OF_REPORT_TO_STORE = 20;

class RigModel extends BaseModel {

    constructor(listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);

        this.inFieldFilterFields = [{
            name: 'inFieldStatus',
            field: 'status'
        }];

        this.lastReportedRates = {};
    }

    /**
     * Define Schema
     *
     * @override
     */
    defineSchema() {

        let Types = this.mongoose.Schema.Types;
        let $this = this;

        let schemaObject = {

            name: {type: String, required: true},

            ethAddress: {type: String, required: true},

            ipAddress: {type: String, index: true, unique: true},

            powerPin: {type: Number},

            minRate: {type: Number},

            fansSpeed: {type: Number, 'default': 100, required: true, index: true},

            status: {
                type: String,
                index: true,
                required: true,
                'enum': ['running', 'stopped'],
                'default': 'stopped'
            },

            totalSpeed: {type: Number, 'default': 0, index: true},

            gpu: [{
                name: String,
                speed: Number,
                temperature: Number,
                fanSpeed: Number
            }],

            lastReportReceivedAt: {type: Date, index: true},

            restarts: [{
                reason: {
                    type: String,
                    index: true,
                    required: true,
                    'enum': ['no-reports-for-a-long-time', 'low-rate']
                },
                message: {type: String},
                restartedAt: {type: Date, 'default': Date.now, index: true, required: true}
            }],

            startedAt: {type: Date, index: true},
            stoppedAt: {type: Date, index: true},
            updatedAt: {type: Date, 'default': Date.now, index: true},
            createdAt: {type: Date, 'default': Date.now, index: true}
        };

        // Creating DBO Schema
        let DBOSchema = this.createSchema(schemaObject);

        DBOSchema.post('save', (rig) => {

            if (!rig.minRate) return;

            if (!this.lastReportedRates[rig.id]) {

                this.lastReportedRates[rig.id] = [];
            }

            this.lastReportedRates[rig.id].push(rig.totalSpeed);

            this.logger.debug(`Rates (${rig.name}): ${require('util').inspect(this.lastReportedRates[rig.id])}`);

            if (this.lastReportedRates[rig.id].length > MAX_NUMBER_OF_REPORT_TO_STORE) {

                this.lastReportedRates[rig.id] =
                    this.lastReportedRates[rig.id]
                        .slice(this.lastReportedRates[rig.id].length - MAX_NUMBER_OF_REPORT_TO_STORE, this.lastReportedRates[rig.id].length);

                let sum = 0;

                this.lastReportedRates[rig.id].forEach(lastReportedRate => {
                    sum += lastReportedRate;
                });

                const averageRate = Math.round(sum / this.lastReportedRates[rig.id].length);

                this.logger.debug(`averageRate (${rig.name}): ${averageRate}`);

                if (averageRate < rig.minRate) {

                    this.logger.error(`Restarting ${rig.name} due to low rate. averageRate: ${averageRate} min: ${rig.minRate}`);

                    rig.reboot(err => {

                        if (err) {

                            this.logger.error(err);

                        } else {

                            rig.restarts.push({
                                reason: 'low-rate',
                                message: `Average rate is ${averageRate}`
                            });

                            rig.save(err => {
                                if (err) this.logger.error(err);
                            });
                        }
                    });
                }
            }
        });

        DBOSchema.methods.start = function (callback) {

            const gpio = require('pi-gpio');

            let rig = this;

            if (!rig.powerPin) return callback(new Error('Power PIN is not defined'));

            $this.logger.info(`Starting rig "${rig.name}", using PIN #${rig.powerPin}`);

            async.series([callback => {

                // Try un-export first
                gpio.close(rig.powerPin, (err) => {
                    if (err) $this.logger.debug(err); // ignore error here

                    callback()
                });

            }, callback => {

                gpio.open(rig.powerPin, 'output', callback);

            }, callback => {

                gpio.write(rig.powerPin, 0, callback);

            }, callback => {

                setTimeout(callback, 1000);

            }, callback => {

                gpio.write(rig.powerPin, 1, callback);

            }, callback => {

                gpio.close(rig.powerPin);

                rig.status    = 'running';
                rig.startedAt = new Date();
                rig.stoppedAt = undefined;

                $this.lastReportedRates[rig.id] = []; // Remove old history

                rig.save(callback);

            }, callback => {

                $this.logger.info(`Rig "${rig.name}" started`);

                callback();

            }], callback);
        };

        DBOSchema.methods.shutdown = function (callback) {

            const gpio = require('pi-gpio');

            let rig = this;

            if (!rig.powerPin) return callback(new Error('Power PIN is not defined'));

            $this.logger.info(`Stopping rig "${rig.name}", using PIN #${rig.powerPin}`);

            async.series([callback => {

                // Try un-export first
                gpio.close(rig.powerPin, (err) => {
                    if (err) $this.logger.debug(err); // ignore error here

                    callback()
                });

            }, callback => {

                gpio.open(rig.powerPin, 'output', callback);

            }, callback => {

                gpio.write(rig.powerPin, 0, callback);

            }, callback => {

                setTimeout(callback, 5000);

            }, callback => {

                gpio.write(rig.powerPin, 1, callback);

            }, callback => {

                gpio.close(rig.powerPin);

                rig.status    = 'stopped';
                rig.stoppedAt = new Date();
                rig.startedAt = undefined;

                rig.save(callback);

            }, callback => {

                $this.logger.info(`Rig "${rig.name}" stopped`);

                callback();

            }], callback);
        };

        DBOSchema.methods.reboot = function (callback) {

            let rig = this;

            async.series([callback => {

                rig.shutdown(callback);

            }, callback => {

                setTimeout(callback, 3000);

            }, callback => {

                rig.start(callback);

            }], callback);
        };

        // Registering schema and initializing model
        this.registerSchema(DBOSchema);

        // Easy logic for now
        setInterval(() => {

            modelInstance.model.find({
                $or: [{
                    lastReportReceivedAt: {
                        $lt: moment().subtract(REBOOT_INTERVAL_IN_MINUTES, 'minutes')
                    },
                }, {
                    lastReportReceivedAt: {$exists: false}
                }],
                status: 'running'
            }, (err, rigsToRestart) => {
                if (err) return this.logger.error(err);

                async.eachSeries(rigsToRestart, (rigToRestart, callback) => {

                    this.logger.error(`Restarting ${rigToRestart.name} due to inactivity.`);

                    rigToRestart.reboot(err => {

                        if (err) {

                            this.logger.error(err);

                            callback();

                        } else {

                            rigToRestart.restarts.push({
                                reason: 'no-reports-for-a-long-time'
                            });

                            rigToRestart.save(err => {
                                if (err) this.logger.error(err);

                                callback();
                            });
                        }
                    });

                }, err => {
                    if (err) this.logger.error(err);
                });
            });

        }, REBOOT_INTERVAL_IN_MINUTES * 60 * 1000);
    }

    /**
     * Validating item before save
     *
     * @param item
     * @param validationCallback
     * @returns {array}
     */
    validate(item, validationCallback) {
        let validationMessages = [];

        if (!item.name) {
            validationMessages.push('Rig name must be specified');
        }

        validationCallback(Core.ValidationError.create(validationMessages));
    }

    /**
     * Shutdown running rigs
     *
     * @param callback
     */
    shutDownRigs(callback) {

        modelInstance.model.find({status: 'running'}, (err, rigsToShutDown) => {
            if (err) return this.logger.error(err);

            async.each(rigsToShutDown, (rigToShutDown, callback) => {

                rigToShutDown.shutdown(err => {

                    if (err) {

                        this.logger.error(err);

                        callback();

                    } else {

                        callback();
                    }
                });

            }, err => {
                if (err) this.logger.error(err);

                callback();
            });
        });
    }
}

const modelInstance = new RigModel('rig');

/**
 * Exporting Model
 *
 * @type {Function}
 */
module.exports = modelInstance;