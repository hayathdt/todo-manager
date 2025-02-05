import express from "express";
import Task from "../models/task.js"; // importation de mon modele pour le crud

const router = express.Router();

// route pour envoyer les données de la nouvelle tache
router.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//route pour lire les tâches
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(201).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

// route pour lire une tâche spécifique
router.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/*
// route pour Mettre à jour une tâche
router.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByIdAndUpdate(taskId);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

*/

// Supprimer une tâche
router.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByIdAndDelete(taskId);
    res.status(201).json({ message: "tache supprimée" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
