$(document).ready(function(){

	$('button.delete_task').click(function(){

		var taskID = $(this).attr("task_id");
		var deleteURL = "/tasks/" + taskID;

		// send AJAX call to delete task
		$.ajax(
			{ method : 'delete',
			  url : deleteURL
			}
		).done(function(){
			var selector = "#" + taskID;

			// fade out, then remove item
			$(selector).fadeOut(function(){
				this.remove()
			});

		}).fail(function(){
			console.log("there was an error deleting task # " + taskID);
		});
	});
});