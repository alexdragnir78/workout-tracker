// Router - Système de navigation entre les pages

// Utilitaires de stockage
const Storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Erreur de lecture localStorage:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erreur d\'écriture localStorage:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erreur de suppression localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erreur de nettoyage localStorage:', error);
            return false;
        }
    }
};

// Utilitaires globaux
const Utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    formatWeight(weight) {
        if (!weight) return '';
        if (weight.includes('kg')) return weight;
        return weight.replace(',', '.') + 'kg';
    },
    
    parseWeight(weight) {
        if (!weight) return 0;
        return parseFloat(weight.replace('kg', '').replace(',', '.')) || 0;
    },
    
    validateInput(value, type) {
        switch (type) {
            case 'reps':
                return /^\d+$/.test(value) && parseInt(value) > 0 && parseInt(value) <= 100;
            case 'weight':
                const weightValue = value.replace('kg', '').replace(',', '.');
                return /^\d+\.?\d*$/.test(weightValue) && parseFloat(weightValue) > 0;
            case 'exerciseName':
                return value.length >= 2 && value.length <= 50;
            default:
                return true;
        }
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

class Router {
    constructor() {
        this.currentPage = 'home';
        this.pages = {
            home: new HomePage(),
            workout: new WorkoutPage(),
            stats: new StatsPage()
        };
        
        this.init();
    }
    
    init() {
        // Initialisation du routeur
        this.loadPage(this.currentPage);
        
        // Gestion de l'historique du navigateur
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
        
        // URL initiale
        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get('page') || 'home';
        if (initialPage !== 'home') {
            this.navigateTo(initialPage);
        }
    }
    
    navigateTo(pageName, addToHistory = true) {
        if (!this.pages[pageName]) {
            console.error(`Page "${pageName}" not found`);
            return;
        }
        
        // Mise à jour de l'URL
        if (addToHistory) {
            const url = pageName === 'home' ? '/' : `/?page=${pageName}`;
            history.pushState({ page: pageName }, '', url);
        }
        
        this.loadPage(pageName);
    }
    
    loadPage(pageName) {
        // Affichage du loader
        this.showLoading();
        
        // Nettoyage de la page précédente
        if (this.pages[this.currentPage] && this.pages[this.currentPage].cleanup) {
            this.pages[this.currentPage].cleanup();
        }
        
        // Mise à jour de la navigation
        this.updateNavigation(pageName);
        
        // Chargement de la nouvelle page
        setTimeout(() => {
            this.currentPage = pageName;
            const page = this.pages[pageName];
            
            if (page && page.render) {
                const content = page.render();
                document.getElementById('main-content').innerHTML = content;
                
                // Initialisation de la page
                if (page.init) {
                    page.init();
                }
                
                // Initialisation des icônes Lucide
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            this.hideLoading();
        }, 200);
    }
    
    updateNavigation(activePage) {
        // Mise à jour des boutons de navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`${activePage}-btn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
    
    getCurrentPage() {
        return this.currentPage;
    }
    
    getPageInstance(pageName) {
        return this.pages[pageName];
    }
}

// Fonctions globales pour la navigation
function navigateTo(page) {
    if (window.router) {
        window.router.navigateTo(page);
    }
}

function getCurrentPage() {
    return window.router ? window.router.getCurrentPage() : 'home';
}

// Utilitaires globaux
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        
        // Mise à jour du style selon le type
        const toastContent = toast.firstElementChild;
        toastContent.className = type === 'success' 
            ? 'bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg'
            : type === 'error'
            ? 'bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg'
            : 'bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg';
        
        // Affichage
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
        
        // Masquage automatique
        setTimeout(() => {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
        }, 3000);
    }
}

function exportData() {
    const workoutData = Storage.get('workoutData', {});
    
    if (Object.keys(workoutData).length === 0) {
        showToast('Aucune donnée à exporter', 'info');
        return;
    }
    
    // Export CSV
    const csvData = [];
    Object.entries(workoutData).forEach(([key, workout]) => {
        if (workout.exercises) {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach((set, setIndex) => {
                    if (set.reps || set.weight) {
                        csvData.push({
                            semaine: key.split('-')[0],
                            jour: key.split('-')[1],
                            exercice: exercise.name,
                            serie: setIndex + 1,
                            repetitions: set.reps || '',
                            poids: set.weight || '',
                            repos: exercise.restTime || '',
                            notes: workout.notes || ''
                        });
                    }
                });
            });
        }
    });
    
    if (csvData.length === 0) {
        showToast('Aucune donnée à exporter', 'info');
        return;
    }
    
    const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Export CSV terminé');
}

// Initialisation du routeur à la fin du chargement
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
    
    // Gestion des raccourcis clavier globaux
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    showToast('Données sauvegardées automatiquement', 'info');
                    break;
                case 'e':
                    e.preventDefault();
                    exportData();
                    break;
                case '1':
                    e.preventDefault();
                    navigateTo('home');
                    break;
                case '2':
                    e.preventDefault();
                    navigateTo('workout');
                    break;
                case '3':
                    e.preventDefault();
                    navigateTo('stats');
                    break;
            }
        }
    });
    
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Actualisation des données si la page redevient visible
            const currentPageInstance = window.router.getPageInstance(window.router.getCurrentPage());
            if (currentPageInstance && currentPageInstance.refresh) {
                currentPageInstance.refresh();
            }
        }
    });
    
    // Synchronisation entre onglets
    window.addEventListener('storage', (e) => {
        if (e.key === 'workoutData' || e.key === 'workoutPresets') {
            const currentPageInstance = window.router.getPageInstance(window.router.getCurrentPage());
            if (currentPageInstance && currentPageInstance.refresh) {
                currentPageInstance.refresh();
            }
            showToast('Données mises à jour depuis un autre onglet', 'info');
        }
    });
});