/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  if(res.locals.user){
      res.redirect("/dashboard");
  }
  else {
      res.render('home', {
          title: "Home",
          errors: req.flash("errors")
      });
  }
};