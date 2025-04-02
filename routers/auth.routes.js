const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Le nom de l'utilisateur
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé"
 *       400:
 *         description: Erreur de validation des champs (nom ou mot de passe incorrects)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Le nom d’utilisateur est requis."
 *                       param:
 *                         type: string
 *                         example: "User123"
 *       500:
 *         description: Erreur système, notamment si le nom d'utilisateur existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur système"
 */
router.post('/register', [
    body('username').trim().escape()
        .notEmpty().withMessage('Le nom d’utilisateur est requis.')
        .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
        .notEmpty().withMessage('Le mot de passe est requis.')
        .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;

    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'Utilisateur créé' });
    } catch (err) {
        if (err.code === 11000) return res.status(500).json({ error: 'Erreur système' });
        res.status(400).json({ error: err.message });
    }
});



/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Le nom d'utilisateur pour la connexion
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur pour la connexion
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connecté avec succès"
 *       400:
 *         description: Erreur de validation des champs (nom ou mot de passe incorrects)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Le nom d’utilisateur est requis."
 *                       param:
 *                         type: string
 *                         example: "Jean"
 *       401:
 *         description: Identifiants invalides (nom d'utilisateur ou mot de passe incorrect)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Identifiants invalides"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur système"
 */
router.post('/login', [
    body('username').trim().escape()
        .notEmpty().withMessage('Le nom d’utilisateur est requis.')
        .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
        .notEmpty().withMessage('Le mot de passe est requis.')
        .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
], async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign({ id: user._id, username: username }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false, // à mettre sur true en prod (https)
        maxAge: 24 * 60 * 60 * 1000 // durée de vie 24h
    });

    res.json({ message: 'Connecté avec succès' });
});


/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Déconnecte un utilisateur
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Utilisateur déconnecté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnecté"
 *       500:
 *         description: Erreur interne du serveur lors de la déconnexion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur système"
 */
router.get('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Déconnecté' });
});



module.exports = router;