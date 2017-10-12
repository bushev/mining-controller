'use strict';

const Core           = require('nodejs-lib');
const BaseController = require('../base.js');
const userModel      = require('../../models/user');

/**
 * Signin controller
 */
class SignInController extends BaseController {

    /**
     * Load view file
     *
     * @param dataReadyCallback
     */
    load(dataReadyCallback) {

        if (this.request.method === 'POST') {

            userModel.passport.authenticate('local', (err, user, info) => {
                if (err) return dataReadyCallback(err);

                if (!user) {
                    this.flash.addMessage(info.message, Core.FlashMessageType.ERROR);
                    this.terminate();
                    this.response.redirect('/signin');
                    return dataReadyCallback();
                }

                this.request.logIn(user, (err) => {
                    if (err) return dataReadyCallback(err);

                    this.terminate();
                    this.response.redirect('/');

                    dataReadyCallback();
                });
            })(this.request);

        } else {
            /**
             * Set output view object
             */
            this.view(Core.View.htmlView('app/views/site/signin.swig'));

            dataReadyCallback();
        }
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = function (request, response) {
    let controller = new SignInController(request, response);
    controller.run();
};
