/**
 *
 * Created by Yuriy Bushev <bushevuv@gmail.com> on 18/12/2016.
 */

'use strict';

class BaseError extends Error {

    constructor(message) {

        super(message);

        this.shouldBeHandled = true;
    }
}

module.exports = BaseError;