'use strict';

module.exports = () => {

    return {
        'put|/api/v1/rigs/:rigName/:action': 'api/rig.js',
        'get|/api/v1/rigs/:action': 'api/rig.js'
    };
};