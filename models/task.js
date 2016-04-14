var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema, data types include
// String, Number, Date, Boolean...
var taskSchema = new Schema({
	name: String,
	completed: Boolean,
	user_id: String		// the user id of the user associated with a task
});

// compile into a Mongoose model
var Task = mongoose.model('Task',taskSchema);

// provide this as an export.  Other bits of code
// can now work with Task objects
module.exports = Task;