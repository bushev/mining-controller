'use strict';

module.exports = () => {

    return {
        'get|/admin': 'admin/index.js',
        'get|/admin/stream/:action': 'admin/index.js',

        'get|/admin/rigs': 'admin/rig.js',
        'get|/admin/rigs/page/:page': 'admin/rig.js',
        'get|/admin/rigs/:action': 'admin/rig.js',
        'get,post|/admin/rigs/:action': 'admin/rig.js',
        'get,post|/admin/rigs/:id/:action': 'admin/rig.js',

        'get|/admin/app-users': 'admin/app-user.js',
        'get|/admin/app-users/page/:page': 'admin/app-user.js',
        'get|/admin/app-users/:action': 'admin/app-user.js',
        'get,post|/admin/app-users/:action': 'admin/app-user.js',
        'get,post|/admin/app-users/:id/:action': 'admin/app-user.js'
    };
};