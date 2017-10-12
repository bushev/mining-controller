'use strict';

const Core               = process.mainModule.require('nodejs-lib');
const BaseSiteController = require('./base.js');

/**
 * Index Controller controller
 */
class IndexController extends BaseSiteController {

    /**
     * Load view file
     *
     * @param callback
     */
    load(callback) {
        super.load(err => {
            if (err) return callback(err);

            this.view(Core.View.htmlView('app/views/site/index.swig'));

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
    let controller = new IndexController(request, response, next);
    controller.run();
};
