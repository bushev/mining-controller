'use strict';

module.exports = () => {

    return {
        'get|/': 'site/index.js',

        // 'get,post|/signup': 'site/signup.js',
        'get,post|/signin': 'site/signin.js',

        'get|/logout': 'site/logout.js'
    };
};