const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vagues de Riffs API',
            version: '1.0.0',
            description: 'Documentation de l API backend du projet Vagues de Riffs'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Serveur local'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Authentification et session utilisateur' },
            { name: 'Concerts', description: 'Gestion des concerts' },
            { name: 'Content', description: 'Contenu du site et portfolio' },
            { name: 'Contact', description: 'Formulaire de contact et messages' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'admin@vaguesderiffs.fr' },
                        password: { type: 'string', example: 'admin123' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'email', 'username', 'password', 'birthDate', 'terms'],
                    properties: {
                        firstName: { type: 'string', example: 'Ahmed' },
                        lastName: { type: 'string', example: 'Diallo' },
                        email: { type: 'string', example: 'ahmed@email.com' },
                        username: { type: 'string', example: 'ahmedrock' },
                        password: { type: 'string', example: 'Azerty123' },
                        birthDate: { type: 'string', example: '2000-01-15' },
                        newsletter: { type: 'string', example: 'true' },
                        terms: { type: 'string', example: 'true' }
                    }
                },
                Venue: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Olympia' },
                        address: { type: 'string', example: '28 Boulevard des Capucines' },
                        city: { type: 'string', example: 'Paris' },
                        capacity: { type: 'integer', example: 2000 }
                    }
                },
                Price: {
                    type: 'object',
                    properties: {
                        min: { type: 'number', example: 29.99 },
                        max: { type: 'number', example: 59.99 },
                        currency: { type: 'string', example: 'EUR' }
                    }
                },
                ConcertRequest: {
                    type: 'object',
                    required: ['title', 'venue', 'date', 'time'],
                    properties: {
                        title: { type: 'string', example: 'Olympia - Paris' },
                        venue: { $ref: '#/components/schemas/Venue' },
                        date: { type: 'string', example: '2026-06-25' },
                        time: { type: 'string', example: '20:00' },
                        price: { $ref: '#/components/schemas/Price' },
                        description: { type: 'string', example: 'Concert exceptionnel à Paris.' },
                        status: { type: 'string', example: 'upcoming' },
                        ticketUrl: { type: 'string', example: 'https://example.com/tickets' },
                        infoUrl: { type: 'string', example: 'https://example.com/info' },
                        image: { type: 'string', example: 'https://example.com/concert.jpg' },
                        isFeatured: { type: 'boolean', example: true }
                    }
                },
                ContactRequest: {
                    type: 'object',
                    required: ['name', 'email', 'subject', 'message'],
                    properties: {
                        name: { type: 'string', example: 'Jean Dupont' },
                        email: { type: 'string', example: 'jean@email.com' },
                        subject: { type: 'string', example: 'Demande de booking' },
                        message: { type: 'string', example: 'Bonjour, je souhaite vous contacter pour un concert.' }
                    }
                },
                PortfolioRequest: {
                    type: 'object',
                    required: ['title', 'description', 'category', 'image'],
                    properties: {
                        title: { type: 'string', example: 'Session Studio' },
                        description: { type: 'string', example: 'Enregistrement et mixage en studio' },
                        category: { type: 'string', example: 'studio' },
                        image: { type: 'string', example: 'https://picsum.photos/seed/studio1/400/300.jpg' }
                    }
                }
            }
        },
        paths: {
            '/api/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Inscription d un nouvel utilisateur',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RegisterRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Utilisateur créé' },
                        400: { description: 'Erreur de validation' }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Connexion utilisateur',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Connexion réussie' },
                        401: { description: 'Identifiants invalides' }
                    }
                }
            },
            '/api/auth/me': {
                get: {
                    tags: ['Auth'],
                    summary: 'Profil de l utilisateur connecté',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Profil récupéré' },
                        401: { description: 'Token manquant ou invalide' }
                    }
                }
            },
            '/api/concerts': {
                get: {
                    tags: ['Concerts'],
                    summary: 'Liste des concerts',
                    parameters: [
                        { in: 'query', name: 'page', schema: { type: 'integer' } },
                        { in: 'query', name: 'limit', schema: { type: 'integer' } },
                        { in: 'query', name: 'status', schema: { type: 'string' } },
                        { in: 'query', name: 'city', schema: { type: 'string' } },
                        { in: 'query', name: 'upcoming', schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Concerts récupérés' }
                    }
                },
                post: {
                    tags: ['Concerts'],
                    summary: 'Créer un concert',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ConcertRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Concert créé' },
                        400: { description: 'Erreur de validation' },
                        401: { description: 'Accès refusé' }
                    }
                }
            },
            '/api/concerts/{id}': {
                get: {
                    tags: ['Concerts'],
                    summary: 'Détail d un concert',
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    responses: {
                        200: { description: 'Concert trouvé' },
                        404: { description: 'Concert non trouvé' }
                    }
                },
                put: {
                    tags: ['Concerts'],
                    summary: 'Modifier un concert',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ConcertRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Concert mis à jour' }
                    }
                },
                delete: {
                    tags: ['Concerts'],
                    summary: 'Supprimer un concert',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    responses: {
                        200: { description: 'Concert supprimé' }
                    }
                }
            },
            '/api/concerts/featured/list': {
                get: {
                    tags: ['Concerts'],
                    summary: 'Concerts mis en avant',
                    responses: {
                        200: { description: 'Liste récupérée' }
                    }
                }
            },
            '/api/concerts/cities/list': {
                get: {
                    tags: ['Concerts'],
                    summary: 'Villes disponibles pour les concerts',
                    responses: {
                        200: { description: 'Liste des villes récupérée' }
                    }
                }
            },
            '/api/content/portfolio': {
                get: {
                    tags: ['Content'],
                    summary: 'Liste du portfolio',
                    parameters: [
                        { in: 'query', name: 'category', schema: { type: 'string' } },
                        { in: 'query', name: 'featured', schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Portfolio récupéré' }
                    }
                },
                post: {
                    tags: ['Content'],
                    summary: 'Créer un élément du portfolio',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PortfolioRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Élément créé' }
                    }
                }
            },
            '/api/content/portfolio/{id}': {
                get: {
                    tags: ['Content'],
                    summary: 'Détail d un élément du portfolio',
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    responses: {
                        200: { description: 'Élément trouvé' },
                        404: { description: 'Élément non trouvé' }
                    }
                },
                put: {
                    tags: ['Content'],
                    summary: 'Modifier un élément du portfolio',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PortfolioRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Élément mis à jour' }
                    }
                },
                delete: {
                    tags: ['Content'],
                    summary: 'Supprimer un élément du portfolio',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    responses: {
                        200: { description: 'Élément supprimé' }
                    }
                }
            },
            '/api/content/band': {
                get: {
                    tags: ['Content'],
                    summary: 'Informations générales du groupe',
                    responses: {
                        200: { description: 'Informations récupérées' }
                    }
                }
            },
            '/api/content/band/members': {
                get: {
                    tags: ['Content'],
                    summary: 'Membres du groupe',
                    responses: {
                        200: { description: 'Membres récupérés' }
                    }
                }
            },
            '/api/content/band/discography': {
                get: {
                    tags: ['Content'],
                    summary: 'Discographie du groupe',
                    responses: {
                        200: { description: 'Discographie récupérée' }
                    }
                }
            },
            '/api/contact/contact': {
                post: {
                    tags: ['Contact'],
                    summary: 'Envoyer un message de contact',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ContactRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Message envoyé' },
                        400: { description: 'Erreur de validation' }
                    }
                }
            },
            '/api/contact/messages': {
                get: {
                    tags: ['Contact'],
                    summary: 'Liste des messages de contact',
                    responses: {
                        200: { description: 'Messages récupérés' }
                    }
                }
            },
            '/api/contact/messages/{id}/status': {
                patch: {
                    tags: ['Contact'],
                    summary: 'Changer le statut d un message',
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'read' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Statut mis à jour' }
                    }
                }
            }
        }
    },
    apis: []
};

module.exports = swaggerJsdoc(options);
