'use strict';

const Core                = process.mainModule.require('nodejs-lib');
const AdminCRUDController = require('./base_crud');

class AdminUsersController extends AdminCRUDController {

    constructor(request, response) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response);

        /**
         * Current CRUD model instance
         *
         * @type {Object}
         * @private
         */
        this._model = require('../../models/user.js');

        /**
         * Context of the controller
         *
         * @type {string}
         * @private
         */
        this._baseUrl = '/admin/app-users';

        /**
         * Path to controller views
         *
         * @type {string}
         * @private
         */
        this._viewsPath = 'app-user';

        /**
         * Mongoose default fields. Used in getItemFromRequest().
         *
         * @type {Array}
         * @private
         */
        this._modelEditableFields = ['email', 'phone'];

        /**
         *
         * @type {string[]}
         * @private
         */
        this._modelSearchableFields = ['email', 'phone'];
    }

    /**
     * Extract item from request
     *
     * @param item
     * @returns {{}}
     */
    getItemFromRequest(item) {
        let result = super.getItemFromRequest(item);

        if (this.request.body.password) {

            if (this.request.body.password !== this.request.body.passwordConfirmation) {

                this.flash.addMessage('Password does not match the confirm password', Core.FlashMessageType.ERROR);

            } else {

                result.password = this.request.body.password;
            }
        }

        return result;
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = (request, response, next) => {
    let controller = new AdminUsersController(request, response, next);
    controller.run();
};
