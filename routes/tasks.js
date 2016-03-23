var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

// this gets called for any routes that have url params
// eg DELETE or POST  -- *really helpful* by providing
// a task object as attribute of a req object
router.param("task_id", function(req, res, next, taskId) {
	console.log("parms being extracted from URL for " + taskId);
	// request the task matching this ID, limit to one result
	request.db.tasks.find( {_id : ObjectID(taskId) }).limit(1).toArray(function(error, task) {
		if (error) {
			console.log("parm error " + error);
			return next(error);
		}
		if (task.length !=1) {
			return next(new Error(task.length + "tasks found, should be 1."));
		}
		req.task = task[0];
		console.log(req.task);
		return next();

	});
});

/** all incomplete tasks
  * creates a list of all tasks not yet completed
  * */
router.get("/", function(req, res, next) {

	req.db.tasks.find({
		completed : false
	}).toArray(function(error, tasklist){
		if (error) {
			return next(error);
		}
	/* syntax note -- "tasks: tasks || []"
	 * means if tasklist has a value (not undefined or false)
	 * set tasks to tasklist, otherwise set it to an empty array
	 */
		var allTasks = tasklist || [];
		res.render("tasks",{title: "TODO", tasks: allTasks });
	})
});	

// adds a new task to the database then redirects back to task list
router.post("/addtask", function(req, res, next) {

	if (!req.body || !req.body.task_name) {
		return next(new Error("no data provided for new task"));
	}

	req.db.tasks.save({name: req.body.task_name, completed: false }, function(error, task){
		if (error) {
			return next(error);
		}
		if (!task) {
			return next(new Error("error saving new task"));
		}
		res.redirect("/tasks");  // yay, no errors or problems, redirect back to taks lisk.
	});
});

// get all of the completed tasks
router.get("/completed", function(req, res, next) {

	req.db.tasks.find({ completed : true }).toArray(function(error, tasklist){
		if (error) {
			return next(error);
		}
		res.render("tasks_completed", { title : "Completed", tasks : tasklist || [] });
	});
});

// complete a task by POSTing to /task/task_id
// set completed value associated with task id to true
router.post("/:task_id", function(req, res, next) {

	if (!req.body.completed) {
		return next(new Error("body missing parameter?"));
	}

	req.db.tasks.updateOne(
		{ _id : ObjectID(req.task._id)}, 
		{ $set : { completed : true } },
		function(error, result) {
			if (error) {
				return next(error);
			}
			res.redirect("/tasks")
	});
});

// set ALL tasks to completed, then display empty task list
router.post("/alldone", function(req, res, next) {

	req.db.tasks.updateMany(
		{ completed : false },
		{ $set : { completed: true } },
		function (error, count) {
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
	console.log("deleting task...");
	// changing the next line to have "req.task_id" doesn't fix it.
	req.db.tasks.remove({ _id: ObjectID(req.task._id)}, function(error, result){
		console.log("attempting to delete: " + req.task_id);
		if (error) {
			return next(error);
		}
		res.sendStatus(200); // send success to AJAX call
	});
});

module.exports = router;