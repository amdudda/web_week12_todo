var express = require('express');
var router = express.Router();
//var ObjectID = require('mongodb').ObjectID;
var Task = require('./../models/task.js');  // this is our ORM
var User = require('./../models/user.js');

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

/** all incomplete tasks
  * creates a list of all tasks not yet completed
  * */
router.get("/", isLoggedIn, function(req, res, next) {
	//tease out username for searching
	var userid = req.user.local.username;
	Task.find({completed:false, user_id: userid},function(error,allTasks) {
		if (error) {
			return next(error);
		}
		res.render("tasks",{title:"TODO", tasks: allTasks, user: req.user});
	});
});	

// adds a new task to the database then redirects back to task list
router.post("/addtask", isLoggedIn, function(req, res, next) {
	var userid = req.user.local.username;
	if (!req.body || !req.body.task_name) {
		return next(new Error("no data provided for new task"));
	}

	//create new task by instantiating task object
	var newTask = Task({ name:req.body.task_name, completed:false, user_id: userid });

	// then call save method to save to DB
	newTask.save(function(err){
		if (err) {
			return next(err);
		} else {
			res.redirect("/tasks");  // yay, no errors or problems, redirect back to taks lisk.
		}  // end if-else
	});

	// TODO Push the task to the user's array of tasks.
});

// get all of the completed tasks
router.get("/completed", isLoggedIn, function(req, res, next) {
	var userid = req.user.local.username;
	Task.find({completed:true, user_id: userid}, function(error, tasklist){
		if (error) {
			return next(error);
		}
		res.render("tasks_completed", { title : "Completed", tasks : tasklist || [] });
	});
});

/* work with route parameters to provide task objects */
router.param("task_id", function(req, res, next, taskId) {

	console.log("params being extracted from URL for " + taskId);

	Task.findById(taskId, function(err,task) {
		if (err) {
			return next(err);
		}
		req.task = task;
		return next();
	});
});

// complete a task by POSTing to /task/task_id
// set completed value associated with task id to true
router.post("/:task_id", function(req, res, next) {
	
	if (!req.body.completed) {
		return next(new Error("body missing parameter?"));
	}

	Task.findByIdAndUpdate(req.task._id, { completed : true },
		function(error, result) {
			if (error) {
				return next(error);
			}
			res.redirect("/tasks")
	});
});

// set ALL user's tasks to completed, then display empty task list
router.post("/alldone", isLoggedIn, function(req, res, next) {
	var userid = req.user.local.username;
	console.log(userid);
	Task.update( {completed: false, 'user_id': userid}, {completed: true}, {multi: true }, function (error, count) {
		if (error) {
			console.log("error " + error );
			return next(error);
		}
		res.redirect("/tasks");
	});
});

// delete a task
// delete task with taskId from database, using AJAX
router.delete("/:task_id", isLoggedIn, function(req, res, next) {
	
	// changing the next line to have "req.task_id" doesn't fix it.
	Task.findByIdAndRemove(req.task._id, function(error, result){
		if (error) {
			return next(error);
		}
		res.sendStatus(200); // send success to AJAX call
	});
});

module.exports = router;