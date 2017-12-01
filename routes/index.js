/**
 * Controllers (route handlers).
 */
var homeController = require('./home');
var userController = require('./user');
var resumeController = require('./resume');
var jobController = require('./job');
var isAuthenticate = require('../auth/isAuthenticate');
var passport = require('passport');


module.exports = function(app, passport, logger) {
    "use strict";
    app.use(function (req, res, next) {
        if (/(dashboard)|(^\/$)/i.test(req.path)) {
            req.session.returnTo = req.path;
        }
        next();
    });


    /**
     * Primary app routes.
     */
    app.get('/', homeController.index);
    //app.get('/login', userController.getLogin);
    app.post('/login', userController.postLogin);
    app.get('/logout', userController.logout);
    app.get('/forgot', userController.getForgot);
    app.post('/forgot', userController.postForgot);
    app.get('/reset/:token', userController.getReset);
    app.post('/reset/:token', userController.postReset);
    //app.get('/signup', userController.getSignup);
    app.post('/signup', userController.postSignup);
    app.get('/dashboard', isAuthenticate, userController.getDashboard);
    app.get('/account', isAuthenticate, userController.getAccount);
    app.post('/account/profile', isAuthenticate, userController.postUpdateProfile);
    app.post('/account/password', isAuthenticate, userController.postUpdatePassword);
    app.post('/account/delete', isAuthenticate, userController.postDeleteAccount);
    app.get('/account/unlink/:provider', isAuthenticate, userController.getOauthUnlink);
    app.get('/resume/create', isAuthenticate, resumeController.createResume);
    app.get('/resume/proceedTo/:stepId', isAuthenticate, resumeController.redirectTo);

    app.get('/resume/personalInfo', isAuthenticate, resumeController.pInfoPage);
    app.get('/resume/headline', isAuthenticate, resumeController.headlinePage);
    app.get('/resume/roleSkill', isAuthenticate, resumeController.roleSkillPage);
    app.get('/resume/reference', isAuthenticate, resumeController.refPage);
    app.get('/resume/workEducation', isAuthenticate, resumeController.workEduPage);
    app.get('/resume/portofolio', isAuthenticate, resumeController.portoPage);

    app.post('/job/search', isAuthenticate, jobController.search);
    app.get('/job/detail', isAuthenticate, jobController.getDetail);

    //app.get('/api/upload', apiController.getFileUpload);
    //app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

    app.get('/auth/linkedin', passport.authenticate('linkedin', {state: 'SOME STATE'}));
    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {failureRedirect: '/home'}), function (req, res) {
        res.redirect('/dashboard');
    });

    // Set 404 response for non-exist api routes
    app.use(function(req, res, next) {
        var err = new Error('Routes Request URL Not Found');
        err.status = 404;
        logger.warn('[SERVER] 404 NOT FOUND: Received request ('+ req.pathname +') can not be found');
        next(err);
    });
};