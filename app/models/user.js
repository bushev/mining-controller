'use strict';

const Core          = process.mainModule.require('nodejs-lib');
const BaseModel     = require('./basemodel.js');
const LocalStrategy = require('passport-local').Strategy;
const randomString  = require('random-string');
const bcrypt        = require('bcryptjs');
const async         = require('async');
const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const moment        = require('moment');
const validator     = require('validator');

const USER_PASSWORD_MIN_LENGTH = 6;

class UserModel extends BaseModel {

    constructor(listName) {
        // We must call super() in child class to have access to 'this' in a constructor
        super(listName);

        /**
         * Filter
         *
         * @type {[*]}
         */
        this.inFieldFilterFields = [{
            name: 'inFieldStatus',
            field: 'status'
        }];

        /**
         * To Enable Audit traces.
         * 1. Call enableAudit()
         * 2. Do not forget to add `lastModifiedBy` field to this schema.
         */
        this.enableAudit();
    }

    /**
     * Define Schema
     *
     * @override
     */
    defineSchema() {

        let $this = this;
        let Types = this.mongoose.Schema.Types;

        let schemaObject = {

            idNumber: {type: Number, index: true, unique: true},

            firstName: {type: String, required: true, trim: true},

            email: {type: Types.Email, index: true, unique: true, lowercase: true, trim: true},

            phone: {type: String, index: true, unique: true, trim: true, sparse: true},

            emailVerificationCode: {type: String, index: true, unique: true, sparse: true},

            emailChangeRequest: {
                toEmail: String,
                confirmationCode1: String,
                confirmationCode2: String,
                requestedAt: Date
            },

            password: {type: String},

            accessRecover: {
                code: {type: String},
                createdAt: {type: Date}
            },

            status: {
                type: String,
                index: true,
                required: true,
                'enum': ['active', 'suspended'],
                'default': 'active'
            },

            pushDevices: [{
                platform: {type: String, enum: ['ios', 'android'], index: true, required: true},
                deviceToken: {type: String, index: true, required: true}
            }],

            isAdmin: {type: Boolean, default: false},

            updatedAt: {type: Date, 'default': Date.now},
            createdAt: {type: Date, 'default': Date.now},
            lastModifiedBy: {type: Types.ObjectId, ref: 'user'}
        };

        // Creating DBO Schema
        let UserDBOSchema = this.createSchema(schemaObject);

        UserDBOSchema.virtual('fullName').get(function () {
            let names = [];

            if (this.firstName) names.push(this.firstName);

            return names.join(' ');
        });

        UserDBOSchema.pre('save', function (next) {

            if (this.isNew) {
                this.emailVerificationCode = randomString({
                    length: 20,
                    numeric: true,
                    letters: true,
                    special: false
                });
            }

            next();
        });

        UserDBOSchema.pre('save', function (next) {
            let user = this;

            // only hash the password if it has been modified (or is new)
            if (!user.isModified('password')) return next();

            // generate a salt
            bcrypt.genSalt((err, salt) => {
                if (err) return next(new Error('UserModel.pre.save.1: ' + err));

                // hash the password using our new salt
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return next(new Error('UserModel.pre.save.2: ' + err));

                    // override the cleartext password with the hashed one
                    user.password = hash;
                    next();
                });
            });
        });

        UserDBOSchema.methods.comparePassword = function (candidatePassword, callback) {
            bcrypt.compare(candidatePassword, this.password, callback);
        };

        // Registering schema and initializing model
        this.registerSchema(UserDBOSchema);
    }

    /**
     * Validating item before save
     *
     * @param item
     * @param validationCallback
     *
     * @override
     * @returns {array}
     */
    validate(item, validationCallback) {

        let validationMessages = [];

        //if (!item.firstName) {
        //    validationMessages.push('User First Name must be specified');
        //}

        validationCallback(Core.ValidationError.create(validationMessages));
    }

    /**
     * Passport instance
     *
     * @returns {*|UserModel.passport}
     */
    get passport() {

        return this._passport;
    }

    /**
     * Registering passport handlers
     *
     * @param passport
     */
    registerPassportHandlers(passport) {
        let userModel = this;

        this._passport = passport;

        this.logger.info('## Registering LocalStrategy for Authentication.');

        passport.serializeUser(function (user, callback) {
            callback(null, user.id);
        });

        passport.deserializeUser((id, callback) => {

            this.model
                .findOne({_id: id})
                //.populate('')
                .exec((err, user) => {
                    if (err) {
                        this.logger.error(err);
                        return callback(err);
                    }

                    callback(null, user);
                });
        });

        /**
         * Sign in using Email and Password.
         */
        passport.use(new LocalStrategy({usernameField: 'username'}, function (username, password, done) {

            let persistUsername = username;

            username = username.toLowerCase();

            userModel.logger.debug('Trying to Authenticate user %s.', username);

            userModel.findOne({email: username}, (err, user) => {

                if (err) {
                    userModel.logger.error(err);
                    return done(null, false, {message: 'Internal server error'});
                }

                if (!user) {
                    userModel.logger.debug('E-mail "' + persistUsername + '" not found.');
                    return done(null, false, {message: 'E-mail address "' + persistUsername + '" is not registered'});
                }

                user.comparePassword(password, function (err, isMatch) {
                    if (err) return done(err);
                    if (isMatch) {
                        return done(null, user);
                    }
                    userModel.logger.debug('Wrong password for: "' + username);
                    done(null, false, {message: 'Password is wrong'});
                });
            });
        }));
    }

    /**
     * New user SignUp
     *
     * @param userData
     * @param userData.firstName {string}
     * @param userData.email
     * @param userData.phone
     * @param userData.password
     * @param userData.passwordConfirmation
     * @param callback
     * @returns {*}
     */
    signUp(userData, callback) {

        let error;

        if (!userData.firstName || userData.firstName.length < 1) {

            error = `Please, fill First Name`;
        }

        if (!userData.email || !validator.isEmail(userData.email)) {

            error = `Please, check E-mail address`;
        }

        if (!userData.password || userData.password.length < USER_PASSWORD_MIN_LENGTH) {

            error = `Password length must be ${USER_PASSWORD_MIN_LENGTH} charsets length at least`;
        }

        if (userData.password !== userData.passwordConfirmation) {

            error = `Password confirmation doesn't match Password`;
        }

        if (error) {

            return callback(new Error(error));
        }

        modelInstance.findOne({email: userData.email}, (err, existingUser) => {

            if (existingUser) {

                return callback(new Error('This E-mail address is already busy'));
            }

            modelInstance.insert(userData, (err, user) => {

                if (err) return callback(err);

                callback(null, user);
            });
        });
    }
}

const modelInstance = new UserModel('user');

/**
 * Exporting Model
 *
 * @type {Function}
 */
module.exports = modelInstance;
