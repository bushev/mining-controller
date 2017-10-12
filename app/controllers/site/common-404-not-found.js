'use strict';

const Core                = process.mainModule.require('nodejs-lib');
const BaseCiteController  = require('./base.js');
const CommonNotFoundError = require('../../errors/common-not-found');

/**
 * Error404NotFound controller
 *
 */
class Error404NotFound extends BaseCiteController {

    /**
     * Load controller
     *
     * @param callback
     */
    load(callback) {
        super.load(err => {
            if (err) return callback(err);

            callback(new CommonNotFoundError());
        });
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = (request, response, next) => {
    let controller = new Error404NotFound(request, response, next);
    controller.run();
};
