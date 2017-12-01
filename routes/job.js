/**
 * Created by zhangwei on 10/28/17.
 */
var _ = require('lodash');
var async = require('async');
var greenhouseHelper = require('../utils/lib/greenhouseHelper');
var recruiterHelper = require('../utils/lib/recruiterHelper');
var Linkedinet = require('../utils/lib/Linkedinet');
var Company = require('../models/Company');
var H1B = require('../models/H1B');
var Job = require('../models/Job');
var Recruiter = require('../models/Recruiter');
var mongoose = require('mongoose');
var sleep = require('sleep-promise');
var Glassdoor = require('node-glassdoor').initGlassdoor({
    partnerId: 47725,
    partnerKey: "fRoNqdi8N21"
});
var h1b = require('node-h1bvisa');

var jobController = {

    search : function(req, res) {
        var position = req.body.position;
        var location = req.body.location;

        var linkedBot = new Linkedinet();

        var greenhouseBot = new greenhouseHelper({
            KEY: 'AIzaSyCtRQPmF4t2eLV2SR0XnYnh1DpGozRXriY',
            CX: '009481945842669497470:thvngsx0rk8',
            NUM: 5
        });

        var recruiterBot = new recruiterHelper({
            KEY: 'AIzaSyCtRQPmF4t2eLV2SR0XnYnh1DpGozRXriY',
            CX: '009481945842669497470:ezbqhdqvgqi',
            NUM: 10,
            PAGE: 3
        });

        /*
        var linkedinJobBot = new greenhouseHelper({
            KEY: 'AIzaSyCtRQPmF4t2eLV2SR0XnYnh1DpGozRXriY',
            CX: '009481945842669497470:0gmv20zdmwq',
            NUM: 5
        });
        */

        var recruiterEmailFetcher = function(companyId, recruiter, done) {
            "use strict";
            console.log(companyId);
            sleep(1000).then(function() {
                var query = {"name": recruiter.name, "title": recruiter.role};
                Recruiter.findOne(query, function (err, record) {
                    if (err) {
                        done(null);
                    } else if (record === null) {
                        var linkedinProfile = recruiter.link.split('/in/')[1];
                        if (linkedinProfile.includes('/')) linkedinProfile = linkedinProfile.split('/')[0];
                        linkedBot.fetchProfileContact(linkedinProfile)
                            .then(function (result) {
                                //save recruiter
                                var newRecruiter = new Recruiter({
                                    name: recruiter.name,
                                    title: recruiter.role,
                                    email: result.data.emailAddress !== undefined ? result.data.emailAddress : "unknown",
                                    linkedinUrl: recruiter.link,
                                    avatar: recruiter.avatar,
                                    location: recruiter.location
                                });

                                newRecruiter.save(function (err, newRecord) {
                                    if (err) {
                                        done(err);
                                    } else {
                                        var query = {"_id": new mongoose.Types.ObjectId(companyId)};
                                        var update = {
                                            $push: {recruiters: new mongoose.Types.ObjectId(newRecord._id)}
                                        };
                                        var option = {new: true};
                                        Company.findOneAndUpdate(query, update, option, function (err, updatedCompany) {
                                            if (err) {
                                                done(err);
                                            }
                                            else {
                                                done(null);
                                            }
                                        });
                                    }
                                })
                            });
                    } else {
                        done(null, record);
                    }
                });

                });
            };

        var saveFetchWorker = function (job, done) {
            //1. save company
            //2. save job
            //3. fetch recruiters
            var jobObject = job;

            function saveCompany(jobCompany, callback) {
                "use strict";
                var newCompany = new Company({
                    name: jobCompany
                });

                Company.findOne({name: jobCompany}, function (err, existingRecord) {
                    if(err) {
                        callback(err);
                    } else if (existingRecord === null) {
                        newCompany.save(function (err, newRecord) {
                            if (err) {
                                callback(err);
                            } else {
                                jobObject.company = new mongoose.Types.ObjectId(newRecord._id);
                                fetchRecruiter(newRecord, function(err, result){
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null);
                                    }
                                });
                            }
                        })
                    } else {
                        jobObject.company = new mongoose.Types.ObjectId(existingRecord._id);
                        callback(null);
                    }
                });
            };

            function saveJob(jobObj, callback) {
                "use strict";
                //needs to add job description, tag in the future
                greenhouseBot.getJobDescriptionAndLocation(jobObj.link)
                    .then(function(metadata){
                        if(metadata.description !== undefined && metadata.description !== null && metadata.description !== "unknown") {
                            jobObject.description = metadata.description;
                            if (metadata.location !== undefined && metadata.location !== null && metadata.location !== "") jobObject.location = metadata.location;
                            Job.findOneOrCreate({link: jobObj.link}, jobObject, function(err, record) {
                                if(err) {
                                    callback(err);
                                } else {
                                    callback(null, record);
                                }
                            });
                        } else {
                            callback(null);
                        }
                    });
            };

            function fetchRecruiter(companyObj, callback) {
                "use strict";
                recruiterBot.searchTechnicalRecruiter(companyObj.name)
                    .then(function (linkedinProfiles) {
                        async.mapLimit(linkedinProfiles, 1, recruiterEmailFetcher.bind(null, companyObj._id), function(err, results){
                            if(err) {
                                callback(err);
                            } else {
                                callback(null, results);
                            }
                        })
                    })
                    .catch(function (err) {
                        callback(err);
                    })
            };

            async.series([
                function(next) {
                    "use strict";
                    saveCompany(job.company, next);
                },
                function(next) {
                    "use strict";
                    saveJob(job, next);
                }
            ],function(err, results){
                "use strict";
                if (err) {
                    done(err);
                } else {
                    console.log('finish: '+ job.position);
                    done(null);
                }
            });
        };

        greenhouseBot.searchJobs(position, location)
            .then(function (jobs) {
                console.log(jobs);
                async.eachLimit(jobs, 1, saveFetchWorker, function(err){
                    "use strict";
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('done');
                        res.redirect('/dashboard');
                    }
                })
            });
    },

    getDetail: function (req, res) {
        var jobId = req.query.id;
        Job.findOne({'_id': jobId})
            .populate('company')
            .populate({
                path: 'company',
                populate: {
                    path: 'recruiters',
                    model: 'Recruiter'
                }
            })
            .exec(function(err, jobDetail){
                Glassdoor.findOneCompany(jobDetail.company.name,
                    {
                        country:"US"
                    })
                    .then(function (data) {
                        jobDetail.company.glassdoor = data;
                        res.render('jobDetail', {
                            title: jobDetail.position,
                            job: jobDetail
                        });
                    })
            });
    }

};

module.exports = jobController;