const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-reservation', authMiddleware, async (req, res) => {
    if (req.user.type !== 'client') {
        return res.status(403).json({ message: 'Seuls les clients peuvent créer des réservations.' });
    }

    const {
        taxi_id,
        proprietaire_id,
        userLocation,
        destination,
        distance,
        travelTime,  
        departureTime,
        arrivalTime,
        travelCost,  
        weather
    } = req.body;

    // Validation des champs requis
    const requiredFields = ['taxi_id', 'proprietaire_id', 'userLocation', 'destination', 'distance', 'travelTime', 'departureTime', 'arrivalTime', 'travelCost'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.', required: requiredFields });
        }
    }

    try {
        // Vérifier la disponibilité du taxi pour cette période
        const availabilityResults = await db.execute(`
            SELECT id FROM reservations 
            WHERE taxi_id = ? 
            AND ((departure_time BETWEEN ? AND ?) 
            OR (arrival_time BETWEEN ? AND ?))`,
            [taxi_id, departureTime, arrivalTime, departureTime, arrivalTime]
        );

        if (availabilityResults.length > 0) {
            return res.status(400).json({ message: 'Le taxi est déjà réservé pour cette période.' });
        }

        const reservationValues = [
            req.user.id,
            taxi_id,
            proprietaire_id,
            userLocation,
            destination,
            distance,
            travelTime,
            departureTime,
            arrivalTime,
            travelCost,
            JSON.stringify(weather)
        ];

        const results = await db.execute(`
            INSERT INTO reservations (
                user_id,
                taxi_id,
                proprietaire_id,
                user_location,
                destination,
                distance,
                travel_time,
                departure_time,
                arrival_time,
                travel_cost,
                weather,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, reservationValues
        );

        res.status(201).json({
            message: 'Réservation créée avec succès.',
            reservationId: results.insertId,
            details: {
                travelTime: `${travelTime} minutes`,
                travelCost: `${travelCost} €`
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la réservation.', error: error.message });
    }
});

router.get('/get-reservations', authMiddleware, async (req, res) => {
    try {
        // Check if the user is a client
        if (req.user.type !== 'client') {
            return res.status(403).json({ message: 'Seuls les clients peuvent consulter leurs réservations.' });
        }

        // Query to get reservations for the connected client
        const getReservationsQuery = `
            SELECT 
                r.id AS reservationId,
                r.taxi_id AS taxiId,
                r.user_location AS userLocation,
                r.destination,
                r.distance,
                r.travel_time AS travelTime,
                r.departure_time AS departureTime,
                r.arrival_time AS arrivalTime,
                r.travel_cost AS travelCost,
                r.weather,
                r.created_at AS createdAt
            FROM 
                reservations r
            WHERE 
                r.user_id = ?
            ORDER BY 
                r.created_at DESC`;

        // Execute the query
        db.execute(getReservationsQuery, [req.user.id], (err, reservations) => {
            if (err) {
                console.error('Erreur lors de la récupération des réservations:', err);
                return res.status(500).json({ 
                    message: 'Erreur lors de la récupération des réservations.',
                    error: err.message 
                });
            }

            // Check if there are no reservations
            if (reservations.length === 0) {
                return res.status(404).json({ message: 'Aucune réservation trouvée pour cet utilisateur.' });
            }

            // Return the list of reservations
            res.status(200).json({
                message: 'Réservations récupérées avec succès.',
                reservations: reservations.map((reservation) => ({
                    reservationId: reservation.reservationId,
                    taxiId: reservation.taxiId,
                    userLocation: reservation.userLocation,
                    destination: reservation.destination,
                    distance: reservation.distance,
                    travelTime: `${reservation.travelTime} minutes`,
                    departureTime: reservation.departureTime,
                    arrivalTime: reservation.arrivalTime,
                    travelCost: `${reservation.travelCost} €`,
                    weather: JSON.parse(reservation.weather), // Parse JSON weather data if stored as JSON string
                    createdAt: reservation.createdAt
                }))
            });
        });
    } catch (error) {
        console.error('Erreur générale:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la récupération des réservations.',
            error: error.message 
        });
    }
});
router.get('/get-reservations-by-taxi/:taxi_id', authMiddleware, async (req, res) => {
    try {
        // Check if the user is a client
        if (req.user.type !== 'proprietaire') {
            return res.status(403).json({ message: 'Seuls les clients peuvent consulter les réservations par taxi.' });
        }

        const taxiId = req.params.taxi_id;

        // Query to get reservations for the specified taxi_id
        const getReservationsByTaxiQuery = `
            SELECT 
                r.id AS reservationId,
                r.user_id AS userId,
                r.user_location AS userLocation,
                r.destination,
                r.distance,
                r.travel_time AS travelTime,
                r.departure_time AS departureTime,
                r.arrival_time AS arrivalTime,
                r.travel_cost AS travelCost,
                r.weather,
                r.created_at AS createdAt
            FROM 
                reservations r
            WHERE 
                r.taxi_id = ?
            ORDER BY 
                r.created_at DESC`;

        // Execute the query
        db.execute(getReservationsByTaxiQuery, [taxiId], (err, reservations) => {
            if (err) {
                console.error('Erreur lors de la récupération des réservations par taxi:', err);
                return res.status(500).json({ 
                    message: 'Erreur lors de la récupération des réservations par taxi.',
                    error: err.message 
                });
            }

            if (reservations.length === 0) {
                return res.status(404).json({ message: 'Aucune réservation trouvée pour ce taxi.' });
            }

            // Return the list of reservations
            res.status(200).json({
                message: 'Réservations pour le taxi récupérées avec succès.',
                reservations: reservations.map((reservation) => ({
                    reservationId: reservation.reservationId,
                    userId: reservation.userId,
                    userLocation: reservation.userLocation,
                    destination: reservation.destination,
                    distance: reservation.distance,
                    travelTime: `${reservation.travelTime} minutes`,
                    departureTime: reservation.departureTime,
                    arrivalTime: reservation.arrivalTime,
                    travelCost: `${reservation.travelCost} €`,
                    weather: JSON.parse(reservation.weather),
                    createdAt: reservation.createdAt
                }))
            });
        });
    } catch (error) {
        console.error('Erreur générale:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la récupération des réservations par taxi.',
            error: error.message 
        });
    }
});
// Ajouter cette route dans votre fichier router (par exemple: reservations.js)

router.get('/get-all-reservations', authMiddleware, async (req, res) => {
    try {
        // Check if user is an admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Only administrators can view all reservations.' });
        }

        // Query to get all reservations
        const getAllReservationsQuery = `
            SELECT 
                r.id AS reservationId,
                r.user_id AS userId,
                r.taxi_id AS taxiId,
                r.user_location AS userLocation,
                r.destination,
                r.distance,
                r.travel_time AS travelTime,
                r.departure_time AS departureTime,
                r.arrival_time AS arrivalTime,
                r.travel_cost AS travelCost,
                r.weather,
                r.created_at AS createdAt
            FROM 
                reservations r
            ORDER BY 
                r.created_at DESC`;

        // Execute the query
        db.execute(getAllReservationsQuery, [], (err, reservations) => {
            if (err) {
                console.error('Error fetching all reservations:', err);
                return res.status(500).json({ 
                    message: 'Error fetching all reservations.',
                    error: err.message 
                });
            }

            // Check if reservations are found
            if (reservations.length === 0) {
                return res.status(404).json({ message: 'No reservations found.' });
            }

            // Return the list of reservations
            res.status(200).json({
                message: 'Successfully retrieved all reservations.',
                reservations: reservations.map((reservation) => ({
                    reservationId: reservation.reservationId,
                    userId: reservation.userId,
                    taxiId: reservation.taxiId,
                    userLocation: reservation.userLocation,
                    destination: reservation.destination,
                    distance: reservation.distance,
                    travelTime: `${reservation.travelTime} minutes`,
                    departureTime: reservation.departureTime,
                    arrivalTime: reservation.arrivalTime,
                    travelCost: `${reservation.travelCost} €`,
                    weather: reservation.weather ? JSON.parse(reservation.weather) : null, // Parse JSON if present
                    createdAt: reservation.createdAt
                }))
            });
        });
    } catch (error) {
        console.error('General error:', error);
        res.status(500).json({ 
            message: 'An error occurred while retrieving reservations.', 
            error: error.message 
        });
    }
});

router.post('/check-taxi-availability', authMiddleware, async (req, res) => {
    const { taxi_id, departureTime, arrivalTime } = req.body;

    if (!taxi_id || !departureTime || !arrivalTime) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    try {
        const availabilityResults = await db.execute(`
            SELECT id FROM reservations 
            WHERE taxi_id = ? 
            AND ((departure_time BETWEEN ? AND ?) 
            OR (arrival_time BETWEEN ? AND ?))`,
            [taxi_id, departureTime, arrivalTime, departureTime, arrivalTime]
        );

        if (availabilityResults.length > 0) {
            return res.status(200).json({ available: false });
        } else {
            return res.status(200).json({ available: true });
        }
    } catch (error) {
        console.error('Error checking taxi availability:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});


module.exports = router;
