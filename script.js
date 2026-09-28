
// Select HTML elements
const input = document.getElementById("todo-input");
const form = document.getElementById("todo-form");
const list = document.getElementById("todo-list");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter-btn");

// Load saved tasks
let todos = [];

try {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
} catch (error) {
    todos = [];
}

// Current filter
let currentFilter = "all";

// Save tasks to browser storage
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Update the progress bar
function updateProgress() {
    const completed = todos.filter(todo => todo.completed).length;
    const total = todos.length;

    progressText.textContent = `${completed} / ${total} completed`;

    const percentage = total === 0
        ? 0
        : (completed / total) * 100;

    progressFill.style.width = `${percentage}%`;
}

// Create an individual task
function createTodoNode(todo, index) {
    const li = document.createElement("li");

    // Star button
    const starBtn = document.createElement("button");
    starBtn.className = "star-btn";
    starBtn.textContent = todo.completed ? "★" : "☆";
    starBtn.setAttribute(
        "aria-label",
        todo.completed ? "Mark as pending" : "Mark as completed"
    );

    if (todo.completed) {
        starBtn.classList.add("completed");
    }

    starBtn.addEventListener("click", () => {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        render();
    });

    // Task text
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = todo.text;

    if (todo.completed) {
        span.classList.add("done");
    }

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "task-actions";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "action-btn";
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", () => {
        const updatedText = prompt("Edit your task:", todo.text);

        if (updatedText === null) return;

        const newText = updatedText.trim();

        if (newText === "") {
            alert("Task cannot be empty!");
            return;
        }

        todos[index].text = newText;
        saveTodos();
        render();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
        todos.splice(index, 1);
        saveTodos();
        render();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(starBtn);
    li.appendChild(span);
    li.appendChild(actions);

    return li;
}

// Display tasks
function render() {
    list.innerHTML = "";

    const filteredTodos = todos
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => {
            if (currentFilter === "pending") {
                return !todo.completed;
            }

            if (currentFilter === "completed") {
                return todo.completed;
            }

            return true;
        });

    filteredTodos.forEach(({ todo, index }) => {
        list.appendChild(createTodoNode(todo, index));
    });

    emptyMessage.style.display =
        filteredTodos.length === 0 ? "block" : "none";

    updateProgress();
}

// Add a task
function addTodo(event) {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
        input.focus();
        return;
    }

    todos.push({
        text: text,
        completed: false
    });

    saveTodos();

    currentFilter = "all";
    updateActiveFilter();

    input.value = "";
    input.focus();

    render();
}

// Handle task submission
form.addEventListener("submit", addTodo);

// Change task filter
function updateActiveFilter() {
    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        updateActiveFilter();
        render();
    });
});

// Initial display
render();