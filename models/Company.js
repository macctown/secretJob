/**
 * Created by zhangwei on 10/28/17.
 */
var mongoose = require('mongoose');

var companySchema = new mongoose.Schema({
    name: {type: String, index: { unique: true }},
    recruiters: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter'}],
    h1bInfo: [{type: mongoose.Schema.Types.ObjectId, ref: 'H1B'}],
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

var Company = mongoose.model('Company', companySchema);

module.exports = Company;