var express = require('express');
var router = express.Router();
//var ObjectID = require('mongodb').ObjectID;
var Task = require('./../models/task.js');  // this is our ORM

/** all incomplete tasks
  * creates a list of all tasks not yet completed
  * */
router.get("/", function(req, res, next) {

	Task.find({completed:false},function(error,allTasks) {
		if (error) {
			return next(error);
		}
		res.render("tasks",{title:"TODO", tasks: allTasks});
	});
});	

// adds a new task to the database then redirects back to task list
router.post("/addtask", function(req, res, next) {

	if (!req.body || !req.body.task_name) {
		return next(new Error("no data provided for new task"));
	}

	//create new task by instantiating task object
	var newTask = Task({ name:req.body.task_name, completed:false});

	// then call save method to save to DB
	newTask.save(function(err){
		if (err) {
			return next(err);
		} else {
			res.redirect("/tasks");  // yay, no errors or problems, redirect back to taks lisk.
		}  // end if-else
	});
});

// get all of the completed tasks
router.get("/completed", function(req, res, next) {

	Task.find({completed:true}, function(error, tasklist){
		if (error) {
			return next(error);
		}
		res.render("tasks_completed", { title : "Completed", tasks : tasklist || [] });
	});
});

/* work with route parameters to provide task objects */
router.param("task_id", function(req, res, next, taskId) {

	console.log("params bieng extracted from URL for " + taskId);

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

// set ALL tasks to completed, then display empty task list
router.post("/alldone", function(req, res, next) {
	
	Task.update( {completed: false }, {completed: true }, {multi: true }, function (error, count) {
		if (error) {
			console.log("error " + error );
			return next(error);
		}
		res.redirect("/tasks");
	});
});

// delete a task
// delete task with taskId from database, using AJAX
router.delete("/:task_id", function(req, res, next) {
	
	// changing the next line to have "req.task_id" doesn't fix it.
	Task.findByIdAndRemove(req.task._id, function(error, result){
		if (error) {
			return next(error);
		}
		res.sendStatus(200); // send success to AJAX call
	});
});

module.exports = router;