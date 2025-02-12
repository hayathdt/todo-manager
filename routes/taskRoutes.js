const categoryColors = {
  shopping: "#FF6B6B",
  travail: "#4ECDC4",
  personnel: "#45B7D1",
  administration: "#96CEB4",
};

import express from "express";
import Task from "../models/task.js"; // Importation du modèle

const router = express.Router();

// 📌 Route pour ajouter une nouvelle tâche
router.post("/tasks", async (req, res) => {
  try {
    console.log("Received task data:", req.body);
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.log("Error creating task:", error);
    res.status(400).json({ error: error.message });
  }
});

// 📌 Route pour récupérer les tâches avec pagination
router.get("/tasks", async (req, res) => {
  try {
    const { category, page = 1, limit = 4 } = req.query;
    const query = category && category !== "all" ? { category } : {};

    const skip = (page - 1) * limit;
    const totalTasks = await Task.countDocuments(query);
    const tasks = await Task.find(query).skip(skip).limit(limit);

    res.status(200).json({
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Route pour récupérer une tâche spécifique
router.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Route pour mettre à jour une tâche
router.put("/tasks/:id", async (req, res) => {
  try {
    const updates = {
      ...req.body,
      categoryColor: categoryColors[req.body.category], // Assure la cohérence des couleurs
    };

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Route pour supprimer une tâche
router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Route pour supprimer toutes les tâches
router.delete("/tasks", async (req, res) => {
  try {
    await Task.deleteMany({});
    res.status(200).json({ message: "Toutes les tâches ont été supprimées" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
