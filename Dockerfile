# Utilisation de l'image officielle de Node.js
FROM node:14

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers de l'application
COPY . .

# Expose le port 3000 de l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "app.js"]
