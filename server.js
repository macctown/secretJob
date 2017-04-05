var server = require('./config/initializers/app');
var async = require('async');
var logger = require('./utils/log/logger');


logger.info('[Server] Starting ' + process.env.SERVICE_NAME + ' initialization');

// Initialize Modules
async.series([
        function startServer(callback) {
            server(callback);
            //can do db setting, or update here
        }], function(err) {
        if (err) {
            logger.error(process.env.SERVICE_NAME + ' initialization FAILED', err);
        } else {
            logger.info(process.env.SERVICE_NAME + ' initialized SUCCESSFULLY');
        }
    }
);