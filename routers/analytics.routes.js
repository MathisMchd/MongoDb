const express = require('express');
const router = express.Router();
const Potion = require('../model/potion.model');


// GET /analytics/distinct-categories aggregat du nombre total de catégories différentes
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


// GET /analytics/average-score-by-vendor aggregat du score moyen des vendeurs
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


// GET /analytics/average-score-by-category aggregat du score moyen des categories
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


// GET /analytics/strength-flavor-ratio ratio entre force et parfum des potions
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


// GET /analytics/search fonction de recherche avec 3 paramètres :
// grouper par vendeur ou catégorie, metrique au choix (avg, sum, count), champ au choix (score, price, ratings).

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