var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

// here we redirect stuff to a bunch of other pages.

/* GET signup page */
router.get('/signup', function(req, res, next) {
	res.render('signup', { message : req.flash('signupMessage') } );
});

/*
 * post SIGNUP - called when user cliks the signup button on form
 * calls passport.authenticate with args
 * -- what to do on success
 * -- what to do on failure
 * -- whether to display flash messages to user
 */
router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/tasks',
	failureRedirect: '/signup',
	failureFlash: true
}));

/* POST login - called when user clicks login button
 * similar to signup, except w/ local-login
 */
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/tasks',
	failureRedirect: '/',
	failureFlash: true
}));

/* GET logout */
router.get('/logout', function(req, res, next) {
	req.logout();  // passport middleware adds this to req.
	res.redirect('/');  // then send user back to homepage.
});

/*
 * Middleware function to verify user is logged in and authorized.
 * sends user back to homepage on failure.
 * redirect also cancels all route handling and just redirects to wherever specified.
 */
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} 
	res.redirect('/');  // note lack of else - we want to be really sure the user goes somewhere if the if clause falls through.
}

module.exports = router;
