/**
 *
 * Created by Yuriy Bushev <bushevuv@gmail.com> on 14/03/2017.
 */

'use strict';

const gpio = require('pi-gpio');

const PIN = 40;

gpio.open(PIN, 'output', err => {
    if (err) return console.log(err);

    gpio.write(PIN, 0, err => {
        if (err) return console.log(err.message);

        setTimeout(() => {

            gpio.write(PIN, 1, err => {
                if (err) return console.log(err.message);

                gpio.close(PIN);

                console.log('Done');
            });

        }, 5000);
    });
});