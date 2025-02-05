const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie"))
  .catch((err) => console.log("Erreur de connexion à MongoDB", err));

const PORT = 8000;

app.get("/", (req, res) => {
  res.send("Bienvenue");
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le: ${PORT}`);
});
