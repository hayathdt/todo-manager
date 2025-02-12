// Éléments du DOM
const elements = {
  modal: document.getElementById("editModal"),
  confirmModal: document.getElementById("confirmModal"),
  confirmMessage: document.getElementById("confirmMessage"),
  taskForm: document.getElementById("taskForm"),
  tasksList: document.getElementById("tasksList"),
  buttons: {
    close: document.querySelector(".close"),
    confirm: document.getElementById("confirmBtn"),
    cancel: document.getElementById("cancelBtn"),
    update: document.getElementById("updateBtn"),
    delete: document.getElementById("deleteBtn"),
    deleteAll: document.getElementById("deleteAllBtn"),
  },
};

// Gestion de l'état
let state = {
  currentTaskId: null,
  confirmAction: null,
};

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
  elements.taskForm.addEventListener("submit", createTask);
  elements.buttons.update.addEventListener("click", () =>
    updateTask(state.currentTaskId)
  );
  elements.buttons.delete.addEventListener("click", () =>
    deleteTask(state.currentTaskId)
  );
  elements.buttons.deleteAll.addEventListener("click", deleteAllTasks);

  // Événements de la modale
  elements.buttons.close.onclick = closeModal;
  elements.buttons.confirm.onclick = executeConfirmAction;
  elements.buttons.cancel.onclick = closeConfirmModal;
  window.onclick = handleOutsideClick;

  document.addEventListener("DOMContentLoaded", loadTasks);
}

// Gestionnaires de la modale
function closeModal() {
  elements.modal.style.display = "none";
}

function closeConfirmModal() {
  elements.confirmModal.style.display = "none";
}

function handleOutsideClick(event) {
  if (event.target === elements.modal) {
    closeModal();
  }
}

function showConfirmModal(message, action) {
  elements.confirmMessage.textContent = message;
  elements.confirmModal.style.display = "block";
  state.confirmAction = action;
}

function executeConfirmAction() {
  if (state.confirmAction) {
    state.confirmAction();
  }
  closeConfirmModal();
}

// Appels API
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : null,
    };

    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}

// Opérations sur les tâches
async function createTask(event) {
  event.preventDefault();
  const taskData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    dueDate: document.getElementById("dueDate").value,
    completed: false,
  };

  try {
    await apiCall("/tasks", "POST", taskData);
    loadTasks();
    elements.taskForm.reset();
  } catch (error) {
    console.error("Création de tâche échouée:", error);
  }
}

async function loadTasks() {
  try {
    const response = await apiCall("/tasks");
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error("Chargement des tâches échoué:", error);
  }
}

async function updateTask(taskId) {
  if (!taskId) return;

  showConfirmModal(
    "Voulez-vous vraiment enregistrer les modifications ?",
    async () => {
      const taskData = {
        title: document.getElementById("editTitle").value,
        description: document.getElementById("editDescription").value,
        completed: document.getElementById("editCompleted").checked,
      };

      try {
        await apiCall(`/tasks/${taskId}`, "PUT", taskData);
        loadTasks();
        closeModal();
        state.currentTaskId = null;
      } catch (error) {
        console.error("Mise à jour échouée:", error);
      }
    }
  );
}

async function deleteTask(taskId) {
  if (!taskId) return;

  showConfirmModal(
    "Êtes-vous sûr de vouloir supprimer cette tâche ?",
    async () => {
      try {
        await apiCall(`/tasks/${taskId}`, "DELETE");
        loadTasks();
        closeModal();
        state.currentTaskId = null;
      } catch (error) {
        console.error("Suppression échouée:", error);
      }
    }
  );
}

async function deleteAllTasks() {
  try {
    await apiCall("/tasks", "DELETE");
    loadTasks();
  } catch (error) {
    console.error("Suppression totale échouée:", error);
  }
}

async function toggleTaskCompletion(taskId, isCompleted) {
  try {
    await apiCall(`/tasks/${taskId}`, "PUT", { completed: isCompleted });
  } catch (error) {
    console.error("Mise à jour du statut échouée:", error);
  }
}

// Opérations sur l'interface utilisateur
function renderTasks(tasks) {
  elements.tasksList.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    elements.tasksList.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = "task-item";

  taskElement.innerHTML = `
    <input type="checkbox" ${
      task.completed ? "checked" : ""
    } class="task-checkbox">
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p>Échéance: ${formatDate(task.dueDate)}</p>
    <p>Statut: ${task.completed ? "Terminée" : "En cours"}</p>
    <p>Créée le: ${formatDate(task.createdAt)}</p>
  `;

  const checkbox = taskElement.querySelector(".task-checkbox");
  checkbox.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleTaskCompletion(task._id, checkbox.checked);
  });

  taskElement.addEventListener("click", () => selectTask(task));
  return taskElement;
}

function selectTask(task) {
  state.currentTaskId = task._id;
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description;
  document.getElementById("editCompleted").checked = task.completed;
  elements.modal.style.display = "block";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("fr-FR");
}

// Initialisation de l'application
initializeEventListeners();
