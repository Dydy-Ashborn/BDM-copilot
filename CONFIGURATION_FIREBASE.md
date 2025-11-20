# 🔥 Configuration Firebase - Guide Complet

## 1️⃣ Créer la Base de Données Firestore

### Étape 1 : Accéder à Firebase Console
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet **bdm-copilot**

### Étape 2 : Créer Firestore
1. Dans le menu de gauche : **Build** → **Firestore Database**
2. Cliquer sur **Créer une base de données**
3. Choisir **Mode Production**
4. Sélectionner la région : **europe-west1** (Belgique) ou **europe-west3** (Francfort)
5. Cliquer sur **Activer**

## 2️⃣ Configurer les Règles de Sécurité

### Option A : Via la Console (Recommandé)
1. Dans Firestore Database, cliquer sur l'onglet **Règles**
2. Copier-coller le code suivant :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection des commandes
    match /commandes/{commandeId} {
      // Accès public en lecture et écriture
      // ⚠️ À sécuriser avec une authentification en production
      allow read, write: if true;
      
      // Validation des données
      allow create: if request.resource.data.keys().hasAll([
        'nomClient', 
        'telephone', 
        'dateLivraison', 
        'heureLivraison', 
        'contenuCommande', 
        'categories'
      ]) && request.resource.data.telephone.matches('^[0-9]{10}$');
      
      allow update: if request.resource.data.keys().hasAll([
        'nomClient', 
        'telephone', 
        'dateLivraison', 
        'heureLivraison', 
        'contenuCommande', 
        'categories'
      ]) && request.resource.data.telephone.matches('^[0-9]{10}$');
    }
  }
}
```

3. Cliquer sur **Publier**

### Option B : Via Firebase CLI
```bash
firebase deploy --only firestore:rules
```

## 3️⃣ Règles de Sécurité Avancées (Optionnel)

### Avec Authentification Firebase
Si vous ajoutez Firebase Authentication, utilisez ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /commandes/{commandeId} {
      // Lecture et écriture uniquement pour les utilisateurs authentifiés
      allow read, write: if request.auth != null;
      
      // Validation des données
      allow create: if request.auth != null 
        && request.resource.data.keys().hasAll([
          'nomClient', 
          'telephone', 
          'dateLivraison', 
          'heureLivraison', 
          'contenuCommande', 
          'categories'
        ]) 
        && request.resource.data.telephone.matches('^[0-9]{10}$');
      
      allow update: if request.auth != null 
        && request.resource.data.keys().hasAll([
          'nomClient', 
          'telephone', 
          'dateLivraison', 
          'heureLivraison', 
          'contenuCommande', 
          'categories'
        ]) 
        && request.resource.data.telephone.matches('^[0-9]{10}$');
    }
  }
}
```

### Avec Restrictions par Rôle
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection des utilisateurs (à créer)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Collection des commandes
    match /commandes/{commandeId} {
      // Fonction helper pour vérifier le rôle
      function isAdmin() {
        return request.auth != null 
          && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      function isEmployee() {
        return request.auth != null 
          && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'employee'];
      }
      
      // Lecture pour tous les employés
      allow read: if isEmployee();
      
      // Écriture seulement pour les admins
      allow write: if isAdmin();
    }
  }
}
```

## 4️⃣ Index Firestore (Optionnel mais Recommandé)

Pour améliorer les performances des requêtes :

1. Dans Firestore Database, cliquer sur l'onglet **Index**
2. Cliquer sur **Ajouter un index composite**
3. Configuration :
   - Collection : `commandes`
   - Champs :
     - `dateLivraison` : Croissant
     - `heureLivraison` : Croissant
   - Scope de requête : Collection
4. Cliquer sur **Créer**

Ou via CLI :
```bash
firebase deploy --only firestore:indexes
```

## 5️⃣ Vérifier la Configuration

### Test dans la Console Firebase
1. Aller dans **Firestore Database** → **Données**
2. Créer manuellement un document de test dans la collection `commandes` :
```json
{
  "nomClient": "Test Client",
  "telephone": "0123456789",
  "dateLivraison": "2024-12-25",
  "heureLivraison": "14:00",
  "contenuCommande": "1 côte de boeuf, 1 rôti de porc",
  "categories": ["Boeuf", "Porc"],
  "createdAt": "2024-11-20T12:00:00Z",
  "updatedAt": "2024-11-20T12:00:00Z"
}
```

3. Si aucune erreur → Configuration OK ✅
4. Supprimer le document de test

### Test depuis l'Application
1. Déployer l'application
2. Ouvrir l'app dans le navigateur
3. Ouvrir la console (F12)
4. Ajouter une commande via l'interface
5. Vérifier dans Firebase Console que la commande apparaît

## 6️⃣ Monitoring et Logs

### Activer les Logs
1. Firebase Console → **Build** → **Firestore Database**
2. Onglet **Usage**
3. Surveiller le nombre de lectures/écritures

### Quotas Gratuits (Spark Plan)
- ✅ 50,000 lectures/jour
- ✅ 20,000 écritures/jour
- ✅ 20,000 suppressions/jour
- ✅ 1 GB de stockage

Si vous dépassez, passez au plan Blaze (pay-as-you-go).

## 7️⃣ Sauvegardes

### Export Manuel
```bash
# Exporter toutes les collections
gcloud firestore export gs://bdm-copilot.appspot.com/backups

# Importer depuis une sauvegarde
gcloud firestore import gs://bdm-copilot.appspot.com/backups/[timestamp]
```

### Automatiser les Sauvegardes
Configurer dans Firebase Console → Backups

## 8️⃣ Troubleshooting

### Erreur : "Missing or insufficient permissions"
→ Vérifier les règles Firestore
→ Republier les règles

### Erreur : "Failed to get document"
→ Vérifier que la collection existe
→ Vérifier la connexion internet

### Les données ne s'affichent pas
→ Ouvrir la console du navigateur (F12)
→ Vérifier les erreurs Firebase
→ Vérifier que l'API Key est correcte

## 9️⃣ Checklist Finale

- [ ] Firestore créé en mode Production
- [ ] Région européenne sélectionnée
- [ ] Règles de sécurité déployées
- [ ] Index créés (optionnel)
- [ ] Document de test créé et supprimé
- [ ] Application déployée et testée
- [ ] Aucune erreur dans la console
- [ ] Les commandes se créent correctement
- [ ] Les filtres fonctionnent

## 🎉 Configuration Terminée !

Votre base de données Firebase est maintenant prête à l'emploi !

Pour toute question :
- Documentation Firebase : https://firebase.google.com/docs/firestore
- Support : https://firebase.google.com/support

---

**⚠️ Important Sécurité** : Les règles actuelles permettent l'accès public. En production, il est recommandé d'ajouter Firebase Authentication pour sécuriser l'accès à l'application.
