/**
 * Created by zhangwei on 10/28/17.
 */
var mongoose = require('mongoose');

var h1bSchema = new mongoose.Schema({
    title: String,
    salary: Number,
    submitDate: Date,
    startDate: Date,
    caseStatus: Date,
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

var H1B = mongoose.model('H1B', h1bSchema);

module.exports = H1B;