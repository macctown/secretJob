/**
 * Created by zhangwei on 4/4/17.
 */
var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var passport = require('passport');
var User = require('../models/User');
var Resume = require('../models/Resume');


var resumeController = {

    viewResume : function(req, res) {
        if (!req.user.isResumeStart) {
            return res.redirect('/resume/create');
        }
        //get resume and render page
    },

    createResume : function(req, res) {
        res.redirect('/resume/personalInfo');
    },

    redirectTo : function(req, res) {
        var step = req.params.stepId;
        switch (step){
            case "1":
                res.redirect('/resume/personalInfo');
                break;
            case "2":
                res.redirect('/resume/headline');
                break;
            case "3":
                res.redirect('/resume/roleSkill');
                break;
            case "4":
                res.redirect('/resume/reference');
                break;
            case "5":
                res.redirect('/resume/workEducation');
                break;
            case "6":
                res.redirect('/resume/portofolio');
                break;
            default:
                res.redirect('/resume/create');
                break;
        }
    },

    pInfoPage: function(req, res){
        "use strict";
        res.render('personalInfo', {
            title:"Personal Info",
            step: 1
        })
    },

    headlinePage: function(req, res){
        "use strict";
        res.render('headline', {
            title:"Headline",
            step: 2
        })
    },

    roleSkillPage: function(req, res){
        "use strict";
        res.render('roleSkill', {
            title:"Role and Skill",
            step: 3
        })
    },

    refPage: function(req, res){
        "use strict";
        res.render('reference', {
            title:"Reference and Identity",
            step: 4
        })
    },

    workEduPage: function(req, res){
        "use strict";
        res.render('workEducation', {
            title:"Work and Education",
            step: 5
        })
    },

    portoPage: function(req, res){
        "use strict";
        res.render('portofolio', {
            title:"Portofolio",
            step: 6
        })
    },

    editResume : function(req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        res.redirect('/#userloginModal');
    },

    /**
     * POST /login
     * Sign in using email and password.
     */
    postLogin : function(req, res, next) {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('password', 'Password cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({ remove_dots: false });

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/#userloginModal');
        }

        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                console.log(info);
                req.flash('errors', info);
                return res.redirect('/#userloginModal');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', { msg: 'Success! You are logged in.' });
                res.redirect('/dashboard');
            });
        })(req, res, next);
    }

};

module.exports = resumeController;
