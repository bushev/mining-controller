'use strict';

const Core                = require('nodejs-lib');
const AdminCRUDController = require('./base_crud');
const Camera              = require('../../libs/camera');
const dht22Model          = require('../../models/dht22');

const path   = require('path');
const moment = require('moment');
const async  = require('async');

class Index extends AdminCRUDController {

    constructor(request, response, next) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response, next);

        /**
         * Context of the controller
         *
         * @type {string}
         * @private
         */
        this._baseUrl = '/admin';
    }

    init(callback) {
        super.init(err => {
            if (err) return callback(err);

            this.registerAction('start-stream', 'startStream');
            this.registerAction('stop-stream', 'stopStream');

            callback();
        });
    }

    startStream(callback) {

        Camera.startStream(err => {
            if (err) return callback(err);

            this.flash.addMessage(`Stream started!`, Core.FlashMessageType.SUCCESS);
            this.terminate();
            this.response.redirect('/admin');

            callback();
        });
    }

    stopStream(callback) {

        Camera.stopStream(err => {
            if (err) return callback(err);

            this.flash.addMessage(`Stream stopped!`, Core.FlashMessageType.SUCCESS);
            this.terminate();
            this.response.redirect('/admin');

            callback();
        });
    }

    /**
     * Load view file
     *
     * @param callback
     */
    load(callback) {

        this.data.isStreaming = Camera.isStreaming;
        this.data.streamUrl   = Camera.streamUrl;

        async.parallel([callback => {

            dht22Model.readSensor((err, data) => {
                if (err) return callback(err);

                this.data.temperature = data.temperature;
                this.data.humidity    = data.humidity;

                callback();
            });

        }, callback => {

            dht22Model.model.find({createdAt: {$gte: moment().subtract(7, 'days')}}).exec((err, dht22Data) => {
                if (err) return callback(err);

                this.data.dht22Data = {
                    labels: dht22Data.map(item => moment(item.createdAt).format('D MMM, hh:mm')),
                    temperature: dht22Data.map(item => item.temperature),
                    humidity: dht22Data.map(item => item.humidity)
                };

                callback();
            });

        }], err => {
            if (err) return callback(err);

            this.view(Core.ModuleView.htmlView(path.resolve(__dirname, '..', '..', 'views', 'admin', 'index.swig')));

            callback();
        });
    }

}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = (request, response, next) => {
    let controller = new Index(request, response, next);
    controller.run();
};