'use strict';

/**
 * Base Error
 *
 * @type {BaseError}
 */
const BaseError = require('./base');

class BadRequestError extends BaseError {

    constructor(message) {

        super(message || '400 - Bad request');

        //noinspection JSUnresolvedVariable
        this.name = 'BadRequestError';
        this.code = 400;

        this.viewPath = 'app/views/site/errors/400-bad-request.swig';
    }
}

/**
 * Export error class
 *
 * @type {BadRequestError}
 */
module.exports = BadRequestError;