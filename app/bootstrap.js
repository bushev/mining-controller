'use strict';

/**
 * Requiring Core Library
 *
 * WARNING: Core modules MUST be included from TOP Level Module.
 * All dependencies for core module must be excluded from the package.json
 */
const Core        = process.mainModule.require('nodejs-lib');
const path        = require('path');
const winston     = require('winston');
const fs          = require('fs');
const express     = require('express');
const viewFilters = require('./libs/view-filters');
const moment      = require('moment');
const morgan      = require('morgan');

require('winston-telegram').Telegram;

class Loader extends Core.AppBootstrap {

    constructor() {
        // We must call super() in child class to have access to 'this' in a constructor
        super();

        /**
         * Module name/version
         *
         * @type {null}
         * @private
         */
        this._moduleName = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).name;

        this._moduleVersion = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version;

        Core.ApplicationFacade.instance.config._configuration.appVersion = this._moduleVersion;
    }

    /**
     * Pre-Initializing module configuration
     */
    preInit() {
        let basePath = path.dirname(__dirname);

        //if (Core.ApplicationFacade.instance.config.isDev) {
        // I can help you with debug async stack, but I can also be a root cause of insufficient RAM ;-)
        // require('longjohn');
        //}

        if (Core.ApplicationFacade.instance.config.isDev) {

            this.applicationFacade.server.application.use(morgan('tiny', {
                stream: {
                    write: message => {
                        this.applicationFacade.logger.info(message);
                    }
                }
            }));
        }

        this.applicationFacade.logger.logger.add(winston.transports.Telegram, {
            level: 'error',
            token: Core.ApplicationFacade.instance.config.env.TELEGRAM_LOGGER_BOT_TOKEN,
            chatId: Core.ApplicationFacade.instance.config.env.TELEGRAM_LOGGER_BOT_CHAT_ID
        });

        this.applicationFacade.server.application.disable('x-powered-by'); // Disable 'x-powered-by:Express'

        if (Core.ApplicationFacade.instance.config.isDev) {

            this.applicationFacade.server.application.use((req, res, next) => {

                // Website you wish to allow to connect
                res.setHeader('Access-Control-Allow-Origin', '*');

                // Request methods you wish to allow
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

                // Request headers you wish to allow
                res.setHeader('Access-Control-Allow-Headers', 'Authorization,X-Requested-With,content-type');

                // Set to true if you need the website to include cookies in the requests sent
                // to the API (e.g. in case you use sessions)
                res.setHeader('Access-Control-Allow-Credentials', true);

                if (req.method.toLowerCase() === 'options') {

                    res.end();

                } else {

                    next();
                }
            });
        }
    }

    /**
     * Initializing module configuration
     */
    init() {
        super.init();

        if (Core.ApplicationFacade.instance.config.env.CONSOLE_LOGGER_ENABLED == 'yes') {
            console.log('CONSOLE_LOGGER_ENABLED');
            this.applicationFacade.logger.logger.add(winston.transports.Console, {
                level: 'debug',
                timestamp: true,
                humanReadableUnhandledException: true
            });
        }

        let basePath = path.dirname(__dirname);

        this.applicationFacade.logger.logger.add(winston.transports.File, {
            level: 'debug',
            maxsize: 1024 * 1024 * 30, // 30 MB
            maxFiles: 20,
            json: false,
            timestamp: true,
            filename: basePath + '/logs/logfile.log'
        });

        // loading module routes
        this.applicationFacade.server.loadRoutes('/app/routes', basePath);

        // loading models
        this.applicationFacade.loadModels(basePath + '/app/models');
    }

    /**
     * Bootstrapping module
     *
     * MongoDB is available on this stage
     */
    bootstrap() {
        super.bootstrap();

        /**
         * Requiring NodeJS Admin
         * @type {Loader|exports|module.exports}
         */
        let NodeJSAdmin = require('nodejs-admin');

        this.applicationFacade.logger.debug('#### Initializing ACL for application');
        this.applicationFacade.server.initAcl(NodeJSAdmin.Admin.Models.ACLPermissions);
        let configurationModel = NodeJSAdmin.Admin.Models.Configuration;

        configurationModel.readConf(function (config) {
            Core.ApplicationFacade.instance.config.mergeConfig(config);
        });

        if (process.env.IS_MASTER === 'yes') {

            this.applicationFacade.registry.load('Admin.Models.Navigation').addItem({
                name: 'Rigs',
                url: '/admin/rigs',
                icon: 'fa-microchip',
                order: 10
            });

            this.applicationFacade.registry.load('Admin.Models.Navigation').addItem({
                name: 'Users',
                url: '/admin/app-users',
                icon: 'fa-users',
                order: 20
            });
        }

        for (let filter in viewFilters) {

            if (viewFilters.hasOwnProperty(filter)) {

                Core.View.setFilter(filter, viewFilters[filter]);
            }
        }

        // Set 404 common route
        this.applicationFacade.server.application.use((req, res, next) => {

            req.route = {
                path: 'dummy-404-route'
            };

            require('./controllers/site/common-404-not-found')(req, res);
        });
    }

    /**
     * Run module based on configuration settings
     */
    run() {
        super.run();

        let userModel = require('./models/user.js');

        // init application Passport
        this.applicationFacade.server.initPassport(userModel);

        this.navigation = this.applicationFacade.registry.load('Admin.Models.Navigation');

        if (process.env.IS_MASTER === 'yes') { // For master node only

            if (!Core.ApplicationFacade.instance.config.isDev) {

            }
        }

        // TODO
        // require('./libs/sensors/smog');

        this.applicationFacade.logger.info('Node started');
    }
}

/**
 * Exporting module classes and methods
 */
module.exports = Loader;
