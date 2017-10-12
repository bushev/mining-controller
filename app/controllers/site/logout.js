'use strict';

const Core           = require('nodejs-lib');
const BaseController = require('../base.js');

/**
 * LogOutController controller
 */
class LogOutController extends BaseController {

    /**
     * Load view file
     *
     * @param dataReadyCallback
     */
    load(dataReadyCallback) {
        this.request.logout();
        this.terminate();
        this.response.redirect('/');
        dataReadyCallback();
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
exports = module.exports = function (request, response) {
    let controller = new LogOutController(request, response);
    controller.run();
};
