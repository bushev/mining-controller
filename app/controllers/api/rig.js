'use strict';

const Core              = require('nodejs-lib');
const BaseApiController = require('./base.js');
const rigModel          = require('../../models/rig');

class RigStatusApiController extends BaseApiController {

    init(callback) {
        super.init(err => {
            if (err) return callback(err);

            this.registerAction('init', 'initiateRig');
            this.registerAction('status');

            callback();
        });
    }

    initiateRig(callback) {

        let ipAddress = this.request.connection.remoteAddress;

        if (ipAddress.indexOf(':') > -1) {

            ipAddress = ipAddress.split(':')[ipAddress.split(':').length - 1];
        }

        rigModel.model.findOne({ipAddress: ipAddress}, (err, rig) => {
            if (err) return callback(err);
            if (!rig) return callback(new Error(`Rig with IP "${ipAddress}" was not found`));

            this.terminate();

            this.response.json({
                name: rig.name,
                ethAddress: rig.ethAddress
            });

            callback();
        });
    }

    status(callback) {

        rigModel.model.findOne({name: this.request.params.rigName}, (err, rig) => {
            if (err) return callback(err);
            if (!rig) return callback(new Error(`Rig "${this.request.params.rigName}" not found`));

            rig.totalSpeed           = this.request.body.totalSpeed;
            rig.gpu                  = this.request.body.gpu;
            rig.lastReportReceivedAt = new Date();

            this.logger.debug(`Report for ${rig.name}, speed: ${rig.totalSpeed} Mh/s`);

            rig.save(err => {
                if (err) return callback(err);

                this.terminate();
                this.response.status(201).json({
                    fansSpeed: rig.fansSpeed
                });
                callback();
            });
        });
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = function (request, response) {
    let controller = new RigStatusApiController(request, response);
    controller.run();
};
