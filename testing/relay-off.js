/**
 *
 * Created by Yuriy Bushev <bushevuv@gmail.com> on 14/03/2017.
 */

'use strict';

const gpio = require('pi-gpio');

const PIN = 37;

gpio.open(PIN, 'output', err => {
    if (err) {

        if (err.message.indexOf('Device or resource busy')) {

            console.log('Busy');

        } else {

            return console.log(err.message);
        }
    }

    gpio.write(PIN, 1, err => {
        if (err) return console.log(err.message);

        gpio.close(PIN);

        console.log('Done');
    });
});