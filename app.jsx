// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKvdv1fGEQ9wocseL6ERtjaJ_vdwDtAKE",
  authDomain: "bdm-copilot.firebaseapp.com",
  projectId: "bdm-copilot",
  storageBucket: "bdm-copilot.firebasestorage.app",
  messagingSenderId: "506794787132",
  appId: "1:506794787132:web:ef02b4e52851762dfbde39",
  measurementId: "G-MVM6GTZJ5B"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const { useState, useEffect, useRef } = React;

// Fonction pour générer un numéro de commande unique (000-999)
const generateOrderNumber = async () => {
    try {
        // Récupérer toutes les commandes pour trouver le dernier numéro
        const snapshot = await db.collection('commandes').orderBy('numeroCommande', 'desc').limit(1).get();
        
        let lastNumber = 0;
        if (!snapshot.empty) {
            const lastOrder = snapshot.docs[0].data();
            if (lastOrder.numeroCommande) {
                lastNumber = parseInt(lastOrder.numeroCommande);
            }
        }
        
        // Incrémenter et revenir à 000 après 999
        const newNumber = (lastNumber + 1) % 1000;
        return String(newNumber).padStart(3, '0');
    } catch (error) {
        console.error('Erreur génération numéro:', error);
        // En cas d'erreur, générer un numéro aléatoire
        return String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    }
};

// Fonction de détection automatique des catégories
const detectCategories = (text) => {
    const categories = [];
    const textLower = text.toLowerCase();
    
    const keywords = {
        'Boeuf': ['boeuf', 'bœuf', 'steak', 'côte de boeuf', 'entrecote', 'entrecôte', 'bavette', 'rumsteak'],
        'Veau': ['veau', 'escalope de veau', 'blanquette'],
        'Agneau': ['agneau', 'gigot', 'côtelette d\'agneau', 'epaule d\'agneau'],
        'Volaille': ['volaille', 'poulet', 'dinde', 'canard', 'pintade'],
        'Porc': ['porc', 'rôti de porc', 'côtelette de porc', 'jambon', 'lard'],
        'Saucisses': ['saucisse', 'saucisses', 'chipo', 'chipolata', 'merguez', 'chorizo', 'knack', 'knacki', 'francfort', 'toulouse'],
        'Pierrade': ['pierrade']
    };
    
    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => textLower.includes(word))) {
            categories.push(category);
        }
    }
    
    return [...new Set(categories)]; // Enlever les doublons
};

// Composant Badge de catégorie
const CategoryBadge = ({ category, onRemove, removable = false }) => {
    const className = `badge badge-${category.toLowerCase()}`;
    return (
        <span className={className}>
            {category}
            {removable && (
                <span className="badge-remove" onClick={onRemove}>×</span>
            )}
        </span>
    );
};

// Composant Toast de notification
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    
    return (
        <div className={`toast toast-${type}`}>
            {message}
        </div>
    );
};

