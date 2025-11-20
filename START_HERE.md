# 🚀 DÉMARRAGE RAPIDE - 5 MINUTES

## 📦 Contenu du Package

Vous avez téléchargé tous les fichiers nécessaires pour votre PWA :

```
📁 bdm-pwa/
├── 📄 index.html              # Page principale
├── 📄 app.jsx                 # Application React
├── 📄 styles.css              # Styles CSS
├── 📄 manifest.json           # Configuration PWA
├── 📄 service-worker.js       # Mode hors-ligne
├── 📄 firebase.json           # Config Firebase Hosting
├── 📄 firestore.rules         # Règles Firestore
├── 📄 firestore.indexes.json  # Index Firestore
├── 📄 .firebaserc             # Projet Firebase
├── 📄 package.json            # Dépendances
├── 🖼️ Logo.png                # Logo
├── 🖼️ Header.jpg              # Bannière
├── 📖 README.md               # Documentation complète
├── 📖 DEPLOIEMENT.md          # Guide de déploiement
└── 📖 CONFIGURATION_FIREBASE.md  # Config Firebase
```

## ⚡ Option 1 : Déploiement Express (5 minutes)

### Prérequis
- Node.js installé (https://nodejs.org)

### Commandes à exécuter

```bash
# 1. Ouvrir un terminal dans le dossier téléchargé

# 2. Installer Firebase CLI
npm install -g firebase-tools

# 3. Se connecter à Firebase
firebase login

# 4. Déployer l'application
firebase deploy

# ✅ TERMINÉ ! Votre app est en ligne !
```

Votre application sera accessible sur :
**https://bdm-copilot.web.app**

## 🔧 Option 2 : Test en Local d'abord

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur local
npm start

# 3. Ouvrir dans le navigateur
# http://localhost:8080
```

## 🔥 Configuration Firebase (Important !)

### Étape 1 : Créer Firestore
1. Aller sur https://console.firebase.google.com
2. Sélectionner le projet **bdm-copilot**
3. Menu → **Firestore Database**
4. Cliquer **Créer une base de données**
5. Mode **Production**
6. Région **europe-west1**
7. **Activer**

### Étape 2 : Configurer les Règles
1. Dans Firestore → Onglet **Règles**
2. Copier-coller ce code :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /commandes/{commandeId} {
      allow read, write: if true;
    }
  }
}
```

3. Cliquer **Publier**

## ✅ Vérification

Après le déploiement :

1. ✅ Ouvrir l'URL de votre app
2. ✅ Cliquer sur "Nouvelle Commande"
3. ✅ Remplir le formulaire
4. ✅ Ajouter (les catégories sont détectées automatiquement)
5. ✅ La commande apparaît dans le tableau

## 📱 Installation sur Mobile

1. Ouvrir l'URL sur votre téléphone
2. Un popup "Installer" apparaît automatiquement
3. Cliquer sur **Installer**
4. L'app est maintenant sur votre écran d'accueil !

## 🎯 Fonctionnalités Principales

### ✨ Détection Automatique des Catégories
Tapez dans le contenu : `1 côte de boeuf, 1 rôti de porc, 1 pierrade`
→ Les badges **Boeuf**, **Porc**, **Pierrade** apparaissent automatiquement !

### 🔍 Filtres
- Par date de livraison
- Par catégorie de viande

### 🖨️ Impression
- Bouton "Imprimer" pour une version propre

### 📶 Mode Hors-ligne
- Fonctionne sans internet
- Se synchronise automatiquement

## 🆘 Problèmes Courants

### "npm: command not found"
→ Installer Node.js : https://nodejs.org

### "Permission denied"
→ Ajouter `sudo` devant les commandes :
```bash
sudo npm install -g firebase-tools
```

### Les données ne se sauvent pas
→ Vérifier que Firestore est bien créé et configuré
→ Voir le fichier `CONFIGURATION_FIREBASE.md`

### L'app ne s'installe pas
→ Vérifier que vous êtes en HTTPS
→ Le localhost ne permet pas l'installation PWA

## 📚 Documentation Complète

- **README.md** : Documentation technique détaillée
- **DEPLOIEMENT.md** : Toutes les options de déploiement
- **CONFIGURATION_FIREBASE.md** : Guide Firebase complet

## 🎨 Personnalisation

### Changer les Couleurs
Éditez `styles.css`, section `:root` :
```css
:root {
    --rouge-principal: #E63946;  /* Votre couleur */
}
```

### Ajouter des Catégories
Éditez `app.jsx`, fonction `detectCategories` :
```javascript
const keywords = {
    'Boeuf': ['boeuf', 'steak', ...],
    'MaNouvelleCatégorie': ['mot1', 'mot2'],
    // Ajoutez ici
};
```

## 🚀 C'est Parti !

Vous êtes prêt à utiliser votre application !

En cas de problème :
1. Consulter les fichiers de documentation
2. Vérifier la console du navigateur (F12)
3. Vérifier Firebase Console

---

**🎉 Bon courage et bonnes ventes !**

*Développé avec ❤️ pour La Boucherie des Montagnes*
