const User = require("./model/user.model");

// Configurer la documentation Swagger avec swagger-jsdoc
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Node.js',
            version: '1.0.0',
            description: 'Documentation de l\'API pour le projet Node.js avec MongoDB',
        },
        components: {
            schemas: {
                Potion: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Potion d\'invisibilité',
                        },
                        price: {
                            type: 'number',
                            example: 15.87,
                        },
                        score: {
                            type: 'number',
                            example: 5,
                        },
                        ingredients: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: ['Eau', 'Sel'],
                        },
                        ratings: {
                            type: 'object',
                            properties: {
                                strength: {
                                    type: 'number',
                                    example: 2,
                                },
                                flavor: {
                                    type: 'number',
                                    example: 4,
                                },
                            },
                        },
                        tryDate: {
                            type: 'Date',
                            format: 'date-time',
                            example: '2023-10-01T00:00:00Z',
                        },
                        categories: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: ['fairy', 'budget'],
                        },
                        vendor_id: {
                            type: 'string',
                            example: '660dg5298894dvb561dh6d1',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        password: {
                            type: 'string',
                            example: 'pwd123',
                        },
                    },
                },
            },
        },
    },
    apis: ['./routers/*.js'],  // Indique où se trouvent tes fichiers de route

};

module.exports = options;