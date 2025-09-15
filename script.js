// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore, collection, addDoc,
  updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase config
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

// Run after DOM ready
window.addEventListener("DOMContentLoaded", () => {
  const listsContainer = document.getElementById("lists");
  const addListBtn = document.getElementById("addListBtn");

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

    addDragAndDrop(task, id, listName);
    return task;
  }

  // ---------- ADD TASK ----------
  async function addTask(list, listName) {
    const text = prompt("Enter task:");
    if (text) {
      const tempTask = createTaskElement(text, null, listName);
      list.appendChild(tempTask);

      try {
        const docRef = await addDoc(collection(db, "tasks"), {
          text,
          list: listName,
          createdAt: Date.now()
        });

        // update delete button with Firestore id
        tempTask.querySelector("button").onclick = async () => {
          tempTask.remove();
          await deleteDoc(doc(db, "tasks", docRef.id));
        };
      } catch (err) {
        console.error("Error saving task:", err);
        tempTask.remove();
      }
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
    return listContainer;
  }

  // ---------- DRAG & DROP ----------
  function addDragAndDrop(task, id, listName) {
    task.setAttribute("draggable", true);

    task.addEventListener("dragstart", () => {
      task.classList.add("dragging");
    });

    task.addEventListener("dragend", async () => {
      task.classList.remove("dragging");
      const newList = task.parentElement.parentElement.querySelector("h3").textContent;
      if (id && newList !== listName) {
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

  // ---------- REALTIME FIRESTORE SYNC ----------
  function setupRealtimeTasks() {
    listsContainer.innerHTML = "";

    const defaultLists = ["To Do", "Doing", "Done"];
    const taskContainers = {};

    // create default lists
    defaultLists.forEach(title => {
      const listContainer = createList(title);
      taskContainers[title] = listContainer.querySelector(".task-container");
    });

    // listen in real-time
    onSnapshot(collection(db, "tasks"), (snapshot) => {
      // clear all tasks
      Object.values(taskContainers).forEach(c => (c.innerHTML = ""));

      snapshot.forEach(docSnap => {
        const data = docSnap.data();

        // auto-create new lists if needed
        if (!taskContainers[data.list]) {
          const newList = createList(data.list);
          taskContainers[data.list] = newList.querySelector(".task-container");
        }

        const task = createTaskElement(data.text, docSnap.id, data.list);
        taskContainers[data.list].appendChild(task);
      });
    });
  }

  // ---------- INIT ----------
  addListBtn.onclick = () => createList();
  setupRealtimeTasks();
});