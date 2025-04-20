FROM node:18-alpine3.18

# Définition du dossier de travail
WORKDIR /opt/app

# Copier les fichiers de dépendances en premier pour optimiser le cache
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port de Vite (React)
EXPOSE 5173

# Commande pour lancer le projet en mode développement
CMD ["yarn", "dev"]
