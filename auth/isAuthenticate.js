/**
 * Login Required middleware.
 */
module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/#userloginModal');
};