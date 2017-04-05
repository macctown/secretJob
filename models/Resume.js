/**
 * Created by zhangwei on 4/3/17.
 */
var mongoose = require('mongoose');

var subRoleSchema = new mongoose.Schema({
    roleName: String,
    experience: Number
});

var resumeSchema = new mongoose.Schema({

    userId: String,
    resumeProgress: Number,
    isResumeFinish: { type: String, default: false },

    personalInfo:{
        firstName: String,
        lastName: String,
        homeLocation: String,
        timeZone: String,
        phone: Number
    },

    headline: String,
    role: {
        roleName: String,
        experience: Number,
        subRole: {type: [subRoleSchema]},
        mostSearch: String
    },

    skill:{
        topSkill: Array,
        additionalSkill: Array
    },

    reference:{
        location: Array,
        jobType: String,
        salary: Number,
        salaryLevel: String
    },

    identity:{
        visaType: String,
        h1bRequired: Boolean
    },

    work:{type:[{
        companyName: String,
        title: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        description: String
    }]},

    education:{type:[{
        university: String,
        degree: String,
        graduateYear: String
    }]},

    link:{
        linkedin: String,
        github: String,
        website: String,
        resume: String
    },

    portfolio:{type:[{
        projectName: String,
        techStack: Array,
        description: String,
        screenshot: String
    }]}

});

var Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;