'use strict';

const Core  = process.mainModule.require('nodejs-lib');
const async = require('async');
const path  = require('path');

/**
 * Base application model
 */
class BaseModel extends Core.MongooseModel {

    constructor(listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);

        /**
         * pkgClient
         *
         * @type {null}
         * @private
         */
        this._pkgClient = null;

        try {
            let currentModel = this.model;
        } catch (err) {

            if ('OverwriteModelError' === err.name) {
                return this._logger.log('Model %s is already defined', this._list);
            }

            if ('MissingSchemaError' !== err.name) {
                throw err;
            }

            // Defining current schema
            this.defineSchema();
        }

        /**
         * Model items for API reply
         *
         * @type {Array}
         * @private
         */
        this._responseFields = [];
    }

    /**
     * Get model items for API reply
     */
    get responseFields() {

        return this._responseFields;
    }

    /**
     * pkgClient getter
     *
     * @returns {null|*}
     */
    get pkgClient() {
        if (!this._pkgClient) {
            this._pkgClient = new Core.PkgClient();
        }

        return this._pkgClient;
    }

    /**
     * Register mongoose hooks
     *
     * @override
     */
    registerHooks() {

        let $this = this;

        if (typeof this.schema.paths.idNumber !== 'undefined') {

            // Add pre save hook for numeric id's
            this.schema.pre('save', function (next) {

                if (!this.isNew || this.idNumber) return next(); // Only for new items without idNumber

                $this.getNextId((err, nextId) => {
                    if (err) {
                        $this.logger.error(err);
                        return next(err);
                    }

                    this.idNumber = nextId;
                    next();
                });
            });
        }

        /**
         * Save old item to trace
         */
        this.schema.pre('save', function (next) {

            if (this.isNew) {
                return next();
            }

            $this.model.findById(this._id, (err, item) => {
                if (err) return next(err);
                if (!item) return next(new Error('Item was not found by ' + this._id));

                this.oldItem = item.toObject();

                next();
            });
        });
    }

    /**
     * Obtain next idNumber for collection item
     *
     * @param callback
     */
    getNextId(callback) {

        /**
         * Counter model
         */
        let CounterModel = require('nodejs-admin').Admin.Models.Counters;

        CounterModel.getNextSequence(this.listName, (err, nextId) => {
            if (err) {
                this.logger.error(err);
                return callback(err);
            }

            callback(null, nextId);
        });
    }

    /**
     * Define Schema. Must be overwritten in descendants.
     *
     * @abstract
     */
    defineSchema() {

    }

    /**
     * Enabling audit logs
     */
    enableAudit() {

        let $this = this;

        setTimeout(() => {
            /**
             * Instance of Audit log model
             */
            this.logAudit = require('nodejs-admin').Admin.Models.LogAudit;

            /**
             * Save old item to trace
             */
            this._schema.pre('save', function (next) {

                if (this.isNew) {
                    return next();
                }

                $this.model.findById(this._id, (err, item) => {
                    if (err) return next(err);

                    this.oldItem = item.toObject();

                    next();
                });
            });

            /**
             * Add trace on `create` and `modify`.
             */
            this._schema.post('save', function (item) {
                if (this.oldItem) {
                    $this.logAudit.traceModelChange({
                        modified: true,
                        resource: $this._list,
                        resourceModel: $this,
                        item: item.toObject(),
                        oldItem: this.oldItem,
                        userId: item.lastModifiedBy
                    });
                } else {
                    $this.logAudit.traceModelChange({
                        created: true,
                        resource: $this._list,
                        resourceModel: $this,
                        item: item.toObject(),
                        userId: item.lastModifiedBy
                    });
                }
            });

            /**
             * Add trace on `remove`.
             */
            this._schema.post('remove', function (item) {
                $this.logAudit.traceModelChange({
                    removed: true,
                    resource: $this._list,
                    resourceModel: $this,
                    item: item.toObject(),
                    userId: item.lastModifiedBy // TODO
                });
            });
        }, 1000);
    }

    /**
     * Enabling webhooks
     */
    enableWebHooks() {

        let $this = this;

        /**
         * Add webhook `create` and `update`.
         */
        this._schema.post('save', function (item) {
            if (this.wasNew) {
                // Create
                let responseItem = {};

                $this.responseFields.forEach((function (responseFiled) {
                    responseItem[responseFiled] = item[responseFiled];
                }));

                let jobObject = {
                    workerName: $this._list,
                    commandName: 'create',
                    params: {
                        item: responseItem
                    },
                    delay: new Date(),
                    priority: 1
                };

                Core.ApplicationFacade.instance.queue.enqueue(jobObject);

            } else {
                // Update

                let responseItem = {};

                $this.responseFields.forEach((function (responseFiled) {
                    responseItem[responseFiled] = item[responseFiled];
                }));

                let jobObject = {
                    workerName: $this._list,
                    commandName: 'update',
                    params: {
                        item: responseItem
                    },
                    delay: new Date(),
                    priority: 1
                };

                Core.ApplicationFacade.instance.queue.enqueue(jobObject);
            }
        });

        /**
         * Add webhook on `remove`.
         */
        this._schema.post('remove', function (item) {
            // Delete
            let jobObject = {
                workerName: $this._list,
                commandName: 'delete',
                params: {
                    _id: item._id
                },
                delay: new Date(),
                priority: 1
            };

            Core.ApplicationFacade.instance.queue.enqueue(jobObject);
        });
    }

    /**
     * Returns filtered list of items prepared for API response
     *
     * @param {Object} filters - Filters set
     *
     * @param {Object} [filters.search] - Search filter
     * @param {String} filters.search.searchValue - Search filter value to search
     * @param {Array} filters.search.searchFields - Search fields
     *
     * @param {Array} [filters.relation] - Relations filter
     * @param {String} filters.relation.fieldName - Relations filter item name
     * @param {String|Array} filters.relation.fieldValue - Relations filter item value
     *
     * @param {Array} [filters.inField] - In Field filter
     * @param {String} filters.inField.fieldName - In Field filter item name
     * @param {String|Array} filters.inField.fieldValue - In Field filter item value
     *
     * @param {Object} populations
     * @param {Object} pagination
     * @param {Object} sorting
     * @param {Function} callback
     */
    getListFilteredForApi(filters, populations, pagination, sorting, callback) {
        super.getListFiltered(filters, populations, pagination, sorting, (err, data) => {
            if (err) return callback(err);

            let responseObject = {
                totalItems: data.pagination.totalItems,
                totalPages: data.pagination.totalPages,
                itemsPerPage: data.pagination.pageSize,
                currentPage: data.pagination.currentPage,
                nextPage: 0,
                prevPage: false,
                items: []
            };

            if (data.pagination.currentPage === 1) {
                responseObject.prevPage = false;
            } else {
                responseObject.prevPage = data.pagination.currentPage - 1;
            }

            if (data.pagination.currentPage < data.pagination.totalPages) {
                responseObject.nextPage = data.pagination.currentPage + 1;
            } else {
                responseObject.nextPage = false;
            }

            async.eachLimit(data.items, 10, (item, callback) => {
                this.refineForApi(item, (err, item) => {
                    if (err) {
                        return callback(err);
                    }
                    responseObject.items.push(item);
                    callback();
                });
            }, err => {
                callback(err, responseObject);
            });
        });
    }

    /**
     * Refile Model items for API reply
     * @param item
     * @param callback
     * @abstract
     */
    refineForApi(item, callback) {

        let responseItem = {};

        this.responseFields.forEach(responseFiled => {
            responseItem[responseFiled] = item[responseFiled];
        });

        callback(null, responseItem);
    }

    /**
     * Add default values to collection
     */
    initCollection() {

        this.model.find({}, (err, rows) => {
            if (err) return this.logger.error(err);
            if (rows.length > 0) return; // Data already exist

            async.eachSeries(require(path.join(__dirname, '..', 'data', this.listName)), (row, callback) => {

                let instance = new this.model(row);

                instance.save(callback);

            }, err => {
                if (err) this.logger.error(err);
            });
        });
    }
}

/**
 * Exporting Model
 *
 * @type {Function}
 */
module.exports = BaseModel;
