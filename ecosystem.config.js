module.exports = {
    apps: [{
        name: 'WEB Server',
        script: 'server.js',
        env: {
            IS_MASTER: 'yes'
        },
        env_production: {
            ENV_TYPE: 'production',
            APPLICATION_ENV: 'production',
            NODE_ENV: 'production',
            SERVER_PORT: 8080
        }
    }
    /*, {
        name: 'Queue',
        script: 'queue-server.js',
        instances: 1,
        exec_mode: 'fork',
        node_args: '--max-old-space-size=128',
        env_production: {
            ENV_TYPE: 'production',
            APPLICATION_ENV: 'production',
            NODE_ENV: 'production'
        }
    }*/]
};