const express = require('express');
const router = express.Router();
const Potion = require('../model/potion.model');


/**
 * @swagger
 * /analytics/distinct-categories:
 *   get:
 *     summary: Récupère le nombre total de catégories distinctes
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Résultat du nombre total de catégories distinctes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoryCounter:
 *                   type: integer
 *                   description: Nombre total de catégories distinctes
 *                   example: 5
 *       400:
 *         description: Erreur lors de la récupération des catégories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de l'agrégation des catégories"
 */
router.get('/distinct-categories', async (req, res) => {
    try {

        const categoryCounter = await Potion.aggregate([
            { $unwind: "$categories" },
            { $group: { _id: "$categories" } },
            { $count: "totalCategories" }
        ]);

        res.json(categoryCounter.length > 0 ? categoryCounter[0] : { categoryCounter: 0 });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * @swagger
 * /analytics/average-score-by-vendor:
 *   get:
 *     summary: Calcule la moyenne des scores des potions par vendeur
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Résultat de la moyenne des scores par vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: L'ID du vendeur
 *                     example: "vendor123"
 *                   scoreMoyen:
 *                     type: number
 *                     description: Score moyen du vendeur
 *                     example: 4.2
 *       404:
 *         description: Aucun vendeur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucun vendeur trouvé"
 *       400:
 *         description: Erreur dans la requête ou agrégation invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur de base de données"
 */
router.get('/average-score-by-vendor', async (req, res) => {
    try {

        const scoreByVendors = await Potion.aggregate([
            {
                $group: { _id: "$vendor_id", scoreMoyen: { $avg: "$score" } }
            },
        ]);

        if (scoreByVendors.length === 0) {
            return res.status(404).json({ error: 'No vendors found' });
        }

        res.json(scoreByVendors);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * @swagger
 * /analytics/average-score-by-category:
 *   get:
 *     summary: Calcule la moyenne des scores des potions par catégorie
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Résultat de la moyenne des scores par catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Nom de la catégorie
 *                     example: "Potion de soin"
 *                   scoreMoyen:
 *                     type: number
 *                     description: Score moyen de la catégorie
 *                     example: 4.5
 *       404:
 *         description: Aucune catégorie trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucune catégorie trouvée"
 *       400:
 *         description: Erreur dans la requête ou agrégation invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur de base de données"
 */
router.get('/average-score-by-category', async (req, res) => {
    try {

        const scoreByCategory = await Potion.aggregate([
            {
                $unwind: "$categories"
            },
            {
                $group: { _id: "$categories", scoreMoyen: { $avg: "$score" } }
            },
        ]);

        if (scoreByCategory.length === 0) {
            return res.status(404).json({ error: 'No vendors found' });
        }

        res.json(scoreByCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * @swagger
 * /analytics/strength-flavor-ratio:
 *   get:
 *     summary: Calcule le ratio de force sur saveur des potions
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Résultat du ratio force/saveur des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratio:
 *                   type: number
 *                   description: Ratio total de la force sur la saveur
 *                   example: 1.2
 *                 totalStrength:
 *                   type: number
 *                   description: Somme totale des forces des potions
 *                   example: 120
 *                 totalFlavor:
 *                   type: number
 *                   description: Somme totale des saveurs des potions
 *                   example: 100
 *                 count:
 *                   type: integer
 *                   description: Nombre total de potions prises en compte
 *                   example: 10
 *       400:
 *         description: Erreur dans la requête ou agrégation invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors du calcul du ratio"
 */
router.get('/strength-flavor-ratio', async (req, res) => {
    try {
        const strengthFlavorRatio = await Potion.aggregate([
            {
                $project: {
                    strength: "$ratings.strength",
                    flavor: "$ratings.flavor"
                }
            },
            {
                $group: {
                    _id: null,
                    totalStrength: { $sum: "$strength" },
                    totalFlavor: { $sum: "$flavor" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    ratio: { $divide: ["$totalStrength", "$totalFlavor"] }, // Ratio
                    totalStrength: 1,
                    totalFlavor: 1,
                    count: 1
                }
            }
        ]);

        if (strengthFlavorRatio.length === 0) {
            return res.json({ ratio: 0, totalStrength: 0, totalFlavor: 0, count: 0 });
        }

        res.json(strengthFlavorRatio[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Recherche et agrégation des potions en fonction de critères spécifiques
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         required: true
 *         description: "Champ utilisé pour regrouper les données (ex: vendor_id, categories)"
 *         schema:
 *           type: string
 *           enum: [vendor_id, categories]
 *       - in: query
 *         name: metric
 *         required: true
 *         description: "Métrique d'agrégation à appliquer (ex: avg, sum, count)"
 *         schema:
 *           type: string
 *           enum: [avg, sum, count]
 *       - in: query
 *         name: field
 *         required: true
 *         description: "Champ sur lequel appliquer la métrique (ex: score, price, ratings)"
 *         schema:
 *           type: string
 *           enum: [score, price, ratings]
 *     responses:
 *       200:
 *         description: Résultat de l'agrégation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Valeur du champ groupé
 *                     example: "vendor123"
 *                   metric:
 *                     type: number
 *                     description: Résultat de l'agrégation
 *                     example: 4.5
 *       400:
 *         description: Paramètre invalide dans la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Paramètre 'groupBy' invalide"
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
router.get('/search', async (req, res) => {
    try {
        // Récupérer les paramètres de la requête
        const { groupBy, metric, field } = req.query;

        // Vérifier que les paramètres sont valides
        const validGroupBy = ["vendor_id", "categories"];
        const validMetrics = ["avg", "sum", "count"];
        const validFields = ["score", "price", "ratings"];

        if (!validGroupBy.includes(groupBy)) {
            return res.status(400).json({ error: "Paramètre 'groupBy' invalide" });
        }
        if (!validMetrics.includes(metric)) {
            return res.status(400).json({ error: "Paramètre 'metric' invalide" });
        }
        if (!validFields.includes(field)) {
            return res.status(400).json({ error: "Paramètre 'field' invalide" });
        }

        const aggregationRequest = [
            { $unwind: `$${groupBy}` }, // Dans le cas ou c'est des catégories, on unwind
            {
                $group: {                                                   // Regroupe et applique la métrique sur le champ
                    _id: `$${groupBy}`,
                    [metric]: { [`$${metric}`]: `$${field}` }
                }
            }
        ];

        const result = await Potion.aggregate(aggregationRequest);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;