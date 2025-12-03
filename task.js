class Task {
    constructor(title, description, color, date, status, budget) {
        this.title = title;
        this.description = description;
        this.color = color;
        this.date = date;
        this.status = status;
        this.budget = budget;
    }
}

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

function displayTask(task) {
    // Remove the "no tasks" message if it exists
    if ($('#taskList p.text-muted').length) {
        $('#taskList').empty();
    }
    
    // Format the date
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
    
    // Create task card HTML
    const taskCard = `
        <div class="card mb-3 task-item" style="border-left: 4px solid ${task.color}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">${task.title}</h5>
                    <span class="badge bg-${badgeColor}">${task.status}</span>
                </div>
                <p class="card-text text-muted mb-2">${task.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${formattedDate}
                    </small>
                    <small class="text-success fw-bold">
                        <i class="bi bi-currency-dollar"></i>${parseFloat(task.budget).toFixed(2)}
                    </small>
                </div>
            </div>
        </div>
    `;
    
    // Append to task list
    $('#taskList').append(taskCard);
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
    
    // Display task in the list
    displayTask(data);
    
    // Show success message
    showSuccess();
    
    // Clear form
    clearForm();
}

function init(){
    $('#btnSave').click(saveTask);
    
    // Real-time validation - remove error when user starts typing
    $('#txtTitle, #txtDescription, #selDate, #numBudget').on('input change', function() {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
            $(this).next('.invalid-feedback').remove();
        }
    });
}

window.onload = init;
