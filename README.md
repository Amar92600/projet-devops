## Projet DEVOPS

**Binôme** : Malik Tounsi (21139496), Adam Chaara (21113891)

---

### 🚀 Démarrage du projet

À la racine du projet, vous trouverez un script nommé **`lancement.sh`** qui permet de démarrer ou d’arrêter l’ensemble selon l’argument fourni (note : le dossier `node_modules` n’est pas inclus car trop volumineux).

#### Arguments utilisables :

- `go` : Démarre l’environnement.
- `finish` : Met fin à l’exécution.

Exemple d’utilisation :

```bash
# Lancer le projet
./lancement.sh go

# Interrompre le projet
./lancement.sh finish
```

---

## Partie 1 : Mise en place de l’environnement (Strapi, PostgreSQL, Frontend React)

Pour faciliter la communication entre les services et la gestion globale, nous utilisons **Docker Compose**.

### Conditions préalables

#### Étape 1 : Lancement de la base PostgreSQL

Utilisez la commande suivante pour initialiser une instance PostgreSQL :

```bash
docker run -dit -p 5432:5432 -e POSTGRES_PASSWORD=user -e POSTGRES_USER=user --name strapiDB postgres:latest
```

### Étape 2 : Initialisation du projet Strapi

1. Créez un projet Strapi avec :

   ```bash
   yarn create strapi-app@4.12.0 mon-projet-strapi
   ```
   > 💡 Dans notre configuration, le projet se nomme **`projet-devops`**.

2. Ajoutez les éléments suivants pour la conteneurisation :
   - Un `Dockerfile` (pour strapi)
   - Trois fichiers `docker-compose.yml` : racine du projet (strapiDb , strapi et react ) ; dans kafka (zookeeper , kafka , kafka-init , product-consumer/producer et event consumer/producer ) et enfin dans stock ( stock consumer/producer)  
    

### Étape 3 : Création des collections **Product** et **Event**

Via l’interface Strapi, créez une collection nommée **product** avec les champs :

| Nom du champ        | Type          | Détail                                           |
|---------------------|---------------|--------------------------------------------------|
| `name`              | Texte court   | Nom du produit                                   |
| `description`       | Texte long    | Description détaillée                            |
| `stock_available`   | Nombre entier | Quantité disponible par défaut à `0`             |
| `image`             | Média (image) | Une seule image autorisée                        |
| `barcode`           | Texte court   | Code-barres associé                              |
| `status`            | Enumération   | Options : `safe`, `danger`, `empty`              |

Créez également une collection **event** avec :

| Nom du champ  | Type   | Détail                           |
|---------------|--------|----------------------------------|
| `value`       | Texte  | Valeur de l’événement            |
| `metadata`    | JSON   | Données supplémentaires associées |

### Étape 4 : Génération d’un **Jeton API**

Créez un token API dans Strapi et accordez-lui les permissions sur les collections concernées.

### Étape 5 : Mise en place du frontend

1. Accédez au répertoire du projet :

   ```bash
   cd projet-devops
   yarn install
   ```

2. Clonez le dépôt frontend :

   ```bash
   git clone https://github.com/arthurescriou/opsci-strapi-frontend.git
   ```

3. Dans le fichier `opsci-strapi-frontend/src/conf.ts` :
   - Mettez à jour l’URL : `http://localhost:1337`
   - Remplacez le token par celui généré précédemment

### Étape 6 : Configuration du Docker Compose

Utilisez Docker Compose pour connecter les différents services entre eux.

---

## Détails des services

### Frontend React

- **Nom** : `opsci-strapi-frontend`
- **Port d’accès** : `5173`
- **URL locale** : [http://localhost:5173/](http://localhost:5173/)
- **Nom du conteneur** : `opsci-strapi-frontend`

---

### Backend Strapi

- **Nom du projet** : `projet-devops`
- **Port utilisé** : `1337`
- **Adresse locale** : [http://localhost:1337](http://localhost:1337)
- **Conteneur** : `strapi`
- **Nom de la base** : `projet-devops`

---

### Base PostgreSQL

- **Conteneur** : `strapiDB`
- **Port d'écoute** : `5432`
- **Image Docker** : `postgres:12`

---

## Partie 2 : Intégration Kafka

Dans le but de gérer un grand volume de données provenant de multiples sources tout en assurant une forte tolérance aux erreurs, nous avons conçu une architecture de flux temps réel basée sur **Kafka**, intégrée avec **Strapi**.

### Mise en place de Kafka & Zookeeper

Kafka repose sur des **topics** pour l'échange de messages. Voici ceux utilisés :

| Topic     | Rôle principal                                                                        |
|-----------|----------------------------------------------------------------------------------------|
| `product` | Pour l’intégration de produits en masse via différentes sources                       |
| `event`   | Pour les événements liés aux produits                                                 |
| `stock`   | Pour suivre et appliquer les changements de stock                                     |
| `error`   | Pour enregistrer les erreurs durant les échanges de données                           |

Téléchargement des producers & consumers via GitHub :

```bash
cd projet-devops
git clone https://github.com/opsci-su/stock-consumer.git
git clone https://github.com/opsci-su/event-producer.git
git clone https://github.com/opsci-su/stock-producer.git
git clone https://github.com/opsci-su/product-producer.git
git clone https://github.com/opsci-su/product-consumer.git
git clone https://github.com/opsci-su/event-consumer.git
```

### Fonctionnement des flux

- Les **producers** publient des données dans Kafka.
- Les **consumers** traitent ces données et les injectent dans Strapi (produits, événements, mouvements de stock).
