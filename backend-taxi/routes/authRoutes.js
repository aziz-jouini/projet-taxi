const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

const client = new OAuth2Client('55995467395-tg1hap97hsd98v35nb2t054cd4aseju6.apps.googleusercontent.com');

// Route pour inscription
router.post('/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe, type } = req.body;

  if (!nom || !prenom || !email || !mot_de_passe || !type) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
   
  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const query = `INSERT INTO users (nom, prenom, email, mot_de_passe, type) VALUES (?, ?, ?, ?, ?)`;
    db.execute(query, [nom, prenom, email, hashedPassword, type], (err, results) => {
      if (err) {
        console.error('Erreur lors de l’inscription:', err); // Ajout de logging
        return res.status(500).json({ message: 'Erreur lors de l’inscription.' });
      }
      res.status(201).json({ message: 'Inscription réussie. En attente d’activation par un administrateur.' });
    });
  } catch (err) {
    console.error('Erreur serveur:', err); // Ajout de logging
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Route pour connexion classique
// Route pour connexion classique
router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.execute(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    const user = results[0];
    if (!user.active) {
      return res.status(403).json({ message: 'Compte en attente d’activation.' });
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Mettre à jour la dernière connexion
    const updateQuery = `UPDATE users SET derniere_connexion = NOW() WHERE id = ?`;
    db.execute(updateQuery, [user.id], (updateErr, updateResults) => {
      if (updateErr) {
        console.error('Erreur lors de la mise à jour de la dernière connexion:', updateErr);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour de la dernière connexion.' });
      }

      res.json({ message: 'Connexion réussie', token });
    });
  });
});


// Route pour vérifier l'utilisateur Google
router.post('/verify-google-user', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '55995467395-tg1hap97hsd98v35nb2t054cd4aseju6.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    // Vérifier si l'utilisateur existe dans la base de données
    const query = `SELECT * FROM users WHERE email = ?`;
    db.execute(query, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération des informations.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const user = results[0];
      res.json({ userType: user.type });
    });
  } catch (error) {
    res.status(401).json({ message: 'Token Google invalide.' });
  }
});
router.get('/me', authMiddleware, (req, res) => {
  const query = `SELECT id, nom, prenom, email, type, derniere_connexion FROM users WHERE id = ?`;
  db.execute(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur connecté:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const user = results[0];
    res.json(user);
  });
});
// Route pour mettre à jour les informations de l'utilisateur
router.put('/update', authMiddleware, async (req, res) => {
  const   = req.body;
  
  if (!nom || !prenom || !email || !type) {
    return res.status(400).json({ message: 'Tous les champs sauf le mot de passe sont requis.' });
  }

  try {
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté

    // Hachage du nouveau mot de passe si fourni
    let hashedPassword;
    if (mot_de_passe) {
      hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    }

    // Construire la requête SQL de mise à jour
    const query = `UPDATE users SET nom = ?, prenom = ?, email = ?, type = ?${mot_de_passe ? ', mot_de_passe = ?' : ''} WHERE id = ?`;

    const params = mot_de_passe ? [nom, prenom, email, type, hashedPassword, userId] : [nom, prenom, email, type, userId];

    db.execute(query, params, (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour des informations.' });
      }
      res.json({ message: 'Informations utilisateur mises à jour avec succès.' });
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;