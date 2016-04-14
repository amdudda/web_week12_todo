var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');  // lets me hash user passwords
var Task = require('task.js');

// my user schema
var userSchema = new Schema({
	username: String,  // friendly name, eg "bob"
	local : {
		userid: {
			type: String,
			required: true,
			unique: true
		},
		password: String
	}

	signUpDate : { 
		type: Date,
		default: Date.now() 
	},

	tasks: { [Task] }

});

// copypasta from favecolors exercise in class
// these hash & unhash a user's password.
userSchema.methods.generateHash = function(password) {
	// create salted hash of pwd by hashing plaintext
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {
	// hash entered pwd, compare with stored hash
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);