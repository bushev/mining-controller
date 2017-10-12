'use strict';

const Core      = process.mainModule.require('nodejs-lib');
const constants = require('../constants');
const path      = require('path');
const moment    = require('moment');

/**
 *  Base CRUD controller
 */
class BaseCRUDController extends Core.Controllers.CRUDController {

    constructor(request, response, next) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response, next);

        /**
         * Path to UI templates
         *
         * @type {string}
         * @private
         */
        this._baseViewsDir = path.join(__dirname, '..', 'views');

        /**
         * Init application constants
         *
         * @type {*|exports|module.exports}
         */
        this.data.c = constants;
    }

    /**
     * Application logger getter
     *
     * @returns {Logger|exports|module.exports}
     */
    get logger() {

        return Core.ApplicationFacade.instance.logger;
    }

    /**
     * Get client IP address
     *
     * @returns {*}
     */
    get ipAddress() {

        //return '93.120.167.236';
        return this.request.headers['cf-connecting-ip'] || this.request.connection.remoteAddress;
    }

    /**
     * Render error
     */
    renderError(error) {

        if (!error.shouldBeHandled) {

            return super.renderError(error);
        }

        this.data.moment = moment;

        let view = Core.View.htmlView(error.viewPath, this.data);

        view.render(this.response, this.request, {statusCode: error.code});
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = BaseCRUDController;
