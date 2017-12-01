/**
 * Created by zhangwei on 10/28/17.
 */
var mongoose = require('mongoose');

var recruiterSchema = new mongoose.Schema({
    name: String,
    title: String,
    email: String,
    linkedinUrl: String,
    avatar: String,
    location: String,
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

recruiterSchema.index({name: 1, title: 1}, {unique: true});

var Recruiter = mongoose.model('Recruiter', recruiterSchema);

module.exports = Recruiter;