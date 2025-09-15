const listsContainer = document.getElementById("lists");
const addListBtn = document.getElementById("addListBtn");

// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc }
  from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBhsiMlfEP_6rdjUDvniqDv3OedZ2MSh8A",
  authDomain: "paotie-s-kanban.firebaseapp.com",
  projectId: "paotie-s-kanban",
  storageBucket: "paotie-s-kanban.firebasestorage.app",
  messagingSenderId: "127480033088",
  appId: "1:127480033088:web:fe8d9fae11e187fe9154a5",
  measurementId: "G-PK0KT5BH1R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- TASK CREATION ----------
function createTaskElement(text, id, listName) {
  const task = document.createElement("div");
  task.classList.add("task");

  // Task text
  const taskText = document.createElement("span");
  taskText.textContent = text;

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✖";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = async () => {
    task.remove();
    if (id) {
      await deleteDoc(doc(db, "tasks", id));
    }
  };

  task.appendChild(taskText);
  task.appendChild(deleteBtn);

  addDragAndDrop(task, id, text, listName);
  return task;
}

// ---------- ADD TASK ----------
async function addTask(list, listName) {
  const text = prompt("Enter task:");
  if (text) {
    const docRef = await addDoc(collection(db, "tasks"), {
      text: text,
      list: listName,
      createdAt: Date.now()
    });
    const task = createTaskElement(text, docRef.id, listName);
    list.appendChild(task);
  }
}

// ---------- CREATE LIST ----------
function createList(title = "New List") {
  const listContainer = document.createElement("div");
  listContainer.classList.add("list");

  const header = document.createElement("h3");
  header.textContent = title;

  const taskContainer = document.createElement("div");
  taskContainer.classList.add("task-container");

  const addTaskBtn = document.createElement("button");
  addTaskBtn.textContent = "+ Add Task";
  addTaskBtn.onclick = () => addTask(taskContainer, title);

  listContainer.appendChild(header);
  listContainer.appendChild(taskContainer);
  listContainer.appendChild(addTaskBtn);

  listsContainer.appendChild(listContainer);
  return taskContainer;
}

// ---------- DRAG & DROP ----------
function addDragAndDrop(task, id, text, listName) {
  task.setAttribute("draggable", true);

  task.addEventListener("dragstart", () => {
    task.classList.add("dragging");
  });

  task.addEventListener("dragend", async () => {
    task.classList.remove("dragging");
    const newList = task.parentElement.parentElement.querySelector("h3").textContent;

    if (id && newList !== listName) {
      await updateDoc(doc(db, "tasks", id), {
        list: newList
      });
    }
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

// ---------- LOAD TASKS FROM FIRESTORE ----------
async function loadTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const lists = document.querySelectorAll(".list");
    lists.forEach(list => {
      if (list.querySelector("h3").textContent === data.list) {
        const task = createTaskElement(data.text, docSnap.id, data.list);
        list.querySelector(".task-container").appendChild(task);
      }
    });
  });
}

// ---------- INIT ----------
addListBtn.onclick = () => createList();

// Default lists
["To Do", "Doing", "Done"].forEach(title => createList(title));

// Load tasks from DB on page load
window.onload = loadTasks;