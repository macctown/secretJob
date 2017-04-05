/**
 * Module dependencies.
 */
var express = require('express');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var lusca = require('lusca');
var dotenv = require('dotenv');
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

var MongoStore = require('connect-mongo/es5')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var logger = require('../../utils/log/logger');
var exphbs = require('express-handlebars');
var passportConfig = require('../../auth/passport-setup');


/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
var start =  function(callback) {
    "use strict";
    app.listen(process.env.PORT || 3000);

    logger.info(process.env.SERVICE_NAME + ' HTTPS Server Listening on Port ' + (process.env.PORT || 3000));

    logger.info(process.env.SERVICE_NAME + ' Initializing view engine');

    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir:'views/layouts',
        partialsDir:'views/partials',
        helpers: {
            compare: function(lvalue, rvalue, options) {

                if (arguments.length < 3)
                    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

                var operator = options.hash.operator || "==";

                var operators = {
                    '==':       function(l,r) { return l == r; },
                    '===':      function(l,r) { return l === r; },
                    '!=':       function(l,r) { return l != r; },
                    '<':        function(l,r) { return l < r; },
                    '>':        function(l,r) { return l > r; },
                    '<=':       function(l,r) { return l <= r; },
                    '>=':       function(l,r) { return l >= r; },
                    'typeof':   function(l,r) { return typeof l == r; }
                }

                if (!operators[operator])
                    throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

                var result = operators[operator](lvalue,rvalue);

                if( result ) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            },

            calculate: function(lvalue, rvalue, operator) {

                if (arguments.length < 2)
                    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

                if(operator === "+"){
                    return lvalue + rvalue;
                }
                else if(operator === "-"){
                    return lvalue - rvalue;
                }

            }
        }
    }));
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'handlebars');
    app.use(compress());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressValidator());
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        store: new MongoStore({
            url: process.env.MONGODB || process.env.MONGOLAB_URI,
            autoReconnect: true
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use( lusca.csrf() );
    app.use(function(req, res, next) {
        if (req.path === '/api/upload') {
            next();
        } else {
            lusca.csrf()(req, res, next);
        }
    });
    app.use(lusca.xframe('SAMEORIGIN'));
    app.use(lusca.xssProtection(true));
    app.use(function(req, res, next) {
        res.locals.user = req.user;
        next();
    });

    app.use(express.static(path.join(__dirname, '../../public'), { maxAge: 31557600000 }));

    logger.info(process.env.SERVICE_NAME + ' Initializing routes');

    // Introduce routes
    require('../../routes/index')(app, passport, logger);

    // Error handler
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: (app.get('env') === 'development' ? err : {})
        });

        logger.error(process.env.SERVICE_NAME + ' 500 Error: Internal Server Error');
        next(err);
    });

    if (callback) {
        return callback();
    }
};


module.exports = start;