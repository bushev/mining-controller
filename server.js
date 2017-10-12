'use strict';

const moment = require('moment');
const path   = require('path');
const fs     = require('fs');
const Core   = require('nodejs-lib');

// importing Application Facade and run the Application and Queue client.
let appFacade = Core.ApplicationFacade.instance;

appFacade.load('server', Core.HTTPServer);
appFacade.load('queue', Core.QueueClient);

// loading applications
appFacade.loadApplications('apps.json');

// initializing all modules
appFacade.init();

// run
appFacade.run();

// handle critical exceptions
process.on('uncaughtException', err => {

    console.log(err);

    fs.appendFileSync(path.resolve(__dirname, 'logs/error.log'),
                      moment().format('YYYY-MM-DD_HH-mm-ss') + ': ' + ((err && err.stack) ? err.stack : err) + '\r\n\r\n');
    throw err;
});