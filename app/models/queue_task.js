'use strict';

const BaseModel = require('./basemodel.js');

class QueueTaskModel extends BaseModel {

    constructor(listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);
    }

    /**
     * Define Schema
     *
     * @override
     */
    defineSchema() {

        let Types = this.mongoose.Schema.Types;

        let schemaObject = {
            name: {type: String, index: true},
            params: Types.Mixed,
            queue: {type: String, index: true},
            attempts: Types.Mixed,
            delay: Date,
            priority: {type: Number, index: true},
            status: {type: String, index: true},
            enqueued: Date,
            dequeued: Date,
            ended: Date,
            result: {}
        };

        // Creating DBO Schema
        let QueueTaskDBOSchema = this.createSchema(schemaObject);

        // Registering schema and initializing model
        this.registerSchema(QueueTaskDBOSchema);
    }
}

const modelInstance = new QueueTaskModel('queue_task');

/**
 * Exporting Model
 *
 * @type {Function}
 */
module.exports = modelInstance;