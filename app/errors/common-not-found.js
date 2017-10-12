'use strict';

const BaseError = require('./base');

class CommonNotFoundError extends BaseError {

    constructor(message) {

        super(message || '404 - Page not found');

        //noinspection JSUnresolvedVariable
        this.name = 'CommonNotFoundError';
        this.code = 404;

        this.viewPath = 'app/views/site/errors/404-common.swig';
    }
}

/**
 * Export error class
 *
 * @type {CommonNotFoundError}
 */
module.exports = CommonNotFoundError;