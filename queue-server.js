'use strict';

const Core    = require('nodejs-lib');
const winston = require('winston');
const path    = require('path');
const moment  = require('moment');

// I can help you with debug async stack, but I can also be a root cause of insufficient RAM ;-)
//require('longjohn');

process.on('uncaughtException', err => {

    console.log(err);

    require('fs').appendFileSync(require('path').resolve(__dirname, 'logs/error.log'),
        moment().format('YYYY-MM-DD_HH-mm-ss') + ': ' + ((err && err.stack) ? err.stack : err) + '\r\n\r\n');
    throw err;
});

// importing Application Facade and run the Queue server.
const appFacade = Core.ApplicationFacade.instance;

if (appFacade.config.env.CONSOLE_LOGGER_ENABLED == 'yes') {
    appFacade.logger.logger.add(winston.transports.Console, {
        level: 'debug',
        timestamp: true,
        humanReadableUnhandledException: true
    });
}

appFacade.logger.logger.add(winston.transports.File, {
    level: 'debug',
    maxsize: 1024 * 1024 * 100, // 100 MB
    maxFiles: 20,
    json: false,
    timestamp: true,
    filename: path.join(__dirname, 'logs/logfile.log')
});

appFacade.load('queue', Core.QueueServer);

appFacade.on(Core.ApplicationEvent.MONGO_CONNECTED, event => {

    // loading models
    appFacade.loadModels(__dirname + '/app/models');

    appFacade.logger.info('Queue started');
});

// initializing all modules
appFacade.init();

// set events for worker jobs
appFacade.queue.setWorkersDir('./app/workers');

// run
appFacade.run();
