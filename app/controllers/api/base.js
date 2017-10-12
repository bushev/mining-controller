'use strict';

const Core = process.mainModule.require('nodejs-lib');

class BaseApiController extends Core.Controller {

    constructor(request, response, next) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response, next);

    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = BaseApiController;
