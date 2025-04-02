# Mathis MICHENAUD -  ESGI 2025

# NodeJS et mongoDB
Cours de nodeJS et mongoDB, par Nicolas Hersant - Galactic Robots, pour ESGI.


## Pré-requis
[Installation de mongoDB community](https://www.mongodb.com/docs/manual/installation/)  
[Installation de node avec NVM](https://nodejs.org/en/download)


## Initialisation
***
```sh
npm init
npm install -g nodemon
```

## Lancement du projet

Avant de lancer le projet, il faut dconfigurer les variables d'environnement.
Prendre l'exemple du `.env.example` en créant un `.env` qui sera disponible localement sur votre poste.

Dans le dossier projet_mongo effectuer la commande suivante
***
```sh
npm run dev
```

L'api sera disponible à l'adresse : `http://localhost:3000`.

Pour accéder à la documentation, se rendre sur `http://localhost:3000/api-docs/#/`.