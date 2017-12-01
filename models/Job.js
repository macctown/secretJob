/**
 * Created by zhangwei on 10/28/17.
 */
var mongoose = require('mongoose');

var jobSchema = new mongoose.Schema({
    link: {type: String, index: { unique: true }},
    position: {type: String, required: true},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    salary: {type: Number, default: 0},
    location: String,
    description: String,
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

jobSchema.statics.findOneOrCreate = function findOneOrCreate(condition, doc, callback) {
    const self = this;
    self.findOne(condition, (err, result) => {
        return result
            ? callback(err, result)
            : self.create(doc, (err, result) => {
                return callback(err, result);
            });
    });
};

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;