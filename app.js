const API_URL = "https://106api-b0bnggbsgnezbzcz.westus3-01.azurewebsites.net/api/tasks";

function validateForm() {
    // Clear previous error messages
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').remove();
    
    let isValid = true;
    
    // Validate Title
    const title = $('#txtTitle').val().trim();
    if (title === '' || title.length < 3) {
        showError('#txtTitle', 'Title is required and must be at least 3 characters');
        isValid = false;
    }
    
    // Validate Description
    const description = $('#txtDescription').val().trim();
    if (description === '' || description.length < 10) {
        showError('#txtDescription', 'Description is required and must be at least 10 characters');
        isValid = false;
    }
    
    // Validate Date
    const date = $('#selDate').val();
    if (date === '') {
        showError('#selDate', 'Due date is required');
        isValid = false;
    } else {
        // Check if date is in the past
        const selectedDate = new Date(date);
        const now = new Date();
        if (selectedDate < now) {
            showError('#selDate', 'Due date cannot be in the past');
            isValid = false;
        }
    }
    
    // Validate Budget
    const budget = $('#numBudget').val();
    if (budget === '' || parseFloat(budget) < 0) {
        showError('#numBudget', 'Budget must be a positive number');
        isValid = false;
    } else if (parseFloat(budget) > 1000000) {
        showError('#numBudget', 'Budget cannot exceed $1,000,000');
        isValid = false;
    }
    
    return isValid;
}

function showError(fieldId, message) {
    $(fieldId).addClass('is-invalid');
    $(fieldId).after(`<div class="invalid-feedback d-block">${message}</div>`);
}

function clearForm() {
    $('#txtTitle').val('');
    $('#txtDescription').val('');
    $('#selColor').val('#00b4d8');
    $('#selDate').val('');
    $('#selStatus').val('new');
    $('#numBudget').val('');
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').remove();
}

function showSuccess() {
    // Create success alert
    const alert = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Task has been created successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Insert alert at the top of the form
    $('#postMethod .card-body').prepend(alert);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        $('.alert').fadeOut(400, function() { $(this).remove(); });
    }, 3000);
}

function displayTask(task){
    // Format the date nicely
    const dateObj = new Date(task.date);
    const formattedDate = dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Determine status badge color
    const statusColors = {
        'new': 'primary',
        'in progress': 'warning',
        'blocked': 'danger',
        'done': 'success'
    };
    const badgeColor = statusColors[task.status] || 'secondary';
    
    const data = `
    <div class="card mb-3 task-item" data-id="${task.id}" style="border-left: 4px solid ${task.color}">
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0 fw-bold">${task.title}</h5>
                <div>
                    <span class="badge bg-${badgeColor} text-capitalize me-2">${task.status}</span>
                    <button class="btn btn-sm btn-danger btn-delete" title="Delete task">&times;</button>
                </div>
            </div>
            <p class="card-text text-muted mb-3">${task.description}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                    <i class="bi bi-calendar-event me-1"></i>${formattedDate}
                </small>
                <span class="badge bg-success">
                    $${parseFloat(task.budget).toFixed(2)}
                </span>
            </div>
            <small class="text-muted d-block mt-2">ID: ${task.id}</small>
        </div>
    </div>
    `;
    
    $("#taskContainer").append(data);
}

function saveTask(){
    // Validate form first
    if (!validateForm()) {
        return; // Stop if validation fails
    }
    
    const title = $('#txtTitle').val().trim();
    const description = $('#txtDescription').val().trim();
    const color = $('#selColor').val();
    const date = $('#selDate').val();
    const status = $('#selStatus').val();
    const budget = $('#numBudget').val();

    const data = new Task(title, description, color, date, status, budget);
    console.log('Task created:', data);

    $.ajax({
        type: "POST",
        url: API_URL,
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(response) {
            console.log("Task saved successfully!", response);
            // Display task from server response (includes the ID)
            displayTask(response);
            // Show success message
            showSuccess();
            // Clear form
            clearForm();
        },
        error: function(error) {
            console.error("Error saving task:", error);
        }
    });
}

function getTasks() {
  $.ajax({
    type: "GET",
    url: API_URL,
    dataType: "json",
    
    success: function(tasks) {
      console.log("Tasks retrieved:", tasks);
      
      // Filter to only show tasks where name matches "Robert"
      const myTasks = tasks.filter(function(task) {
        return task.name === "Robert";
      });
      
      console.log("Filtered tasks (Robert):", myTasks);
      
      // Display each filtered task in the list
      myTasks.forEach(function(task) {
        displayTask(task);
      });
    },
    
    error: function(error) {
      console.log("Error:", error);
    }
  });
}

function testConnection(){
// Test AJAX connection
$.ajax({
    type: "GET",
    url: API_URL,
    success: function(response) {
        console.log("API Connection successful!", response);
    },
    error: function(error) {
        console.error("API Connection failed:", error);
    }
});
}

function deleteTask() {
    console.log("Deleting task...");
    
    // 1. Get the button that was clicked
    const btn = $(this);
    
    // 2. Find the parent div with class "task-item"
    const taskElement = btn.closest('.task-item');
    
    // 3. Get the unique ID from the HTML
    const id = taskElement.data('id');
    console.log("Requesting delete for ID: " + id);
    
    // 4. Send DELETE request to API
    $.ajax({
        type: "DELETE",
        url: API_URL + "/" + id,
        success: function() {
            // 5. Animate removal from screen
            taskElement.fadeOut(500, function() {
                // Remove taskElement from DOM completely
                $(this).remove();
            });
        },
        error: function(error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task");
        }
    });
}

function filterTasks(status) {
    if (status === "All") {
        // Show all tasks
        $('.task-item').show();
    } else {
        // Hide all tasks first
        $('.task-item').hide();
        
        // Show only those that match
        $('.task-item').each(function() {
            // Get text from .badge (status label) inside this task
            const taskStatus = $(this).find('.badge').first().text().trim().toLowerCase();
            
            // If taskStatus matches the filter status
            if (taskStatus === status.toLowerCase()) {
                $(this).show();
            }
        });
    }
    
    // Update active button state
    $('.btn-group .btn').removeClass('active');
}

function init(){
    $('#btnSave').click(saveTask);
    
    // Bind delete button click (using event delegation for dynamically added elements)
    $('#taskList').on('click', '.btn-delete', deleteTask);
    
    // Filter button click handlers
    $('#btnAll').click(function() {
        filterTasks("All");
        $(this).addClass('active');
    });
    
    $('#btnDone').click(function() {
        filterTasks("done");
        $(this).addClass('active');
    });
    
    $('#btnTodo').click(function() {
        filterTasks("new");
        $(this).addClass('active');
    });
    
    $('#btnInProgress').click(function() {
        filterTasks("in progress");
        $(this).addClass('active');
    });
    
    $('#btnBlocked').click(function() {
        filterTasks("blocked");
        $(this).addClass('active');
    });
    
    // Load tasks from server on page load
    getTasks();
    
    // Real-time validation - remove error when user starts typing
    $('#txtTitle, #txtDescription, #selDate, #numBudget').on('input change', function() {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
            $(this).next('.invalid-feedback').remove();
        }
    });
}

window.onload = init;
