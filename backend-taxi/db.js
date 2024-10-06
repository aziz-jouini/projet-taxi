const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(async (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the MySQL database');

    // Insérer un administrateur par défaut s'il n'existe pas
    try {
      const email = 'ajouini060@gmail.com';
      const nom = 'Jouini';
      const prenom = 'Aziz';
      const mot_de_passe = '123456';
      const type = 'admin';

      // Vérifier si l'administrateur existe déjà
      const checkQuery = `SELECT * FROM users WHERE email = ?`;
      db.query(checkQuery, [email], async (error, results) => {
        if (error) {
          console.error('Erreur lors de la vérification de l\'administrateur: ', error);
        } else if (results.length === 0) {
          // L'administrateur n'existe pas, l'insérer
          const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
          const insertQuery = `
            INSERT INTO users (nom, prenom, email, mot_de_passe, type, active) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          db.query(insertQuery, [nom, prenom, email, hashedPassword, type, true], (insertError, insertResults) => {
            if (insertError) {
              console.error('Erreur lors de l\'insertion de l\'administrateur: ', insertError);
            } else {
              console.log('Administrateur par défaut inséré avec succès');
            }
          });
        } else {
          console.log('Administrateur par défaut déjà présent');
        }
      });
    } catch (err) {
      console.error('Erreur lors de l\'insertion de l\'administrateur par défaut: ', err);
    }
  }
});

module.exports = db;
