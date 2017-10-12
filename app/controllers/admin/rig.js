'use strict';

const Core                = process.mainModule.require('nodejs-lib');
const AdminCRUDController = require('./base_crud');

/**
 * Admin Rig controller
 */
class AdminRigController extends AdminCRUDController {

    /**
     * Controller constructor
     */
    constructor(request, response) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(request, response);

        /**
         * Current CRUD model instance
         *
         * @type {Object}
         * @private
         */
        this._model = require('../../models/rig');

        /**
         * Context of the controller
         *
         * @type {string}
         * @private
         */
        this._baseUrl = '/admin/rigs';

        /**
         * Path to controller views
         *
         * @type {string}
         * @private
         */
        this._viewsPath = 'rig';

        /**
         * Mongoose default fields. Used in getItemFromRequest().
         *
         * @type {Array}
         * @private
         */
        this._modelEditableFields = ['name', 'ethAddress', 'ipAddress', 'powerPin', 'minRate', 'fansSpeed', 'status'];

        /**
         *
         * @type {string[]}
         * @private
         */
        this._modelSearchableFields = ['name', 'ipAddress', 'ethAddress'];

        // /**
        //  * Mongoose Population fields
        //  * url: {@link http://mongoosejs.com/docs/populate.html|Mongoose Doc}
        //  *
        //  * @type {string}
        //  * @private
        //  */
        // this._modelPopulateFields = 'lastTrack';
    }

    init(callback) {
        super.init(err => {
            if (err) return callback(err);

            this.registerAction('start', 'startRig');
            this.registerAction('reboot', 'rebootRig');
            this.registerAction('shutdown', 'shutdownRig');

            callback();
        });
    }

    /**
     * Returns view sorting options
     *
     * @returns {{}}
     */
    getViewSorting() {

        let sorting = super.getViewSorting();

        if (Object.keys(sorting).length === 0) {

            sorting = {field: 'name', order: 'asc'};
        }

        return sorting;
    }

    startRig(callback) {

        this.loadItem(err => {
            if (err) return callback(err);
            if (!this.item) return callback(new Error('Rig was not found'));

            this.item.start(err => {
                if (err) return callback(err);

                this.flash.addMessage(`Rig ${this.item.name} was started!`, Core.FlashMessageType.SUCCESS);
                this.terminate();
                this.response.redirect(this.getActionUrl('list'));

                callback();
            });
        });
    }

    rebootRig(callback) {

        this.loadItem(err => {
            if (err) return callback(err);
            if (!this.item) return callback(new Error('Rig was not found'));

            this.item.reboot(err => {
                if (err) return callback(err);

                this.flash.addMessage(`Rig ${this.item.name} was rebooted!`, Core.FlashMessageType.SUCCESS);
                this.terminate();
                this.response.redirect(this.getActionUrl('list'));

                callback();
            });
        });
    }

    shutdownRig(callback) {

        this.loadItem(err => {
            if (err) return callback(err);
            if (!this.item) return callback(new Error('Rig was not found'));

            this.item.shutdown(err => {
                if (err) return callback(err);

                this.flash.addMessage(`Rig ${this.item.name} was stopped!`, Core.FlashMessageType.SUCCESS);
                this.terminate();
                this.response.redirect(this.getActionUrl('list'));

                callback();
            });
        });
    }
}

/**
 * Exporting Controller
 *
 * @type {Function}
 */
module.exports = (request, response, next) => {
    let controller = new AdminRigController(request, response, next);
    controller.run();
};
