// Éléments du DOM
const elements = {
  modal: document.getElementById("editModal"),
  confirmModal: document.getElementById("confirmModal"),
  confirmMessage: document.getElementById("confirmMessage"),
  taskForm: document.getElementById("taskForm"),
  tasksList: document.getElementById("tasksList"),
  errorDisplay: document.getElementById("errorDisplay"),
  buttons: {
    close: document.querySelector(".close"),
    confirm: document.getElementById("confirmBtn"),
    cancel: document.getElementById("cancelBtn"),
    update: document.getElementById("updateBtn"),
    delete: document.getElementById("deleteBtn"),
    deleteAll: document.getElementById("deleteAllBtn"),
    prevPageBtn: document.getElementById("prevPageBtn"),
    nextPageBtn: document.getElementById("nextPageBtn"),
    pageNumber: document.getElementById("pageNumber"),
  },
};
const categoryColors = {
  shopping: "#FF6B6B",
  travail: "#4ECDC4",
  personnel: "#45B7D1",
  administration: "#96CEB4",
};

// Gestion de l'état
let state = {
  currentTaskId: null,
  confirmAction: null,
  currentPage: 1,
  totalPages: 1,
};

// Gestion des erreurs
function displayError(message) {
  if (elements.errorDisplay) {
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.style.display = "block";
    setTimeout(() => {
      elements.errorDisplay.style.display = "none";
    }, 3000);
  } else {
    alert(message);
  }
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
    displayError(
      "Une erreur est survenue lors de la communication avec le serveur"
    );
    throw error;
  }
}

// Gestion de la pagination
async function fetchTasks(page = 1) {
  try {
    const response = await apiCall(`/tasks?page=${page}&limit=4`);
    const data = await response.json();

    state.totalPages = data.totalPages;
    state.currentPage = data.currentPage;

    elements.tasksList.innerHTML = "";
    data.tasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      elements.tasksList.appendChild(taskElement);
    });

    updatePaginationControls();
  } catch (error) {
    console.error("Erreur lors du chargement des tâches:", error);
    displayError("Impossible de charger les tâches");
  }
}

function updatePaginationControls() {
  elements.buttons.pageNumber.textContent = state.currentPage;
  elements.buttons.prevPageBtn.disabled = state.currentPage === 1;
  elements.buttons.nextPageBtn.disabled =
    state.currentPage === state.totalPages;
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

// Opérations sur les tâches
async function createTask(event) {
  event.preventDefault();
  const taskData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    dueDate: document.getElementById("dueDate").value,
    completed: false,
    category: document.getElementById("taskCategory").value,
    categoryColor:
      categoryColors[document.getElementById("taskCategory").value],
  };
  console.log("Sending task data:", taskData);
  try {
    await apiCall("/tasks", "POST", taskData);
    elements.taskForm.reset();
    fetchTasks(state.currentPage);
  } catch (error) {
    displayError("Impossible de créer la tâche");
  }
}

// filtrage des tâches par catégorie
document.getElementById("categoryFilter").addEventListener("change", (e) => {
  const selectedCategory = e.target.value;
  if (selectedCategory === "all") {
    fetchTasks(state.currentPage);
  } else {
    fetchTasksByCategory(selectedCategory);
  }
});

// fonction pour récupérer les tâches par catégorie
async function fetchTasksByCategory(category) {
  try {
    const response = await apiCall(
      `/tasks?category=${category}&page=${state.currentPage}&limit=4`
    );
    const data = await response.json();

    state.totalPages = data.totalPages;
    state.currentPage = data.currentPage;

    elements.tasksList.innerHTML = "";
    data.tasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      elements.tasksList.appendChild(taskElement);
    });

    updatePaginationControls();
  } catch (error) {
    displayError("Erreur lors du filtrage des tâches");
  }
}

async function loadTasks() {
  await fetchTasks(state.currentPage);
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
        category: document.getElementById("editCategory").value,
        categoryColor:
          categoryColors[document.getElementById("editCategory").value],
      };

      try {
        await apiCall(`/tasks/${taskId}`, "PUT", taskData);
        fetchTasks(state.currentPage);
        closeModal();
        state.currentTaskId = null;
      } catch (error) {
        displayError("Impossible de mettre à jour la tâche");
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
        fetchTasks(state.currentPage);
        closeModal();
        state.currentTaskId = null;
      } catch (error) {
        displayError("Impossible de supprimer la tâche");
      }
    }
  );
}

async function deleteAllTasks() {
  try {
    await apiCall("/tasks", "DELETE");
    fetchTasks(1);
  } catch (error) {
    displayError("Impossible de supprimer toutes les tâches");
  }
}

async function toggleTaskCompletion(taskId, isCompleted) {
  try {
    await apiCall(`/tasks/${taskId}`, "PUT", { completed: isCompleted });
    fetchTasks(state.currentPage);
  } catch (error) {
    displayError("Impossible de mettre à jour le statut de la tâche");
  }
}

// Création des éléments de l'interface
function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = "task-item";
  taskElement.style.borderLeft = `5px solid ${task.categoryColor}`;

  taskElement.innerHTML = `
    <span class="category-badge" style="background-color: ${
      task.categoryColor
    }"></span>
    <input type="checkbox" ${
      task.completed ? "checked" : ""
    } class="task-checkbox">
    <h3>${task.title}</h3>
    <div id="description-container"><p id="descriptiontask">${
      task.description
    }</p></div>
    <p id="duedate">Avant le: ${formatDate(task.dueDate)}</p>
    <p id="check">Statut: ${task.completed ? "Terminée" : "En cours"}</p>
    <p id="createdate">Créée le: ${formatDate(task.createdAt)}</p>
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
  document.getElementById("editCategory").value = task.category;
  elements.modal.style.display = "block";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("fr-FR");
}

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

  elements.buttons.prevPageBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      fetchTasks(state.currentPage);
    }
  });

  elements.buttons.nextPageBtn.addEventListener("click", () => {
    if (state.currentPage < state.totalPages) {
      state.currentPage++;
      fetchTasks(state.currentPage);
    }
  });

  elements.buttons.close.addEventListener("click", closeModal);
  elements.buttons.confirm.addEventListener("click", executeConfirmAction);
  elements.buttons.cancel.addEventListener("click", closeConfirmModal);
  window.addEventListener("click", handleOutsideClick);

  document.addEventListener("DOMContentLoaded", loadTasks);
}

// Initialisation de l'application
initializeEventListeners();
