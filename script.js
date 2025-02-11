let taskIdCounter = 1;

document.addEventListener("DOMContentLoaded", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskIdCounter = tasks.length ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
    tasks.forEach(task => addTaskToTable(task));
    
    if (tasks.length > 0) {
        document.querySelector('.task-manager__search').classList.remove('hidden');
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function validateFields() {
    const fields = ['task-title', 'task-desc', 'task-date', 'task-priority', 'task-status', 'task-category'];
    const isValid = fields.every(id => document.getElementById(id).value.trim() !== "");
    document.getElementById('add-task-btn').disabled = !isValid;
}

function addTask() {
    const task = {
        id: taskIdCounter++,
        title: document.getElementById('task-title').value.trim(),
        desc: document.getElementById('task-desc').value.trim(),
        dueDate: document.getElementById('task-date').value.trim(),
        priority: document.getElementById('task-priority').value.trim(),
        status: document.getElementById('task-status').value.trim(),
        category: document.getElementById('task-category').value.trim(),
        completed: false,
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    addTaskToTable(task);
    saveTaskToLocalStorage(task);
    document.querySelectorAll('.task-form__fields input, .task-form__fields select').forEach(input => input.value = '');
    validateFields();
    document.querySelector('.task-manager__search').classList.remove('hidden');
}

function addTaskToTable(task) {
    const tableBody = document.getElementById('task-table-body');
    const row = document.createElement('tr');
    const isInvalidDate = new Date(task.dueDate) < new Date(task.createdDate);

    row.setAttribute('data-task-id', task.id);
    row.setAttribute('data-task-status', task.status);

    row.innerHTML = `
        <td>${task.id}</td>
        <td class='editable'>${task.title}</td>
        <td class='editable'>${task.desc}</td>
        <td>${formatDate(task.createdDate)}</td>
        <td style="color: ${isInvalidDate ? 'red' : 'black'}">${formatDate(task.dueDate)}</td>
        <td class="priority-high">${task.priority}</td>
        <td>${task.status}</td>
        <td>${task.category}</td>
        <td>
            <button class="delete-button" onclick="deleteTask(this, ${task.id})"><i class="material-icons">delete</i></button>
            <button class="complete-button" onclick="markAsCompleted(${task.id})"><i class="material-icons">done</i></button>
        </td>
    `;

    if (task.completed) {
        row.querySelectorAll('td:not(:last-child)').forEach(td => td.classList.add('completed-task'));
    }

    tableBody.appendChild(row);
}


function deleteTask(button, taskId) {
    button.closest('tr').remove();
    removeTaskFromLocalStorage(taskId);
    if (!document.getElementById('task-table-body').children.length) {
        document.querySelector('.task-manager__search').classList.add('hidden');
    }
}

function markAsCompleted(taskId) {
    const rows = document.querySelectorAll('#task-table-body tr');
    rows.forEach(row => {
        if (parseInt(row.getAttribute('data-task-id')) === taskId) {
            const isCompleted = !row.classList.contains('completed-task');
            
            row.querySelectorAll('td:not(:last-child)').forEach(td => {
                td.classList.toggle('completed-task', isCompleted);
            });

            updateTaskStatusInLocalStorage(taskId, isCompleted ? "Completed" : "Pending", isCompleted);
        }
    });
}


function saveTaskToLocalStorage(task) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    localStorage.setItem("tasks", JSON.stringify(tasks.filter(task => task.id !== taskId)));
}

function updateTaskStatusInLocalStorage(taskId, newStatus, completed = false) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => task.id === taskId ? { ...task, status: newStatus, completed } : task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function filterTasks() {
    const filterValue = document.getElementById('status-filter').value;
    document.querySelectorAll('#task-table-body tr').forEach(row => {
        row.style.display = (filterValue === 'All' || row.getAttribute('data-task-status') === filterValue) ? '' : 'none';
    });
}

function searchTasks() {
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();
    document.querySelectorAll('#task-table-body tr').forEach(row => {
        const id = row.querySelector('td:nth-child(1)').innerText.toLowerCase();
        const title = row.querySelector('td:nth-child(2)').innerText.toLowerCase();
        row.style.display = (id.includes(searchInput) || title.includes(searchInput)) ? '' : 'none';
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".task-table__table tbody").forEach((tbody) => {
        tbody.addEventListener("dblclick", function (event) {
            let td = event.target;
            if (!td.classList.contains("editable") || td.querySelector("input")) return; // Only allow editing on designated cells
            
            let oldValue = td.innerText;
            let input = document.createElement("input");
            input.type = "text";
            input.value = oldValue;
            input.classList.add("editable-input");
  
            td.innerText = "";
            td.appendChild(input);
            input.focus();
  
            function saveEdit() {
                let newValue = input.value.trim() || oldValue;
                td.innerText = newValue;

                // Update local storage
                let taskId = parseInt(td.closest("tr").getAttribute("data-task-id"));
                let columnIndex = [...td.parentNode.children].indexOf(td); // Get column index

                updateEditedTaskInLocalStorage(taskId, columnIndex, newValue);
            }

            input.addEventListener("blur", saveEdit);
            input.addEventListener("keypress", function (e) {
                if (e.key === "Enter") saveEdit();
            });
        });
    });
});

// Function to update task in local storage
function updateEditedTaskInLocalStorage(taskId, columnIndex, newValue) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = tasks.find(t => t.id === taskId);
    if (!task) return;

    switch (columnIndex) {
        case 1: task.title = newValue; break;
        case 2: task.desc = newValue; break;
        case 5: task.priority = newValue; break;
        case 6: task.status = newValue; break;
        case 7: task.category = newValue; break;
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
}
