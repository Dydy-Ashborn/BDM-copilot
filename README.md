# 🥩 La Boucherie des Montagnes - PWA

Application Progressive Web App pour la gestion des commandes de La Boucherie des Montagnes.

## 🚀 Fonctionnalités

### ✅ Gestion des commandes
- Ajouter, modifier et supprimer des commandes
- Détection automatique des catégories de viande
- Filtrage par date et catégorie
- Impression du tableau des commandes

### 🤖 Détection intelligente
L'application détecte automatiquement les catégories de viande dans le contenu de la commande :
- **Boeuf** : boeuf, steak, côte de boeuf, entrecôte, bavette, rumsteak
- **Veau** : veau, escalope de veau, blanquette
- **Agneau** : agneau, gigot, côtelette d'agneau
- **Volaille** : volaille, poulet, dinde, canard, pintade
- **Porc** : porc, rôti de porc, côtelette de porc, jambon, saucisse
- **Pierrade** : pierrade

Vous pouvez également ajouter ou retirer des catégories manuellement.

### 📱 PWA (Progressive Web App)
- Installation sur mobile et desktop
- Fonctionne hors-ligne
- Notifications de mise à jour
- Interface responsive

### 🎨 Design
- Couleurs de la marque (rouge #E63946)
- Logo et header de l'entreprise
- Interface moderne et intuitive

## 🔧 Installation

### 1. Hébergement
Hébergez les fichiers sur un serveur web avec HTTPS (obligatoire pour les PWA).

Options d'hébergement gratuites :
- **Firebase Hosting** (recommandé)
- **Netlify**
- **Vercel**
- **GitHub Pages**

### 2. Configuration Firebase

#### Base de données Firestore
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet `bdm-copilot`
3. Créez une base de données Firestore en mode Production
4. Configurez les règles de sécurité :

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

**Note** : Ces règles permettent l'accès public. Pour plus de sécurité, ajoutez Firebase Authentication.

### 3. Déploiement avec Firebase Hosting

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser le projet
firebase init

# Sélectionnez :
# - Hosting
# - Firestore (si pas déjà fait)
# - Project: bdm-copilot

# Déployer
firebase deploy
```

## 📊 Structure de la base de données

### Collection `commandes`
```javascript
{
  id: "auto-generated",
  nomClient: "string",
  telephone: "string (10 chiffres)",
  dateLivraison: "string (YYYY-MM-DD)",
  heureLivraison: "string (HH:MM)",
  contenuCommande: "string",
  categories: ["Boeuf", "Porc", ...],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎯 Utilisation

### Ajouter une commande
1. Cliquez sur "Nouvelle Commande"
2. Remplissez le formulaire
3. Les catégories sont détectées automatiquement dans le contenu
4. Ajoutez ou retirez des catégories si nécessaire
5. Validez

### Modifier une commande
1. Cliquez sur ✏️ dans la ligne de la commande
2. Modifiez les informations
3. Validez

### Supprimer une commande
1. Cliquez sur 🗑️ dans la ligne de la commande
2. Confirmez la suppression

### Filtrer les commandes
- Sélectionnez une date de livraison
- Sélectionnez une catégorie de viande
- Cliquez sur "Réinitialiser les filtres" pour tout afficher

### Imprimer
Cliquez sur "Imprimer" pour générer une version imprimable du tableau.

### Installer l'application
1. Sur mobile : Un prompt apparaîtra automatiquement
2. Ou cliquez sur "Installer l'application"
3. L'app sera disponible comme une application native

## 🔐 Sécurité (optionnel)

Pour ajouter une authentification :

1. Activez Firebase Authentication
2. Modifiez les règles Firestore :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /commandes/{commandeId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Ajoutez le code d'authentification dans l'app

## 📱 Compatibilité

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ✅ Samsung Internet

## 🎨 Personnalisation

### Couleurs
Modifiez les variables CSS dans `styles.css` :
```css
:root {
    --rouge-principal: #E63946;
    --gris-fonce: #4A4A4A;
    --gris-clair: #F8F8F8;
}
```

### Catégories
Modifiez la fonction `detectCategories` dans `app.jsx` pour ajouter des mots-clés.

## 🐛 Débogage

### La PWA ne s'installe pas
- Vérifiez que le site est en HTTPS
- Vérifiez que le manifest.json est accessible
- Vérifiez que le service worker est enregistré (DevTools > Application)

### Les données ne se chargent pas
- Vérifiez la console pour les erreurs Firebase
- Vérifiez les règles Firestore
- Vérifiez la configuration Firebase dans app.jsx

## 📞 Support

Pour toute question, vérifiez :
1. La console du navigateur (F12)
2. L'onglet Network pour les erreurs de chargement
3. L'onglet Application > Service Workers

## 🚀 Améliorations futures possibles

- [ ] Authentification utilisateur
- [ ] Notifications push pour les livraisons
- [ ] Export Excel/PDF
- [ ] Statistiques et dashboard
- [ ] Vue calendrier
- [ ] Historique client
- [ ] Mode sombre
- [ ] Multilingue

---

Développé avec ❤️ pour La Boucherie des Montagnes
