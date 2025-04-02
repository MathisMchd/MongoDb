require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const sanitize = require('sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = require('./swagger');
const routesPotions = require('./routers/potions.routes');
const routesAnalytics = require('./routers/analytics.routes');
const routesAuth = require('./routers/auth.routes');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cors())
app.use(cookieParser());
app.use(sanitize.middleware);


// Utilitaire d'accès à la base de données MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));



// Défini la base pour la route on aura donc http://localhost:3000/potions/XXXXXX
app.use('/potions', routesPotions);
app.use('/analytics', routesAnalytics);
app.use('/auth', routesAuth);


// Créer le SwaggerSpec à partir de la configuration
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Utiliser Swagger-UI pour afficher la documentation dans le navigateur
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});







/*
// renvoi un port valide
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// gestion des retours d'erreurs
const errorHandler = error => {
    if (error.syscall !== 'listen') throw error;

    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

    if (error.code === 'EACCES') {
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
    }

    if (error.code === 'EADDRINUSE') {
        console.error(bind + ' is already in use.');
        process.exit(1);
    }

    throw error;
};

const server = http.createServer(app);
server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);
*/