const express = require('express');
const cors = require('cors'); // Ajout de CORS
const app = express();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

// Utiliser CORS pour autoriser les requêtes provenant de différentes origines
app.use(cors({
    origin: 'http://localhost:4200' // Remplacez par l'URL de votre frontend
  })); // Autorise toutes les origines
app.use(express.json()); // Pour analyser le corps des requêtes JSON

// Utiliser les routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
