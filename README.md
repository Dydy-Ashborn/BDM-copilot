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


## 📱 Compatibilité

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ✅ Samsung Internet

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

Développé avec ❤️ pour La Boucherie des Montagnes
