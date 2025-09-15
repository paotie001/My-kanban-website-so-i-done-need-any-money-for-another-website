// top-level ES module imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore, collection, addDoc,
  updateDoc, deleteDoc, doc, getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addEventListener("DOMContentLoaded", () => {
  const listsContainer = document.getElementById("lists");
  const addListBtn = document.getElementById("addListBtn");

  const taskContainers = {}; // keep track of all list containers

  // ---------- CREATE TASK ----------
  function createTaskElement(text, id, listName) {
    const task = document.createElement("div");
    task.classList.add("task");

    const taskText = document.createElement("span");
    taskText.textContent = text;

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

    addDragAndDrop(task, id);
    return task;
  }

  // ---------- ADD TASK ----------
  async function addTask(list, listName) {
    const text = prompt("Enter task:");
    if (text) {
      const docRef = await addDoc(collection(db, "tasks"), {
        text,
        list: listName,
        createdAt: Date.now()
      });
      const task = createTaskElement(text, docRef.id, listName);
      list.appendChild(task);
    }
  }

  // ---------- CREATE LIST ----------
  function createList(title = "New List") {
    // If list already exists, return it
    if (taskContainers[title]) {
      return taskContainers[title];
    }

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

    taskContainers[title] = taskContainer; // save reference
    return taskContainer;
  }

  // ---------- DRAG & DROP ----------
  function addDragAndDrop(task, id) {
    task.setAttribute("draggable", true);

    task.addEventListener("dragstart", () => {
      task.classList.add("dragging");
    });

    task.addEventListener("dragend", async () => {
      task.classList.remove("dragging");
      const newList = task.parentElement.parentElement.querySelector("h3").textContent;
      if (id) {
        await updateDoc(doc(db, "tasks", id), { list: newList });
      }
    });
  }

  document.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const containers = document.querySelectorAll(".task-container");

    if (!dragging) return;
    containers.forEach(container => {
      const rect = container.getBoundingClientRect();
      if (
          e.clientX > rect.left && e.clientX < rect.right &&
          e.clientY > rect.top && e.clientY < rect.bottom
      ) {
        container.appendChild(dragging);
      }
    });
  });

  // ---------- LOAD ALL TASKS FROM FIRESTORE ----------
  async function loadTasks() {
    const snapshot = await getDocs(collection(db, "tasks"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const list = createList(data.list); // reuse if exists
      const task = createTaskElement(data.text, docSnap.id, data.list);
      list.appendChild(task);
    });
  }

  // ---------- INIT ----------
  addListBtn.onclick = () => createList();

  // Create default lists
  ["To Do", "Doing", "Done"].forEach(title => createList(title));

  // Load tasks from Firestore
  loadTasks();
});