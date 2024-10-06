const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour récupérer la liste des utilisateurs (Admin uniquement)
router.get('/users', authMiddleware, (req, res) => {
  // Vérifier si l'utilisateur est un administrateur
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  // Requête pour récupérer tous les utilisateurs
  const query = `SELECT id, nom, prenom, email, type, derniere_connexion active FROM users`;
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }

    res.json(results);
  });
});

// Route pour désactiver un utilisateur (Admin uniquement)
router.post('/deactivate', authMiddleware, (req, res) => {
  const { userId } = req.body;

  // Vérifier si l'utilisateur est un administrateur
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  // Requête pour désactiver un utilisateur par ID
  const query = `UPDATE users SET active = FALSE WHERE id = ?`;
  db.execute(query, [userId], (err, results) => {
    if (err || results.affectedRows === 0) {
      return res.status(500).json({ message: 'Erreur lors de la désactivation.' });
    }
    res.json({ message: 'Utilisateur désactivé avec succès.' });
  });
});

// Route pour supprimer un utilisateur (Admin uniquement)
router.delete('/delete/:id', authMiddleware, (req, res) => {
  const userId = req.params.id;

  // Vérifier si l'utilisateur est un administrateur
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  // Requête pour supprimer un utilisateur par ID
  const query = `DELETE FROM users WHERE id = ?`;
  db.execute(query, [userId], (err, results) => {
    if (err || results.affectedRows === 0) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur.' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  });
});

// Route pour activer un utilisateur (Admin uniquement)
router.post('/activate', authMiddleware, (req, res) => {
  const { userId } = req.body;

  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  const query = `UPDATE users SET active = TRUE WHERE id = ?`;
  db.execute(query, [userId], (err, results) => {
    if (err || results.affectedRows === 0) {
      return res.status(500).json({ message: 'Erreur lors de l’activation.' });
    }
    res.json({ message: 'Utilisateur activé avec succès.' });
  });
});

module.exports = router;
