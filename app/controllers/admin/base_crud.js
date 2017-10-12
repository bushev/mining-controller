'use strict';

const Core                    = process.mainModule.require('nodejs-lib');
const path                    = require('path');
const AdminBaseCRUDController = require('nodejs-admin').Admin.Controllers.BaseCRUD;

/**
 * Base application controller
 */
class AdminCRUDController extends AdminBaseCRUDController {
    /**
     * Controller constructor
     */
    constructor(request, response, next) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response, next);

        /**
         * Path to UI templates
         *
         * @type {string}
         * @private
         */
        this._baseViewsDir = path.join(__dirname, '../..', 'views', 'admin');
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
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = AdminCRUDController;
