// Page de statistiques - Version minimale temporaire

class StatsPage {
    constructor() {
        console.log('✅ StatsPage créée');
    }
    
    render() {
        return `
            <div class="max-w-7xl mx-auto space-y-8 fade-in">
                <!-- Header -->
                <div class="text-center slide-up">
                    <h1 class="text-4xl font-bold gradient-text text-shadow mb-2">
                        Statistiques
                    </h1>
                    <p class="text-slate-400 text-lg">Analysez vos performances et votre progression</p>
                </div>
                
                <!-- Contenu temporaire -->
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Métriques de base -->
                    <div class="stat-card hover-lift slide-up" style="animation-delay: 0.1s;">
                        <div class="stat-number text-cyan-400">0</div>
                        <div class="stat-label">Séances totales</div>
                    </div>
                    
                    <div class="stat-card hover-lift slide-up" style="animation-delay: 0.2s;">
                        <div class="stat-number text-green-400">1</div>
                        <div class="stat-label">Semaines d'entraînement</div>
                    </div>
                    
                    <div class="stat-card hover-lift slide-up" style="animation-delay: 0.3s;">
                        <div class="stat-number text-orange-400">0kg</div>
                        <div class="stat-label">Volume total</div>
                    </div>
                    
                    <div class="stat-card hover-lift slide-up" style="animation-delay: 0.4s;">
                        <div class="stat-number text-purple-400">0</div>
                        <div class="stat-label">Exercices pratiqués</div>
                    </div>
                </div>
                
                <!-- Message informatif -->
                <div class="glass-card text-center py-12 slide-up" style="animation-delay: 0.5s;">
                    <i data-lucide="bar-chart-3" class="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-60"></i>
                    <h3 class="text-xl font-medium text-white mb-2">Statistiques en développement</h3>
                    <p class="text-slate-400 mb-6">
                        Cette page affichera vos statistiques détaillées une fois que vous aurez commencé à enregistrer vos séances d'entraînement.
                    </p>
                    <div class="space-x-4">
                        <button onclick="navigateTo('home')" class="btn-secondary hover-lift">
                            <i data-lucide="settings" class="w-4 h-4 mr-2"></i>
                            Gérer les presets
                        </button>
                        <button onclick="navigateTo('workout')" class="btn-primary hover-lift hover-glow">
                            <i data-lucide="play" class="w-4 h-4 mr-2"></i>
                            Commencer un entraînement
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    init() {
        window.statsPage = this;
        console.log('📊 Page Statistiques initialisée');
    }
    
    refresh() {
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    cleanup() {
        // Nettoyage si nécessaire
    }
}