// Composant Modal de formulaire
const CommandeModal = ({ isOpen, onClose, commande, onSave }) => {
    const [formData, setFormData] = useState({
        nomClient: '',
        telephone: '',
        dateLivraison: '',
        heureLivraison: '',
        contenuCommande: '',
        categories: []
    });
    
    const [autoDetectedCategories, setAutoDetectedCategories] = useState([]);
    
    useEffect(() => {
        if (commande) {
            setFormData({
                nomClient: commande.nomClient || '',
                telephone: commande.telephone || '',
                dateLivraison: commande.dateLivraison || '',
                heureLivraison: commande.heureLivraison || '',
                contenuCommande: commande.contenuCommande || '',
                categories: commande.categories || []
            });
        } else {
            setFormData({
                nomClient: '',
                telephone: '',
                dateLivraison: '',
                heureLivraison: '',
                contenuCommande: '',
                categories: []
            });
        }
    }, [commande, isOpen]);
    
    useEffect(() => {
        if (formData.contenuCommande) {
            const detected = detectCategories(formData.contenuCommande);
            setAutoDetectedCategories(detected);
            
            // Ajouter automatiquement les catégories détectées si elles ne sont pas déjà présentes
            const newCategories = [...new Set([...formData.categories, ...detected])];
            if (JSON.stringify(newCategories) !== JSON.stringify(formData.categories)) {
                setFormData(prev => ({ ...prev, categories: newCategories }));
            }
        } else {
            setAutoDetectedCategories([]);
        }
    }, [formData.contenuCommande]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddCategory = (category) => {
        if (!formData.categories.includes(category)) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, category]
            }));
        }
    };
    
    const handleRemoveCategory = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== category)
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    if (!isOpen) return null;
    
    const allCategories = ['Boeuf', 'Veau', 'Agneau', 'Volaille', 'Porc', 'Saucisses', 'Pierrade'];
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{commande ? 'Modifier la commande' : 'Nouvelle commande'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nom du client *</label>
                            <input
                                type="text"
                                name="nomClient"
                                value={formData.nomClient}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Téléphone *</label>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                title="Veuillez entrer un numéro de téléphone valide (10 chiffres)"
                                required
                            />
                            <small>Format : 10 chiffres sans espaces</small>
                        </div>
                        
                        <div className="form-group">
                            <label>Date de livraison *</label>
                            <input
                                type="date"
                                name="dateLivraison"
                                value={formData.dateLivraison}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Heure de livraison *</label>
                            <input
                                type="time"
                                name="heureLivraison"
                                value={formData.heureLivraison}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Contenu de la commande *</label>
                            <textarea
                                name="contenuCommande"
                                value={formData.contenuCommande}
                                onChange={handleChange}
                                placeholder="Ex: 1 pierrade 4 personnes, 1 côte de boeuf, 1 rôti de porc..."
                                required
                            />
                            <small>Les catégories seront détectées automatiquement</small>
                        </div>
                        
                        <div className="form-group">
                            <label>Catégories détectées</label>
                            {formData.categories.length > 0 ? (
                                <div className="categories-badges">
                                    {formData.categories.map(cat => (
                                        <CategoryBadge
                                            key={cat}
                                            category={cat}
                                            removable
                                            onRemove={() => handleRemoveCategory(cat)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#757575', fontSize: '0.875rem' }}>
                                    Aucune catégorie détectée
                                </p>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label>Ajouter manuellement une catégorie</label>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddCategory(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            >
                                <option value="">Sélectionner...</option>
                                {allCategories
                                    .filter(cat => !formData.categories.includes(cat))
                                    .map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))
                                }
                            </select>
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            {commande ? 'Mettre à jour' : 'Ajouter la commande'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Composant principal
const App = () => {
    const [commandes, setCommandes] = useState([]);
    const [filteredCommandes, setFilteredCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCommande, setCurrentCommande] = useState(null);
    const [filters, setFilters] = useState({
        date: '',
        categorie: ''
    });
    const [availableCategories, setAvailableCategories] = useState([]);
    const [toast, setToast] = useState(null);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showSafariInstallPrompt, setShowSafariInstallPrompt] = useState(false);
    
    // Charger les commandes
    useEffect(() => {
        const unsubscribe = db.collection('commandes')
            .orderBy('dateLivraison', 'asc')
            .onSnapshot(snapshot => {
                const commandesData = [];
                snapshot.forEach(doc => {
                    commandesData.push({ id: doc.id, ...doc.data() });
                });
                setCommandes(commandesData);
                setFilteredCommandes(commandesData);
                setLoading(false);
            }, error => {
                console.error('Erreur Firebase:', error);
                showToast('Erreur de chargement des commandes', 'error');
                setLoading(false);
            });
        
        return () => unsubscribe();
    }, []);
    
    // Gérer le prompt d'installation PWA
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        
        window.addEventListener('beforeinstallprompt', handler);
        
        // Détecter Safari et afficher la popup d'instructions
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
        
        // Afficher la popup seulement si :
        // - C'est Safari ou iOS
        // - L'app n'est pas déjà installée
        // - L'utilisateur n'a pas déjà fermé la popup (localStorage)
        if ((isSafari || isIOS) && !isStandalone) {
            const hasSeenPrompt = localStorage.getItem('safariInstallPromptSeen');
            if (!hasSeenPrompt) {
                setTimeout(() => {
                    setShowSafariInstallPrompt(true);
                }, 2000); // Attendre 2 secondes avant d'afficher
            }
        }
        
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);
    
    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showToast('Application installée avec succès!', 'success');
        }
        
        setDeferredPrompt(null);
    };
    
    const handleCloseSafariPrompt = () => {
        setShowSafariInstallPrompt(false);
        localStorage.setItem('safariInstallPromptSeen', 'true');
    };
    
    const handleShowSafariInstructions = () => {
        setShowSafariInstallPrompt(true);
    };
    
    // Appliquer les filtres
    useEffect(() => {
        let filtered = [...commandes];
        
        // Filtrer par date
        if (filters.date) {
            filtered = filtered.filter(cmd => cmd.dateLivraison === filters.date);
            
            // Extraire les catégories disponibles pour cette date
            const categoriesSet = new Set();
            filtered.forEach(cmd => {
                if (cmd.categories) {
                    cmd.categories.forEach(cat => categoriesSet.add(cat));
                }
            });
            setAvailableCategories(Array.from(categoriesSet).sort());
        } else {
            // Réinitialiser les catégories disponibles
            setAvailableCategories([]);
        }
        
        // Filtrer par catégorie
        if (filters.categorie) {
            filtered = filtered.filter(cmd => 
                cmd.categories && cmd.categories.includes(filters.categorie)
            );
        }
        
        setFilteredCommandes(filtered);
    }, [filters, commandes]);
    
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        // Si on change la date, réinitialiser la catégorie
        if (name === 'date') {
            setFilters({ date: value, categorie: '' });
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const resetFilters = () => {
        setFilters({ date: '', categorie: '' });
    };
    
    const handleAddCommande = () => {
        setCurrentCommande(null);
        setIsModalOpen(true);
    };
    
    const handleEditCommande = (commande) => {
        setCurrentCommande(commande);
        setIsModalOpen(true);
    };
    
    const handleSaveCommande = async (formData) => {
        try {
            if (currentCommande) {
                // Mise à jour - garder le numéro existant
                await db.collection('commandes').doc(currentCommande.id).update({
                    ...formData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast('Commande mise à jour avec succès!', 'success');
            } else {
                // Création - générer un nouveau numéro
                const numeroCommande = await generateOrderNumber();
                await db.collection('commandes').add({
                    ...formData,
                    numeroCommande,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast(`Commande #${numeroCommande} ajoutée avec succès!`, 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur lors de l\'enregistrement', 'error');
        }
    };
    
    const handleDeleteCommande = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            return;
        }
        
        try {
            await db.collection('commandes').doc(id).delete();
            showToast('Commande supprimée avec succès!', 'success');
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    };
    
    const handleDeleteOldCommandes = async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (!confirm(`Êtes-vous sûr de vouloir supprimer toutes les commandes avant le ${formatDate(yesterdayStr)} ?`)) {
            return;
        }
        
        try {
            const snapshot = await db.collection('commandes')
                .where('dateLivraison', '<', yesterdayStr)
                .get();
            
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            showToast(`${snapshot.size} commande(s) supprimée(s) avec succès!`, 'success');
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    
    const handlePrint = () => {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isSafari) {
            generatePrintPDF();
        } else {
            window.print();
        }
    };
    
    const generatePrintPDF = async () => {
        try {
            showToast('Génération du PDF en cours...', 'success');
            
            // Créer un clone de la page pour l'impression
            const printContainer = document.createElement('div');
            printContainer.style.position = 'absolute';
            printContainer.style.left = '-9999px';
            printContainer.style.top = '0';
            printContainer.style.width = '210mm'; // A4 width
            printContainer.style.background = 'white';
            printContainer.style.padding = '10mm';
            document.body.appendChild(printContainer);
            
            // Ajouter le header
            const header = document.querySelector('.header').cloneNode(true);
            printContainer.appendChild(header);
            
            // Déterminer si on est sur mobile ou desktop
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Sur mobile, cloner toutes les cartes
                filteredCommandes.forEach(commande => {
                    const card = document.createElement('div');
                    card.className = 'commande-card';
                    card.style.pageBreakInside = 'avoid';
                    card.style.marginBottom = '1rem';
                    card.style.border = '1px solid #ddd';
                    card.style.borderLeft = '4px solid #E63946';
                    card.style.padding = '1rem';
                    card.style.borderRadius = '12px';
                    card.style.background = 'white';
                    
                    card.innerHTML = `
                        <div style="margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #E0E0E0;">
                            <div style="font-size: 0.875rem; color: #4A4A4A; margin-bottom: 0.25rem;">
                                Commande #${commande.numeroCommande || '---'}
                            </div>
                            <h3 style="margin: 0; color: #E63946; font-size: 1.1rem;">${commande.nomClient}</h3>
                            <div style="color: #E63946; font-weight: bold; margin-top: 0.25rem;">
                                📞 ${commande.telephone}
                            </div>
                        </div>
                        <div style="display: grid; gap: 0.5rem;">
                            <div style="display: flex;">
                                <span style="font-weight: 600; color: #4A4A4A; min-width: 100px; font-size: 0.875rem;">📅 Date :</span>
                                <span>${formatDate(commande.dateLivraison)}</span>
                            </div>
                            <div style="display: flex;">
                                <span style="font-weight: 600; color: #4A4A4A; min-width: 100px; font-size: 0.875rem;">🕐 Heure :</span>
                                <span>${commande.heureLivraison}</span>
                            </div>
                            <div style="display: flex;">
                                <span style="font-weight: 600; color: #4A4A4A; min-width: 100px; font-size: 0.875rem;">🥩 Catégories :</span>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                                    ${commande.categories ? commande.categories.map(cat => 
                                        `<span class="badge badge-${cat.toLowerCase()}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">${cat}</span>`
                                    ).join('') : ''}
                                </div>
                            </div>
                            <div style="display: flex; margin-top: 0.5rem;">
                                <span style="font-weight: 600; color: #4A4A4A; min-width: 100px; font-size: 0.875rem;">📝 Contenu :</span>
                                <span style="white-space: pre-wrap; flex: 1;">${commande.contenuCommande}</span>
                            </div>
                        </div>
                    `;
                    printContainer.appendChild(card);
                });
            } else {
                // Sur desktop, cloner le tableau
                const table = document.querySelector('table').cloneNode(true);
                // Supprimer la dernière colonne (Actions)
                table.querySelectorAll('th:last-child, td:last-child').forEach(el => el.remove());
                printContainer.appendChild(table);
            }
            
            // Capturer avec html2canvas
            const canvas = await html2canvas(printContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            // Nettoyer
            document.body.removeChild(printContainer);
            
            // Créer le PDF
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;
            const pageHeight = 297; // A4 height in mm
            
            if (imgHeight > pageHeight) {
                // Si l'image est plus grande qu'une page, la découper
                while (position < imgHeight) {
                    pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
                    position += pageHeight;
                    if (position < imgHeight) {
                        pdf.addPage();
                    }
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }
            
            // Sauvegarder
            const filename = `commandes_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            showToast('PDF téléchargé avec succès!', 'success');
        } catch (error) {
            console.error('Erreur PDF:', error);
            showToast('Erreur lors de la génération du PDF', 'error');
        }
    };
    
    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Chargement des commandes...</p>
            </div>
        );
    }
    
    return (
        <>
            <header className="header">
                <img src="Header.jpg" alt="La Boucherie des Montagnes" className="header-image" />
            </header>
            
            <div className="container">
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={handleAddCommande}>
                        ➕ Nouvelle Commande
                    </button>
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        {/^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? '📄 Télécharger PDF' : '🖨️ Imprimer'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleDeleteOldCommandes} style={{ background: '#D32F2F' }}>
                        🗑️ Supprimer anciennes commandes
                    </button>
                    {deferredPrompt && (
                        <button className="btn btn-install" onClick={handleInstallClick}>
                            📱 Installer l'application
                        </button>
                    )}
                    {!deferredPrompt && /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !window.navigator.standalone && !window.matchMedia('(display-mode: standalone)').matches && (
                        <button className="btn btn-install" onClick={handleShowSafariInstructions}>
                            📱 Comment installer l'app ?
                        </button>
                    )}
                </div>
                
                <div className="filters">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Date de livraison</label>
                            <input
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Catégorie de viande</label>
                            <select
                                name="categorie"
                                value={filters.categorie}
                                onChange={handleFilterChange}
                                disabled={!filters.date}
                            >
                                <option value="">
                                    {filters.date 
                                        ? (availableCategories.length > 0 
                                            ? 'Toutes les catégories' 
                                            : 'Aucune commande pour cette date')
                                        : 'Sélectionnez d\'abord une date'}
                                </option>
                                {filters.date && availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {filters.date && availableCategories.length > 0 && (
                                <small style={{ color: 'var(--gris-fonce)', marginTop: '0.25rem', display: 'block' }}>
                                    {availableCategories.length} catégorie{availableCategories.length > 1 ? 's' : ''} disponible{availableCategories.length > 1 ? 's' : ''}
                                </small>
                            )}
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={resetFilters}>
                        🔄 Réinitialiser les filtres
                    </button>
                </div>
                
                <div className="table-container">
                    {filteredCommandes.length > 0 ? (
                        <div className="table-responsive">
                            {/* Tableau desktop */}
                            <table>
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Client</th>
                                        <th>Téléphone</th>
                                        <th>Date</th>
                                        <th>Heure</th>
                                        <th>Catégories</th>
                                        <th>Contenu</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCommandes.map(commande => (
                                        <tr key={commande.id}>
                                            <td><strong>#{commande.numeroCommande || '---'}</strong></td>
                                            <td><strong>{commande.nomClient}</strong></td>
                                            <td>
                                                <a href={`tel:${commande.telephone}`}>
                                                    {commande.telephone}
                                                </a>
                                            </td>
                                            <td>{formatDate(commande.dateLivraison)}</td>
                                            <td>{commande.heureLivraison}</td>
                                            <td>
                                                <div className="categories-badges">
                                                    {commande.categories && commande.categories.map(cat => (
                                                        <CategoryBadge key={cat} category={cat} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                                                {commande.contenuCommande}
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditCommande(commande)}
                                                        title="Modifier"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteCommande(commande.id)}
                                                        title="Supprimer"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Cartes mobile */}
                            {filteredCommandes.map(commande => (
                                <div key={`card-${commande.id}`} className="commande-card">
                                    <div className="commande-card-header">
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gris-fonce)', marginBottom: '0.25rem' }}>
                                                Commande #{commande.numeroCommande || '---'}
                                            </div>
                                            <h3>{commande.nomClient}</h3>
                                        </div>
                                        <a href={`tel:${commande.telephone}`} style={{ color: 'var(--rouge-principal)', textDecoration: 'none', fontWeight: 'bold' }}>
                                            📞 {commande.telephone}
                                        </a>
                                    </div>
                                    
                                    <div className="commande-card-info">
                                        <div className="commande-card-row">
                                            <span className="commande-card-label">📅 Date :</span>
                                            <span className="commande-card-value">{formatDate(commande.dateLivraison)}</span>
                                        </div>
                                        <div className="commande-card-row">
                                            <span className="commande-card-label">🕐 Heure :</span>
                                            <span className="commande-card-value">{commande.heureLivraison}</span>
                                        </div>
                                        <div className="commande-card-row">
                                            <span className="commande-card-label">🥩 Catégories :</span>
                                            <div className="commande-card-value">
                                                <div className="categories-badges">
                                                    {commande.categories && commande.categories.map(cat => (
                                                        <CategoryBadge key={cat} category={cat} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="commande-card-row">
                                            <span className="commande-card-label">📝 Contenu :</span>
                                            <span className="commande-card-value" style={{ whiteSpace: 'pre-wrap' }}>{commande.contenuCommande}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="commande-card-actions">
                                        <button
                                            className="btn-icon btn-edit"
                                            onClick={() => handleEditCommande(commande)}
                                            title="Modifier"
                                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDeleteCommande(commande.id)}
                                            title="Supprimer"
                                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <h3>Aucune commande trouvée</h3>
                            <p>Ajoutez votre première commande ou ajustez vos filtres</p>
                        </div>
                    )}
                </div>
            </div>
            
            <CommandeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                commande={currentCommande}
                onSave={handleSaveCommande}
            />
            
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            
            {/* Popup d'instructions pour Safari */}
            {showSafariInstallPrompt && (
                <div className="modal-overlay" onClick={handleCloseSafariPrompt}>
                    <div className="safari-install-prompt" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseSafariPrompt}>&times;</button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
                            <h2 style={{ color: 'var(--rouge-principal)', marginBottom: '0.5rem' }}>
                                Installer l'application
                            </h2>
                            <p style={{ color: 'var(--gris-fonce)', fontSize: '0.875rem' }}>
                                Accédez rapidement à vos commandes !
                            </p>
                        </div>
                        
                        <div className="safari-instructions">
                            <div className="safari-step">
                                <div className="safari-step-number">1</div>
                                <div className="safari-step-content">
                                    <strong>Appuyez sur le bouton Partager</strong>
                                    <div style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
                                        <span style={{ 
                                            display: 'inline-block', 
                                            padding: '0.5rem 1rem', 
                                            background: '#007AFF', 
                                            color: 'white', 
                                            borderRadius: '8px',
                                            fontSize: '1.5rem'
                                        }}>↑</span>
                                    </div>
                                    <small style={{ color: 'var(--gris-fonce)' }}>
                                        En bas de l'écran (iPhone) ou dans la barre d'outils (Mac)
                                    </small>
                                </div>
                            </div>
                            
                            <div className="safari-step">
                                <div className="safari-step-number">2</div>
                                <div className="safari-step-content">
                                    <strong>Sélectionnez "Sur l'écran d'accueil"</strong>
                                    <div style={{ margin: '0.5rem 0', color: 'var(--gris-fonce)' }}>
                                        📱 Sur l'écran d'accueil
                                    </div>
                                    <small style={{ color: 'var(--gris-fonce)' }}>
                                        Ou "Ajouter au Dock" sur Mac
                                    </small>
                                </div>
                            </div>
                            
                            <div className="safari-step">
                                <div className="safari-step-number">3</div>
                                <div className="safari-step-content">
                                    <strong>Appuyez sur "Ajouter"</strong>
                                    <div style={{ margin: '0.5rem 0', color: 'var(--gris-fonce)' }}>
                                        ✅ L'app apparaîtra sur votre écran d'accueil
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            className="btn btn-primary" 
                            onClick={handleCloseSafariPrompt}
                            style={{ width: '100%', marginTop: '1.5rem' }}
                        >
                            J'ai compris !
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// Render l'application
ReactDOM.render(<App />, document.getElementById('root'));