'use strict';

const BaseApplicationController = require('../base');
const async                     = require('async');

class BaseSiteController extends BaseApplicationController {

    constructor(request, response, next) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response, next);

    }

    /**
     * Apply pre render action
     *
     * @param callback
     */
    preRender(callback) {
        super.preRender(err => {
            if (err) return callback(err);

            async.series([callback => {

                this.setSeoData(callback);

            }], callback);
        });
    }

    /**
     * Set SEO data for view
     *
     * @param callback
     */
    setSeoData(callback) {

        this.data.seoData = {
            title: 'GPS Tracker',
            keywords: 'GPS Tracker',
            description: 'GPS Tracker'
        };

        this.data.seoData.url = this.request.protocol + '://' + this.request.get('host') + this.request.originalUrl;

        callback();
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = BaseSiteController;
