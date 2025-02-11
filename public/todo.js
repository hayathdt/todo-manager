let currentTaskId = null;

document.getElementById("taskForm").addEventListener("submit", createTask);
document
  .getElementById("updateBtn")
  .addEventListener("click", () => updateTask(currentTaskId));
document
  .getElementById("deleteBtn")
  .addEventListener("click", () => deleteTask(currentTaskId));

async function createTask(event) {
  event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire
  // pour récupérer les valeurs des champs du formulaire
  const taskData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    completed: document.getElementById("completed").checked,
  };

  try {
    // Envoi des données au serveur via une requête POST
    const response = await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData), // Convertit les données en JSON
    });

    if (response.ok) {
      loadTasks(); // Recharge la liste des tâches après la création
      document.getElementById("taskForm").reset(); // réinitialise le formulaire
    } else {
      console.log("Réponse serveur:", await response.json());
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour sélectionner une tâche
async function loadTasks() {
  try {
    const response = await fetch("/tasks"); //envoie une requête GET pour récupérér les tâches
    const tasks = await response.json(); // convertit les données en JSON
    const tasksList = document.getElementById("tasksList");
    tasksList.innerHTML = ""; // vide la liste avant de l'afficher

    // Parcours des tâches et création des éléments HTML
    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-item";
      taskElement.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Statut: ${task.completed ? "Terminée" : "En cours"}</p>
            `;
      taskElement.onclick = () => selectTask(task);
      tasksList.appendChild(taskElement);
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour sélectionner une tâche et pré-remplir le formulaire
function selectTask(task) {
  currentTaskId = task._id;
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("completed").checked = task.completed;
}

// Fonction pour mettre à jour une tâche
async function updateTask(taskId) {
  if (!taskId) return; // si aucune tache n'est séléctionnée, ne fait rien

  // Récupération des valeurs mises à jour du formulaire
  const taskData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    completed: document.getElementById("completed").checked,
  };

  try {
    // Envoi une requête PUT pour mettre à jour la tâche
    const response = await fetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (response.ok) {
      loadTasks();
      document.getElementById("taskForm").reset();
      currentTaskId = null; // réinitialise l'id de la tache séléctionnée
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour supprimer une tâche
async function deleteTask(taskId) {
  if (!taskId) return;

  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadTasks();
      document.getElementById("taskForm").reset();
      currentTaskId = null;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

loadTasks(); // fonction déclarée au dessus, pour charger et afficher la liste des tâches
