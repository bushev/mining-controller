'use strict';

const Core           = require('nodejs-lib');
const BaseController = require('../base.js');
const userModel      = require('../../models/user');

/**
 * Signup controller
 */
class SignUpController extends BaseController {

    /**
     * Load controller
     *
     * @param callback
     */
    load(callback) {
        super.load(err => {
            if (err) return callback(err);

            if (this.isPostRequest) {

                let userData = {
                    email: this.request.body.email,
                    firstName: this.request.body.firstName,
                    password: this.request.body.password,
                    passwordConfirmation: this.request.body.passwordConfirmation
                };

                userModel.signUp(userData, (err, user) => {

                    if (err) {
                        this.flash.addMessage(err.message, Core.FlashMessageType.ERROR);

                        this.terminate();
                        this.response.redirect('/signup');
                        return callback();
                    }

                    this.request.logIn(user, err => {
                        if (err) return callback(err);

                        this.flash.addMessage('Account created!', Core.FlashMessageType.SUCCESS);

                        this.terminate();
                        this.response.redirect('/');

                        callback();
                    });
                });

            } else {

                this.view(Core.View.htmlView('app/views/site/user-signup.swig'));

                callback();
            }
        });
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = function (request, response) {
    let controller = new SignUpController(request, response);
    controller.run();
};
