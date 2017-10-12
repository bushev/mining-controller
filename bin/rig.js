/**
 *
 * Created by Yuriy Bushev <bushevuv@gmail.com> on 17/03/2017.
 */

'use strict';

const spawn   = require('child_process').spawn;
// const winston = require('winston');
const request = require('request');

// let logger = new (winston.Logger)({
//     transports: [
//         new (winston.transports.Console)(),
//         // new (winston.transports.File)({filename: '/home/min/mining/rig.log'})
//     ]
// });

// 1. Run Claymore process

const claymore = spawn(`/home/min/mining/bin/claymore_8_0/ethdcrminer64`, [
    '-epool', 'eu1.ethermine.org:4444',
    '-ewal', '0x58ef706de61f78b33641cbdce14e61f5eec247f4.rig2', // TODO
    '-wd', '0',
    '-epsw', 'x',
    '-r', '-1', // disable automatic restarting
    // '-dbg', '1',
    // '-mport', '0',
    // '-logfile', '/home/min/mining/claymore.log'
], {
    env: {
        GPU_USE_SYNC_OBJECTS: 1,
        GPU_MAX_ALLOC_PERCENT: 100
    }
});

claymore.stdout.on('data', data => {

    console.log(`stdout:`);
    console.log(data);

    if (data.indexOf('hangs in OpenCL call') > -1) {

        console.log('GPU hangs in OpenCL call, exiting..');
        process.exit(1);
    }

    if (data.indexOf('Total Speed') > -1) {

        let status = {
            totalSpeed: data.match(/(\d+\.\d+) Mh\/s/)[1]
        };

        request.put({
            url: 'http://192.168.1.139:8080/api/v1/rigs/rig-2/status',
            form: status
        }, (err, res, body) => {
            if (err) return console.log(err);
            if (res.statusCode !== 201) console.log(`POST: rig-status is ${res.statusCode}`);

            console.log(status);
        });
    }
});

claymore.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
});

claymore.on('close', code => {
    console.log(`claymore process exited with code ${code}`);
});

claymore.stdin.setEncoding('utf-8');

setInterval(() => { // request status report
    console.log(`request status report..`);
    claymore.stdin.write('s');
}, 5000);

// sudo /usr/bin/node /home/min/mining/bin/rig.js