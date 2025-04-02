const express = require('express');
const router = express.Router();
const Potion = require('../model/potion.model');
const authMiddleware = require('../middlewares/auth.middleware');


// GET /names : récupérer uniquement les noms de toutes les potions
/**
 * @swagger
 * /names:
 *   get:
 *     summary: Permet de récupérer la liste des noms des potions
 *     description: Renvoie un tableau contenant les noms des potions.
 *     responses:
 *       200:
 *         description: Liste des noms des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/names', async (req, res) => {
    try {
        const names = await Potion.find({}, 'name'); // On ne sélectionne que le champ 'name'
        res.json(names.map(p => p.name)); // renvoyer juste un tableau de strings
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Créer une nouvelle potion
 *     tags:
 *       - Potions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Potion'
 *     responses:
 *       201:
 *         description: Potion créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 *       400:
 *         description: Erreur sur les données
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newPotion = new Potion(req.body);
        const savedPotion = await newPotion.save();
        res.status(201).json(savedPotion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupère les potions dans une fourchette de prix donnée
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         required: false
 *         description: Prix minimum des potions (par défaut 0)
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         required: false
 *         description: Prix maximum des potions (par défaut 999999999)
 *     responses:
 *       200:
 *         description: Liste des potions filtrées par prix
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 *       400:
 *         description: Erreur de validation des paramètres
 *       500:
 *         description: Erreur du serveur
 */
router.get('/price-range', async (req, res) => {
    try {
        const minPrice = parseFloat(req.query.min) || 0;
        const maxPrice = parseFloat(req.query.max) || 999999999;

        if (isNaN(minPrice) || isNaN(maxPrice)) {
            return res.status(400).json({ error: "Les valeurs min et max doivent être des nombres." });
        }
        const potions = await Potion.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupère le nom d'une potion par son ID
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID unique de la potion à récupérer
 *     responses:
 *       200:
 *         description: Nom de la potion
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Potion d'Invisibilité"
 *       404:
 *         description: Potion non trouvée
 *       500:
 *         description: Erreur du serveur
 */
router.get('/:id', async (req, res) => {
    try {
        const potion = await Potion.findById(req.params.id);
        if (!potion) {
            return res.status(404).json({ error: 'Potion not found' });
        }
        res.json(potion.name);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupère une potion par son ID
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la potion à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Potion trouvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Potion de soin"
 *       404:
 *         description: Potion non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Potion not found"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur de base de données"
 */
router.put('/:id', async (req, res) => {
    try {

        const updatedPotion = await Potion.findByIdAndUpdate(
            req.params.id,
            req.body,          // Nouvelles données 
            { new: true, runValidators: true } // Retourne la potion mise à jour et applique les validations, 
            // sinon cela retourne par défaut l'objet d'avant
        );

        if (!updatedPotion) {
            return res.status(404).json({ error: "Potion non trouvée" });
        }

        res.json(updatedPotion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     summary: Supprime une potion par son ID
 *     tags:
 *       - Potions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la potion à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Potion supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60b8d8a7f6b2b0c8b2c2a3f6"
 *                 name:
 *                   type: string
 *                   example: "Potion de soin"
 *                 price:
 *                   type: number
 *                   example: 100
 *       404:
 *         description: Potion non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Potion non trouvée"
 *       400:
 *         description: Erreur de requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur dans la suppression de la potion"
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedPotion = await Potion.findByIdAndDelete(req.params.id);

        if (!deletedPotion) {
            return res.status(404).json({ error: "Potion non trouvée" });
        }

        res.json(deletedPotion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});





router.get('/vendor/:vendor_id', async (req, res) => {
    try {

        const potionsByVendors = await Potion.find({ vendor_id: req.params.vendor_id });

        if (!potionsByVendors) {
            return res.status(404).json({ error: "Potions non trouvée pour le vendeur" });
        }

        res.json(potionsByVendors);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});






module.exports = router;