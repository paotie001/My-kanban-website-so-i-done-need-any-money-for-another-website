const listsContainer = document.getElementById("lists");
const addListBtn = document.getElementById("addListBtn");

function createTaskElement(text) {
  const task = document.createElement("div");
  task.classList.add("task");

  // Task text
  const taskText = document.createElement("span");
  taskText.textContent = text;

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✖";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = () => task.remove();

  // Put text + delete inside task
  task.appendChild(taskText);
  task.appendChild(deleteBtn);

  addDragAndDrop(task);
  return task;
}

function addTask(list) {
  const text = prompt("Enter task:");
  if (text) {
    const task = createTaskElement(text);
    list.appendChild(task);
  }
}

function createList(title = "New List") {
  const listContainer = document.createElement("div");
  listContainer.classList.add("list");

  const header = document.createElement("h3");
  header.textContent = title;

  const taskContainer = document.createElement("div");
  taskContainer.classList.add("task-container");

  const addTaskBtn = document.createElement("button");
  addTaskBtn.textContent = "+ Add Task";
  addTaskBtn.onclick = () => addTask(taskContainer);

  listContainer.appendChild(header);
  listContainer.appendChild(taskContainer);
  listContainer.appendChild(addTaskBtn);

  listsContainer.appendChild(listContainer);
}

function addDragAndDrop(task) {
  task.setAttribute("draggable", true);

  task.addEventListener("dragstart", () => {
    task.classList.add("dragging");
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
  });
}

document.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const containers = document.querySelectorAll(".task-container");

  containers.forEach(container => {
    const rect = container.getBoundingClientRect();
    if (e.clientX > rect.left && e.clientX < rect.right &&
        e.clientY > rect.top && e.clientY < rect.bottom) {
      container.appendChild(dragging);
    }
  });
});

addListBtn.onclick = () => createList();

// Default lists
["To Do", "Doing", "Done"].forEach(title => createList(title));