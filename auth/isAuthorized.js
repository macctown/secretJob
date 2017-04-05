/**
 * Created by zhangwei on 4/1/17.
 */
/**
 * Authorization Required middleware.
 */
module.exports = function(req, res, next) {
    var provider = req.path.split('/').slice(-1)[0];

    if (_.find(req.user.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect('/auth/' + provider);
    }
};