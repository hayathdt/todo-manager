import express from "express";
import mongoose from "mongoose";
import Task from "./models/task.js";

const app = express();

import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie"))
  .catch((err) => console.log("Erreur de connexion à MongoDB", err));

app.post("/tasks", async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
    });
    const savedTask = await task.save();
    res.status(200).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Bienvenue");
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le: ${PORT}`);
});
