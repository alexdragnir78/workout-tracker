// Page d'accueil - Gestion des presets

class HomePage {
    constructor() {
        this.selectedDayType = 'Push';
        this.editingExercise = null;
    }
    
    render() {
        const presets = window.dataManager.getPresets();
        
        return `
            <div class="max-w-6xl mx-auto space-y-6">
                <!-- Header de la page -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-white">Gestion des Presets</h1>
                        <p class="text-slate-400 mt-1">Créez et gérez vos programmes d'entraînement</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="homePage.createNewPreset()" class="btn-primary">
                            <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                            Nouveau preset
                        </button>
                        <button onclick="homePage.importPresets()" class="btn-secondary">
                            <i data-lucide="upload" class="w-4 h-4 mr-2"></i>
                            Importer
                        </button>
                    </div>
                </div>
                
                <!-- Sélecteur de type de jour -->
                <div class="flex space-x-2 bg-slate-800 p-1 rounded-lg border border-slate-700 w-fit">
                    ${CONFIG.WEEK_CYCLE.filter((day, index, arr) => arr.indexOf(day) === index).map(day => `
                        <button 
                            onclick="homePage.selectDayType('${day}')"
                            class="day-btn ${day.toLowerCase()} ${this.selectedDayType === day ? 'active' : ''}"
                        >
                            ${day}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Grid des presets -->
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Liste des exercices -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">Exercices ${this.selectedDayType}</h2>
                            <button onclick="homePage.addExercise()" class="btn-icon text-cyan-500 hover:bg-cyan-500 hover:text-white">
                                <i data-lucide="plus" class="w-5 h-5"></i>
                            </button>
                        </div>
                        
                        <div id="exercises-list" class="space-y-3">
                            ${this.renderExercisesList(presets[this.selectedDayType] || [])}
                        </div>
                        
                        ${presets[this.selectedDayType]?.length === 0 ? `
                            <div class="text-center py-8 text-slate-400">
                                <i data-lucide="dumbbell" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                                <p>Aucun exercice pour ${this.selectedDayType}</p>
                                <button onclick="homePage.addExercise()" class="btn-primary mt-3">
                                    Ajouter un exercice
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Aperçu et statistiques -->
                    <div class="space-y-4">
                        <h2 class="text-xl font-semibold">Aperçu de la séance</h2>
                        
                        <div class="card">
                            <div class="card-body">
                                ${this.renderWorkoutPreview(presets[this.selectedDayType] || [])}
                            </div>
                        </div>
                        
                        <!-- Statistiques rapides -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="font-medium">Statistiques</h3>
                            </div>
                            <div class="card-body">
                                ${this.renderQuickStats(presets[this.selectedDayType] || [])}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Actions globales -->
                <div class="flex justify-between items-center pt-6 border-t border-slate-700">
                    <div class="flex space-x-3">
                        <button onclick="homePage.exportPresets()" class="btn-secondary">
                            <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                            Exporter presets
                        </button>
                        <button onclick="homePage.resetToDefaults()" class="btn-danger">
                            <i data-lucide="refresh-ccw" class="w-4 h-4 mr-2"></i>
                            Restaurer défauts
                        </button>
                    </div>
                    
                    <button onclick="navigateTo('workout')" class="btn-primary">
                        <i data-lucide="play" class="w-4 h-4 mr-2"></i>
                        Commencer l'entraînement
                    </button>
                </div>
            </div>
        `;
    }
    
    renderExercisesList(exercises) {
        if (!exercises || exercises.length === 0) {
            return '';
        }
        
        return exercises.map(exercise => `
            <div class="exercise-item group">
                <div class="flex items-center space-x-3 flex-1">
                    <div class="w-3 h-8 rounded ${this.getDayColorClass(this.selectedDayType)}"></div>
                    <div class="flex-1">
                        <div class="font-medium text-white">${exercise.name}</div>
                        <div class="text-sm text-slate-400">
                            ${exercise.sets} séries • ${exercise.restTime} repos
                            ${exercise.category ? `• ${exercise.category}` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onclick="homePage.editExercise('${exercise.id}')"
                        class="btn-icon text-slate-400 hover:text-cyan-500"
                    >
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button 
                        onclick="homePage.deleteExercise('${exercise.id}')"
                        class="btn-icon text-slate-400 hover:text-red-500"
                    >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                    <button 
                        onclick="homePage.moveExercise('${exercise.id}', 'up')"
                        class="btn-icon text-slate-400 hover:text-slate-300"
                    >
                        <i data-lucide="chevron-up" class="w-4 h-4"></i>
                    </button>
                    <button 
                        onclick="homePage.moveExercise('${exercise.id}', 'down')"
                        class="btn-icon text-slate-400 hover:text-slate-300"
                    >
                        <i data-lucide="chevron-down" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderWorkoutPreview(exercises) {
        if (!exercises || exercises.length === 0) {
            return '<p class="text-slate-400 text-center py-4">Aucun exercice sélectionné</p>';
        }
        
        const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
        const estimatedTime = this.calculateEstimatedTime(exercises);
        
        return `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div class="text-2xl font-bold text-cyan-500">${exercises.length}</div>
                        <div class="text-sm text-slate-400">Exercices</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-cyan-500">${totalSets}</div>
                        <div class="text-sm text-slate-400">Séries totales</div>
                    </div>
                </div>
                
                <div class="text-center">
                    <div class="text-lg font-medium text-white">Durée estimée</div>
                    <div class="text-3xl font-bold text-cyan-500">${estimatedTime}</div>
                </div>
                
                <div class="space-y-2">
                    <h4 class="font-medium text-white">Ordre des exercices</h4>
                    ${exercises.map((exercise, index) => `
                        <div class="flex items-center space-x-3 text-sm">
                            <span class="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                                ${index + 1}
                            </span>
                            <span class="flex-1">${exercise.name}</span>
                            <span class="text-slate-400">${exercise.sets}×</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderQuickStats(exercises) {
        const categories = {};
        exercises.forEach(exercise => {
            const cat = exercise.category || 'Autre';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        
        return `
            <div class="space-y-3">
                <h4 class="font-medium text-white">Répartition par muscle</h4>
                ${Object.entries(categories).map(([category, count]) => {
                    const color = CONFIG.CATEGORIES[category]?.color || '#64748b';
                    const percentage = (count / exercises.length * 100).toFixed(0);
                    return `
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                                <span>${category}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-slate-400">${count} ex.</span>
                                <span class="text-white font-medium">${percentage}%</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    init() {
        // Initialisation de la page
        window.homePage = this;
    }
    
    selectDayType(dayType) {
        this.selectedDayType = dayType;
        this.refresh();
    }
    
    refresh() {
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    addExercise() {
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.2s;">
                <div class="modal-header">
                    <h3 class="text-lg font-medium">Ajouter un exercice</h3>
                </div>
                <div class="modal-body space-y-4">
                    <div class="form-group">
                        <label class="form-label">Nom de l'exercice</label>
                        <input 
                            type="text" 
                            id="exercise-name" 
                            class="form-input" 
                            placeholder="Ex: Développé couché"
                            required
                        >
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Nombre de séries</label>
                            <select id="exercise-sets" class="form-select">
                                <option value="3">3 séries</option>
                                <option value="4" selected>4 séries</option>
                                <option value="5">5 séries</option>
                                <option value="6">6 séries</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Temps de repos</label>
                            <select id="exercise-rest" class="form-select">
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
                        <select id="exercise-category" class="form-select">
                            ${Object.keys(CONFIG.CATEGORIES).map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary" onclick="homePage.saveExercise()">
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
            <div class="modal" style="transform: scale(0.95); transition: transform 0.2s;">
                <div class="modal-header">
                    <h3 class="text-lg font-medium">Modifier l'exercice</h3>
                </div>
                <div class="modal-body space-y-4">
                    <div class="form-group">
                        <label class="form-label">Nom de l'exercice</label>
                        <input 
                            type="text" 
                            id="exercise-name" 
                            class="form-input" 
                            value="${exercise.name}"
                            required
                        >
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Nombre de séries</label>
                            <select id="exercise-sets" class="form-select">
                                <option value="3" ${exercise.sets === 3 ? 'selected' : ''}>3 séries</option>
                                <option value="4" ${exercise.sets === 4 ? 'selected' : ''}>4 séries</option>
                                <option value="5" ${exercise.sets === 5 ? 'selected' : ''}>5 séries</option>
                                <option value="6" ${exercise.sets === 6 ? 'selected' : ''}>6 séries</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Temps de repos</label>
                            <select id="exercise-rest" class="form-select">
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
                        <select id="exercise-category" class="form-select">
                            ${Object.keys(CONFIG.CATEGORIES).map(cat => 
                                `<option value="${cat}" ${exercise.category === cat ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary" onclick="homePage.saveExercise()">
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
        
        if (this.editingExercise) {
            // Modification
            window.dataManager.updateExercise(this.selectedDayType, this.editingExercise, exerciseData);
            showToast('Exercice modifié avec succès');
            this.editingExercise = null;
        } else {
            // Ajout
            window.dataManager.addExerciseToDay(this.selectedDayType, exerciseData);
            showToast('Exercice ajouté avec succès');
        }
        
        window.modalManager.hide();
        this.refresh();
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
            window.dataManager.deleteExercise(this.selectedDayType, exerciseId);
            showToast('Exercice supprimé');
            this.refresh();
        }
    }
    
    moveExercise(exerciseId, direction) {
        const exercises = window.dataManager.getPreset(this.selectedDayType);
        const currentIndex = exercises.findIndex(e => e.id === exerciseId);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex < 0 || newIndex >= exercises.length) return;
        
        // Échanger les positions
        [exercises[currentIndex], exercises[newIndex]] = [exercises[newIndex], exercises[currentIndex]];
        
        // Sauvegarder
        window.dataManager.presets[this.selectedDayType] = exercises;
        window.dataManager.save();
        
        this.refresh();
    }
    
    createNewPreset() {
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.2s;">
                <div class="modal-header">
                    <h3 class="text-lg font-medium">Créer un nouveau preset</h3>
                </div>
                <div class="modal-body space-y-4">
                    <div class="form-group">
                        <label class="form-label">Type de séance</label>
                        <select id="preset-day-type" class="form-select">
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
                            class="form-input" 
                            placeholder="Ex: Push Débutant"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Description (optionnel)</label>
                        <textarea 
                            id="preset-description" 
                            class="form-textarea" 
                            rows="3"
                            placeholder="Description du preset..."
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary" onclick="homePage.saveNewPreset()">
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
            showToast('Preset créé avec succès');
            this.selectedDayType = dayType;
            window.modalManager.hide();
            this.refresh();
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
        
        showToast('Presets exportés avec succès');
    }
    
    importPresets() {
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.2s;">
                <div class="modal-header">
                    <h3 class="text-lg font-medium">Importer des presets</h3>
                </div>
                <div class="modal-body space-y-4">
                    <div class="form-group">
                        <label class="form-label">Fichier JSON</label>
                        <input 
                            type="file" 
                            id="import-file" 
                            class="form-input" 
                            accept=".json"
                            required
                        >
                        <p class="text-sm text-slate-400 mt-2">
                            Sélectionnez un fichier JSON exporté précédemment
                        </p>
                    </div>
                    
                    <div class="bg-slate-700 rounded p-3">
                        <div class="flex items-center space-x-2 text-yellow-400 text-sm">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                            <span>Attention: L'import remplacera les presets existants</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="window.modalManager.hide()">
                        Annuler
                    </button>
                    <button type="button" class="btn-primary" onclick="homePage.processImport()">
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
                        showToast('Presets importés avec succès');
                        window.modalManager.hide();
                        this.refresh();
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
            showToast('Presets restaurés aux valeurs par défaut');
            this.refresh();
        }
    }
    
    // Méthodes utilitaires
    getDayColorClass(day) {
        const colors = {
            Push: 'bg-orange-500',
            Pull: 'bg-green-500',
            Legs: 'bg-blue-500'
        };
        return colors[day] || 'bg-slate-500';
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