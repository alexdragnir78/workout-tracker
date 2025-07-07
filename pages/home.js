// Page d'accueil - Gestion des presets avec style amélioré

class HomePage {
    constructor() {
        this.selectedDayType = 'Push';
        this.editingExercise = null;
    }
    
    render() {
        const presets = window.dataManager ? window.dataManager.getPresets() : {};
        const weekCycle = ['Push', 'Pull', 'Legs'];
        
        return `
            <div class="max-w-7xl mx-auto space-y-8 fade-in">
                <!-- Header de la page avec style amélioré -->
                <div class="flex items-center justify-between slide-up">
                    <div>
                        <h1 class="text-4xl font-bold gradient-text text-shadow mb-2">
                            Gestion des Presets
                        </h1>
                        <p class="text-slate-400 text-lg">Créez et gérez vos programmes d'entraînement personnalisés</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="homePage.createNewPreset()" class="btn-primary hover-lift">
                            <i data-lucide="plus" class="w-5 h-5 mr-2"></i>
                            Nouveau preset
                        </button>
                        <button onclick="homePage.importPresets()" class="btn-secondary hover-lift">
                            <i data-lucide="upload" class="w-5 h-5 mr-2"></i>
                            Importer
                        </button>
                    </div>
                </div>
                
                <!-- Sélecteur de type de jour avec style glassmorphism -->
                <div class="flex justify-center slide-up" style="animation-delay: 0.1s;">
                    <div class="flex space-x-2 glass rounded-2xl p-2 shadow-xl">
                        ${weekCycle.map(day => `
                            <button 
                                onclick="homePage.selectDayType('${day}')"
                                class="day-btn ${day.toLowerCase()} ${this.selectedDayType === day ? 'active' : ''} hover-lift"
                            >
                                ${day}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Grid principal avec layout amélioré -->
                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Liste des exercices (2 colonnes) -->
                    <div class="lg:col-span-2 space-y-6">
                        <div class="flex items-center justify-between slide-up" style="animation-delay: 0.2s;">
                            <h2 class="text-2xl font-bold text-white">Exercices ${this.selectedDayType}</h2>
                            <button onclick="homePage.addExercise()" class="btn-icon hover-lift hover-glow text-cyan-500 bg-cyan-500/20 rounded-lg p-3">
                                <i data-lucide="plus" class="w-6 h-6"></i>
                            </button>
                        </div>
                        
                        <div id="exercises-list" class="space-y-4">
                            ${this.renderExercisesList(presets[this.selectedDayType] || [])}
                        </div>
                        
                        ${(!presets[this.selectedDayType] || presets[this.selectedDayType].length === 0) ? `
                            <div class="glass-card text-center py-12 slide-up" style="animation-delay: 0.3s;">
                                <i data-lucide="dumbbell" class="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-60"></i>
                                <h3 class="text-xl font-medium text-white mb-2">Aucun exercice pour ${this.selectedDayType}</h3>
                                <p class="text-slate-400 mb-6">Commencez par ajouter votre premier exercice</p>
                                <button onclick="homePage.addExercise()" class="btn-primary hover-lift">
                                    <i data-lucide="plus" class="w-5 h-5 mr-2"></i>
                                    Ajouter un exercice
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Sidebar avec aperçu et statistiques -->
                    <div class="space-y-6">
                        <!-- Aperçu de la séance -->
                        <div class="glass-card slide-up hover-lift" style="animation-delay: 0.4s;">
                            <div class="card-header">
                                <h3 class="text-lg font-semibold text-white flex items-center">
                                    <i data-lucide="eye" class="w-5 h-5 mr-2 text-cyan-400"></i>
                                    Aperçu de la séance
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderWorkoutPreview(presets[this.selectedDayType] || [])}
                            </div>
                        </div>
                        
                        <!-- Statistiques rapides -->
                        <div class="glass-card slide-up hover-lift" style="animation-delay: 0.5s;">
                            <div class="card-header">
                                <h3 class="text-lg font-semibold text-white flex items-center">
                                    <i data-lucide="bar-chart-3" class="w-5 h-5 mr-2 text-purple-400"></i>
                                    Statistiques
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderQuickStats(presets[this.selectedDayType] || [])}
                            </div>
                        </div>
                        
                        <!-- Bouton d'action principal -->
                        <button onclick="navigateTo('workout')" class="w-full btn-primary hover-lift hover-glow slide-up" style="animation-delay: 0.6s;">
                            <i data-lucide="play" class="w-5 h-5 mr-2"></i>
                            Commencer l'entraînement
                        </button>
                    </div>
                </div>
                
                <!-- Actions globales avec style amélioré -->
                <div class="flex justify-between items-center pt-8 border-t border-slate-700/50 slide-up" style="animation-delay: 0.7s;">
                    <div class="flex space-x-3">
                        <button onclick="homePage.exportPresets()" class="btn-secondary hover-lift">
                            <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                            Exporter presets
                        </button>
                        <button onclick="homePage.resetToDefaults()" class="btn-danger hover-lift">
                            <i data-lucide="refresh-ccw" class="w-4 h-4 mr-2"></i>
                            Restaurer défauts
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderExercisesList(exercises) {
        if (!exercises || exercises.length === 0) {
            return '';
        }
        
        return exercises.map((exercise, index) => `
            <div class="exercise-item group slide-up" style="animation-delay: ${0.3 + index * 0.1}s;">
                <div class="flex items-center space-x-4 flex-1">
                    <div class="w-1 h-12 rounded-full ${this.getDayGradientClass(this.selectedDayType)}"></div>
                    <div class="flex-1">
                        <div class="font-semibold text-white text-lg">${exercise.name}</div>
                        <div class="text-sm text-slate-400 flex items-center space-x-4 mt-1">
                            <span class="flex items-center space-x-1">
                                <i data-lucide="repeat" class="w-3 h-3"></i>
                                <span>${exercise.sets} séries</span>
                            </span>
                            <span class="flex items-center space-x-1">
                                <i data-lucide="clock" class="w-3 h-3"></i>
                                <span>${exercise.restTime} repos</span>
                            </span>
                            ${exercise.category ? `
                                <span class="flex items-center space-x-1">
                                    <i data-lucide="target" class="w-3 h-3"></i>
                                    <span>${exercise.category}</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                        onclick="homePage.editExercise('${exercise.id}')"
                        class="btn-icon hover-lift text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/20"
                        title="Modifier"
                    >
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button 
                        onclick="homePage.deleteExercise('${exercise.id}')"
                        class="btn-icon hover-lift text-slate-400 hover:text-red-400 hover:bg-red-400/20"
                        title="Supprimer"
                    >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                    <button 
                        onclick="homePage.moveExercise('${exercise.id}', 'up')"
                        class="btn-icon hover-lift text-slate-400 hover:text-slate-300"
                        title="Monter"
                    >
                        <i data-lucide="chevron-up" class="w-4 h-4"></i>
                    </button>
                    <button 
                        onclick="homePage.moveExercise('${exercise.id}', 'down')"
                        class="btn-icon hover-lift text-slate-400 hover:text-slate-300"
                        title="Descendre"
                    >
                        <i data-lucide="chevron-down" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderWorkoutPreview(exercises) {
        if (!exercises || exercises.length === 0) {
            return `
                <div class="text-center py-8">
                    <i data-lucide="clipboard-x" class="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-60"></i>
                    <p class="text-slate-400">Aucun exercice sélectionné</p>
                </div>
            `;
        }
        
        const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
        const estimatedTime = this.calculateEstimatedTime(exercises);
        
        return `
            <div class="space-y-6">
                <!-- Métriques principales -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="stat-card hover-lift">
                        <div class="stat-number text-cyan-400">${exercises.length}</div>
                        <div class="stat-label">Exercices</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number text-orange-400">${totalSets}</div>
                        <div class="stat-label">Séries totales</div>
                    </div>
                </div>
                
                <!-- Durée estimée -->
                <div class="text-center glass rounded-xl p-4">
                    <div class="text-sm text-slate-400 mb-2">Durée estimée</div>
                    <div class="text-3xl font-bold gradient-text">${estimatedTime}</div>
                </div>
                
                <!-- Ordre des exercices -->
                <div class="space-y-3">
                    <h4 class="font-medium text-white flex items-center">
                        <i data-lucide="list-ordered" class="w-4 h-4 mr-2 text-slate-400"></i>
                        Ordre des exercices
                    </h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${exercises.map((exercise, index) => `
                            <div class="flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <span class="w-6 h-6 bg-gradient-to-br ${this.getDayGradientClass(this.selectedDayType)} rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    ${index + 1}
                                </span>
                                <span class="flex-1 font-medium">${exercise.name}</span>
                                <span class="text-slate-400">${exercise.sets}×</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderQuickStats(exercises) {
        if (!exercises || exercises.length === 0) {
            return `
                <div class="text-center py-8">
                    <i data-lucide="bar-chart-3" class="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-60"></i>
                    <p class="text-slate-400">Aucune donnée à afficher</p>
                </div>
            `;
        }
        
        const categories = {};
        exercises.forEach(exercise => {
            const cat = exercise.category || 'Autre';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        
        return `
            <div class="space-y-4">
                <h4 class="font-medium text-white flex items-center">
                    <i data-lucide="pie-chart" class="w-4 h-4 mr-2 text-slate-400"></i>
                    Répartition par muscle
                </h4>
                <div class="space-y-3">
                    ${Object.entries(categories).map(([category, count]) => {
                        const color = CONFIG.CATEGORIES[category]?.color || '#64748b';
                        const percentage = (count / exercises.length * 100).toFixed(0);
                        return `
                            <div class="space-y-2">
                                <div class="flex items-center justify-between text-sm">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 rounded-full shadow-lg" style="background: linear-gradient(135deg, ${color}, ${color}dd);"></div>
                                        <span class="font-medium">${category}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-slate-400">${count} ex.</span>
                                        <span class="font-bold text-white">${percentage}%</span>
                                    </div>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(90deg, ${color}, ${color}dd);" data-width="${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    init() {
        // Initialisation de la page avec animations
        window.homePage = this;
        
        // Animer les éléments après le rendu
        setTimeout(() => {
            this.animateElements();
        }, 100);
    }
    
    animateElements() {
        // Animer les progress bars
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach((bar, index) => {
            const targetWidth = bar.getAttribute('data-width') || bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500 + (index * 100));
        });
        
        // Animer les stats cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
            }, 600 + (index * 100));
        });
    }
    
    selectDayType(dayType) {
        this.selectedDayType = dayType;
        
        // Animation de transition
        const content = document.getElementById('main-content');
        content.style.opacity = '0.7';
        content.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            this.refresh();
            content.style.transition = 'all 0.3s ease';
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 150);
    }
    
    refresh() {
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        this.animateElements();
    }
    
    addExercise() {
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div class="modal-header">
                    <h3 class="text-xl font-bold gradient-text flex items-center">
                        <i data-lucide="plus-circle" class="w-6 h-6 mr-2 text-cyan-400"></i>
                        Ajouter un exercice
                    </h3>
                </div>
                <div class="modal-body space-y-6">
                    <div class="form-group">
                        <label class="form-label">Nom de l'exercice</label>
                        <input 
                            type="text" 
                            id="exercise-name" 
                            class="form-input hover-lift" 
                            placeholder="Ex: Développé couché"
                            required
                        >
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Nombre de séries</label>
                            <select id="exercise-sets" class="form-select hover-lift">
                                <option value="3">3 séries</option>
                                <option value="4" selected>4 séries</option>
                                <option value="5">5 séries</option>
                                <option value="6">6 séries</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Temps de repos</label>
                            <select id="exercise-rest" class="form-select hover-lift">
                                <option value="1min">1 minute</option>
                                <option value="1m30" selected>1m30</option>
                                <option value="2min">2 minutes</option>
                                <option value="3min">3 minutes</option>
                                <option value="5min">5 minutes</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Catégorie</label>
                        <select id="exercise-category" class="form-select hover-lift">
                            ${Object.keys(CONFIG.CATEGORIES).map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary hover-lift" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary hover-lift hover-glow" onclick="homePage.saveExercise()">
                        <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                        Ajouter
                    </button>
                </div>
            </div>
        `;
        
        window.modalManager.show(modalHtml);
    }
    
    editExercise(exerciseId) {
        const exercises = window.dataManager.getPreset(this.selectedDayType);
        const exercise = exercises.find(e => e.id === exerciseId);
        
        if (!exercise) return;
        
        this.editingExercise = exerciseId;
        
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div class="modal-header">
                    <h3 class="text-xl font-bold gradient-text flex items-center">
                        <i data-lucide="edit" class="w-6 h-6 mr-2 text-cyan-400"></i>
                        Modifier l'exercice
                    </h3>
                </div>
                <div class="modal-body space-y-6">
                    <div class="form-group">
                        <label class="form-label">Nom de l'exercice</label>
                        <input 
                            type="text" 
                            id="exercise-name" 
                            class="form-input hover-lift" 
                            value="${exercise.name}"
                            required
                        >
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Nombre de séries</label>
                            <select id="exercise-sets" class="form-select hover-lift">
                                <option value="3" ${exercise.sets === 3 ? 'selected' : ''}>3 séries</option>
                                <option value="4" ${exercise.sets === 4 ? 'selected' : ''}>4 séries</option>
                                <option value="5" ${exercise.sets === 5 ? 'selected' : ''}>5 séries</option>
                                <option value="6" ${exercise.sets === 6 ? 'selected' : ''}>6 séries</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Temps de repos</label>
                            <select id="exercise-rest" class="form-select hover-lift">
                                <option value="1min" ${exercise.restTime === '1min' ? 'selected' : ''}>1 minute</option>
                                <option value="1m30" ${exercise.restTime === '1m30' ? 'selected' : ''}>1m30</option>
                                <option value="2min" ${exercise.restTime === '2min' ? 'selected' : ''}>2 minutes</option>
                                <option value="3min" ${exercise.restTime === '3min' ? 'selected' : ''}>3 minutes</option>
                                <option value="5min" ${exercise.restTime === '5min' ? 'selected' : ''}>5 minutes</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Catégorie</label>
                        <select id="exercise-category" class="form-select hover-lift">
                            ${Object.keys(CONFIG.CATEGORIES).map(cat => 
                                `<option value="${cat}" ${exercise.category === cat ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary hover-lift" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary hover-lift hover-glow" onclick="homePage.saveExercise()">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i>
                        Modifier
                    </button>
                </div>
            </div>
        `;
        
        window.modalManager.show(modalHtml);
    }
    
    saveExercise() {
        const name = document.getElementById('exercise-name').value.trim();
        const sets = parseInt(document.getElementById('exercise-sets').value);
        const restTime = document.getElementById('exercise-rest').value;
        const category = document.getElementById('exercise-category').value;
        
        if (!name) {
            showToast('Le nom de l\'exercice est requis', 'error');
            return;
        }
        
        const exerciseData = {
            name: name,
            sets: sets,
            restTime: restTime,
            category: category
        };
        
        // Animation de sauvegarde
        const saveBtn = document.querySelector('.btn-primary[onclick="homePage.saveExercise()"]');
        if (saveBtn) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
        }
        
        setTimeout(() => {
            if (this.editingExercise) {
                // Modification
                window.dataManager.updateExercise(this.selectedDayType, this.editingExercise, exerciseData);
                showToast('Exercice modifié avec succès', 'success');
                this.editingExercise = null;
            } else {
                // Ajout
                window.dataManager.addExerciseToDay(this.selectedDayType, exerciseData);
                showToast('Exercice ajouté avec succès', 'success');
            }
            
            window.modalManager.hide();
            
            // Animation de refresh
            setTimeout(() => {
                this.refresh();
            }, 300);
        }, 500);
    }
    
    async deleteExercise(exerciseId) {
        const exercises = window.dataManager.getPreset(this.selectedDayType);
        const exercise = exercises.find(e => e.id === exerciseId);
        
        if (!exercise) return;
        
        const confirmed = await window.modalManager.confirm(
            `Êtes-vous sûr de vouloir supprimer l'exercice "${exercise.name}" ?`,
            'Supprimer l\'exercice'
        );
        
        if (confirmed) {
            // Animation de suppression
            const exerciseElement = document.querySelector(`[onclick="homePage.deleteExercise('${exerciseId}')"]`).closest('.exercise-item');
            if (exerciseElement) {
                exerciseElement.style.transform = 'scale(0.8)';
                exerciseElement.style.opacity = '0';
                
                setTimeout(() => {
                    window.dataManager.deleteExercise(this.selectedDayType, exerciseId);
                    showToast('Exercice supprimé', 'success');
                    this.refresh();
                }, 300);
            } else {
                window.dataManager.deleteExercise(this.selectedDayType, exerciseId);
                showToast('Exercice supprimé', 'success');
                this.refresh();
            }
        }
    }
    
    moveExercise(exerciseId, direction) {
        const exercises = window.dataManager.getPreset(this.selectedDayType);
        const currentIndex = exercises.findIndex(e => e.id === exerciseId);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex < 0 || newIndex >= exercises.length) return;
        
        // Animation de mouvement
        const exerciseElement = document.querySelector(`[onclick="homePage.moveExercise('${exerciseId}', '${direction}')"]`).closest('.exercise-item');
        if (exerciseElement) {
            exerciseElement.style.transform = direction === 'up' ? 'translateY(-10px)' : 'translateY(10px)';
            exerciseElement.style.opacity = '0.7';
        }
        
        setTimeout(() => {
            // Échanger les positions
            [exercises[currentIndex], exercises[newIndex]] = [exercises[newIndex], exercises[currentIndex]];
            
            // Sauvegarder
            window.dataManager.presets[this.selectedDayType] = exercises;
            window.dataManager.save();
            
            this.refresh();
        }, 200);
    }
    
    createNewPreset() {
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div class="modal-header">
                    <h3 class="text-xl font-bold gradient-text flex items-center">
                        <i data-lucide="folder-plus" class="w-6 h-6 mr-2 text-cyan-400"></i>
                        Créer un nouveau preset
                    </h3>
                </div>
                <div class="modal-body space-y-6">
                    <div class="form-group">
                        <label class="form-label">Type de séance</label>
                        <select id="preset-day-type" class="form-select hover-lift">
                            <option value="Push">Push (Poussée)</option>
                            <option value="Pull">Pull (Tirage)</option>
                            <option value="Legs">Legs (Jambes)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Nom du preset</label>
                        <input 
                            type="text" 
                            id="preset-name" 
                            class="form-input hover-lift" 
                            placeholder="Ex: Push Débutant"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Description (optionnel)</label>
                        <textarea 
                            id="preset-description" 
                            class="form-textarea hover-lift" 
                            rows="3"
                            placeholder="Description du preset..."
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary hover-lift" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary hover-lift hover-glow" onclick="homePage.saveNewPreset()">
                        <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                        Créer
                    </button>
                </div>
            </div>
        `;
        
        window.modalManager.show(modalHtml);
    }
    
    saveNewPreset() {
        const dayType = document.getElementById('preset-day-type').value;
        const name = document.getElementById('preset-name').value.trim();
        const description = document.getElementById('preset-description').value.trim();
        
        if (!name) {
            showToast('Le nom du preset est requis', 'error');
            return;
        }
        
        // Créer un nouveau preset vide
        const preset = window.dataManager.createPreset(dayType, name, []);
        if (preset) {
            showToast('Preset créé avec succès', 'success');
            this.selectedDayType = dayType;
            window.modalManager.hide();
            setTimeout(() => this.refresh(), 300);
        }
    }
    
    exportPresets() {
        const presets = window.dataManager.getPresets();
        const exportData = {
            version: CONFIG.APP_VERSION,
            exportDate: new Date().toISOString(),
            presets: presets
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workout-presets-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Presets exportés avec succès', 'success');
    }
    
    importPresets() {
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div class="modal-header">
                    <h3 class="text-xl font-bold gradient-text flex items-center">
                        <i data-lucide="upload" class="w-6 h-6 mr-2 text-cyan-400"></i>
                        Importer des presets
                    </h3>
                </div>
                <div class="modal-body space-y-6">
                    <div class="form-group">
                        <label class="form-label">Fichier JSON</label>
                        <input 
                            type="file" 
                            id="import-file" 
                            class="form-input hover-lift" 
                            accept=".json"
                            required
                        >
                        <p class="text-sm text-slate-400 mt-2 flex items-center">
                            <i data-lucide="info" class="w-4 h-4 mr-1"></i>
                            Sélectionnez un fichier JSON exporté précédemment
                        </p>
                    </div>
                    
                    <div class="glass rounded-lg p-4 border-l-4 border-yellow-400">
                        <div class="flex items-center space-x-2 text-yellow-400 text-sm font-medium">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                            <span>Attention: L'import remplacera les presets existants</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary hover-lift" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary hover-lift hover-glow" onclick="homePage.processImport()">
                        <i data-lucide="upload" class="w-4 h-4 mr-2"></i>
                        Importer
                    </button>
                </div>
            </div>
        `;
        
        window.modalManager.show(modalHtml);
    }
    
    processImport() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            showToast('Veuillez sélectionner un fichier', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.presets) {
                    const success = window.dataManager.importData(JSON.stringify(data));
                    if (success) {
                        showToast('Presets importés avec succès', 'success');
                        window.modalManager.hide();
                        setTimeout(() => this.refresh(), 300);
                    } else {
                        showToast('Erreur lors de l\'import', 'error');
                    }
                } else {
                    showToast('Format de fichier invalide', 'error');
                }
            } catch (error) {
                showToast('Erreur de lecture du fichier', 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    async resetToDefaults() {
        const confirmed = await window.modalManager.confirm(
            'Êtes-vous sûr de vouloir restaurer les presets par défaut ? Tous vos presets personnalisés seront perdus.',
            'Restaurer les défauts'
        );
        
        if (confirmed) {
            window.dataManager.presets = { ...CONFIG.DEFAULT_PRESETS };
            window.dataManager.save();
            showToast('Presets restaurés aux valeurs par défaut', 'success');
            setTimeout(() => this.refresh(), 300);
        }
    }
    
    // Méthodes utilitaires améliorées
    getDayColorClass(day) {
        const colors = {
            Push: 'bg-gradient-to-b from-orange-500 to-orange-600',
            Pull: 'bg-gradient-to-b from-green-500 to-green-600',
            Legs: 'bg-gradient-to-b from-blue-500 to-blue-600'
        };
        return colors[day] || 'bg-gradient-to-b from-slate-500 to-slate-600';
    }
    
    
    calculateEstimatedTime(exercises) {
        let totalMinutes = 0;
        
        exercises.forEach(exercise => {
            // Temps d'exécution des séries (estimé à 30s par série)
            totalMinutes += exercise.sets * 0.5;
            
            // Temps de repos
            const restMinutes = this.parseRestTime(exercise.restTime);
            totalMinutes += (exercise.sets - 1) * restMinutes; // Pas de repos après la dernière série
        });
        
        // Temps de transition entre exercices (estimé à 30s)
        totalMinutes += (exercises.length - 1) * 0.5;
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        
        if (hours > 0) {
            return `${hours}h${minutes.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}min`;
        }
    }
    
    parseRestTime(restTime) {
        if (restTime.includes('h')) {
            return parseFloat(restTime) * 60;
        } else if (restTime.includes('m')) {
            const match = restTime.match(/(\d+)m(\d+)?/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = match[2] ? parseInt(match[2]) : 0;
                return minutes + seconds / 60;
            }
            return parseFloat(restTime);
        } else {
            return parseFloat(restTime) || 1.5; // Default 1.5 minutes
        }
    }
}