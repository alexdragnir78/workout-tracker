// Application principale - Workout Tracker

// Gestionnaire de données global
class DataManager {
    constructor() {
        this.workoutData = {};
        this.presets = {};
        this.userSettings = {};
        this.currentWeek = 1;
        this.load();
    }
    
    load() {
        try {
            this.workoutData = Storage.get(CONFIG.STORAGE_KEYS.WORKOUT_DATA, {});
            this.presets = Storage.get(CONFIG.STORAGE_KEYS.PRESETS, CONFIG.DEFAULT_PRESETS);
            this.userSettings = Storage.get(CONFIG.STORAGE_KEYS.USER_SETTINGS, {
                currentWeek: 1,
                lastSession: null,
                preferences: {
                    autoSave: true,
                    notifications: true,
                    theme: 'dark'
                }
            });
            this.currentWeek = this.userSettings.currentWeek || 1;
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            // Initialiser avec des valeurs par défaut en cas d'erreur
            this.workoutData = {};
            this.presets = { ...CONFIG.DEFAULT_PRESETS };
            this.userSettings = {
                currentWeek: 1,
                lastSession: null,
                preferences: {
                    autoSave: true,
                    notifications: true,
                    theme: 'dark'
                }
            };
            this.currentWeek = 1;
        }
    }
    
    save() {
        Storage.set(CONFIG.STORAGE_KEYS.WORKOUT_DATA, this.workoutData);
        Storage.set(CONFIG.STORAGE_KEYS.PRESETS, this.presets);
        this.userSettings.currentWeek = this.currentWeek;
        Storage.set(CONFIG.STORAGE_KEYS.USER_SETTINGS, this.userSettings);
    }
    
    // Gestion des presets
    getPresets() {
        return this.presets;
    }
    
    getPreset(dayType) {
        return this.presets[dayType] || [];
    }
    
    createPreset(dayType, name, exercises = []) {
        if (!this.presets[dayType]) {
            this.presets[dayType] = [];
        }
        
        const preset = {
            id: Utils.generateId(),
            name: name,
            exercises: exercises,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        this.presets[dayType].push(preset);
        this.save();
        return preset;
    }
    
    updatePreset(dayType, presetId, updates) {
        const preset = this.presets[dayType]?.find(p => p.id === presetId);
        if (preset) {
            Object.assign(preset, updates, { modified: new Date().toISOString() });
            this.save();
            return preset;
        }
        return null;
    }
    
    deletePreset(dayType, presetId) {
        if (this.presets[dayType]) {
            this.presets[dayType] = this.presets[dayType].filter(p => p.id !== presetId);
            this.save();
            return true;
        }
        return false;
    }
    
    addExerciseToDay(dayType, exercise) {
        if (!this.presets[dayType]) {
            this.presets[dayType] = [];
        }
        
        const exerciseWithId = {
            ...exercise,
            id: exercise.id || Utils.generateId()
        };
        
        this.presets[dayType].push(exerciseWithId);
        this.save();
        return exerciseWithId;
    }
    
    updateExercise(dayType, exerciseId, updates) {
        const exercises = this.presets[dayType];
        if (exercises) {
            const exercise = exercises.find(e => e.id === exerciseId);
            if (exercise) {
                Object.assign(exercise, updates);
                this.save();
                return exercise;
            }
        }
        return null;
    }
    
    deleteExercise(dayType, exerciseId) {
        if (this.presets[dayType]) {
            this.presets[dayType] = this.presets[dayType].filter(e => e.id !== exerciseId);
            this.save();
            return true;
        }
        return false;
    }
    
    // Gestion des workouts
    getWorkoutKey(week, day) {
        return `week${week}-${day}`;
    }
    
    getWorkout(week, day) {
        const key = this.getWorkoutKey(week, day);
        return this.workoutData[key] || null;
    }
    
    createWorkout(week, day, preset = null) {
        const exercises = preset || this.presets[day] || [];
        const workout = {
            id: Utils.generateId(),
            week: week,
            day: day,
            date: new Date().toISOString(),
            exercises: exercises.map(exercise => ({
                id: exercise.id || Utils.generateId(),
                name: exercise.name,
                category: exercise.category,
                sets: Array(exercise.sets).fill(null).map(() => ({ 
                    reps: '', 
                    weight: '',
                    completed: false 
                })),
                restTime: exercise.restTime
            })),
            notes: '',
            completed: false,
            duration: 0
        };
        
        const key = this.getWorkoutKey(week, day);
        this.workoutData[key] = workout;
        this.save();
        return workout;
    }
    
    updateWorkout(week, day, updates) {
        const key = this.getWorkoutKey(week, day);
        if (this.workoutData[key]) {
            Object.assign(this.workoutData[key], updates, { 
                modified: new Date().toISOString() 
            });
            this.save();
            return this.workoutData[key];
        }
        return null;
    }
    
    updateWorkoutSet(week, day, exerciseId, setIndex, field, value) {
        const workout = this.getWorkout(week, day);
        if (workout) {
            const exercise = workout.exercises.find(e => e.id === exerciseId);
            if (exercise && exercise.sets[setIndex]) {
                if (field === 'weight' && value && !value.includes('kg')) {
                    value = Utils.formatWeight(value);
                }
                exercise.sets[setIndex][field] = value;
                this.updateWorkout(week, day, { exercises: workout.exercises });
                return true;
            }
        }
        return false;
    }
    
    // Statistiques
    getStats() {
        const stats = {
            totalSessions: 0,
            totalWeeks: this.currentWeek,
            sessionsByDay: { Push: 0, Pull: 0, Legs: 0 },
            totalVolume: 0,
            exerciseStats: {},
            weeklyProgress: {},
            recentSessions: []
        };
        
        Object.entries(this.workoutData).forEach(([key, workout]) => {
            if (workout.exercises && workout.exercises.length > 0) {
                stats.totalSessions++;
                stats.sessionsByDay[workout.day] = (stats.sessionsByDay[workout.day] || 0) + 1;
                
                // Volume total
                workout.exercises.forEach(exercise => {
                    exercise.sets.forEach(set => {
                        if (set.reps && set.weight) {
                            const volume = parseInt(set.reps) * Utils.parseWeight(set.weight);
                            stats.totalVolume += volume;
                            
                            // Stats par exercice
                            if (!stats.exerciseStats[exercise.name]) {
                                stats.exerciseStats[exercise.name] = {
                                    totalVolume: 0,
                                    maxWeight: 0,
                                    totalReps: 0,
                                    sessions: 0
                                };
                            }
                            
                            stats.exerciseStats[exercise.name].totalVolume += volume;
                            stats.exerciseStats[exercise.name].totalReps += parseInt(set.reps);
                            stats.exerciseStats[exercise.name].maxWeight = Math.max(
                                stats.exerciseStats[exercise.name].maxWeight,
                                Utils.parseWeight(set.weight)
                            );
                        }
                    });
                });
                
                // Sessions récentes
                stats.recentSessions.push({
                    date: workout.date,
                    day: workout.day,
                    week: workout.week,
                    exercises: workout.exercises.length,
                    notes: workout.notes
                });
            }
        });
        
        // Trier les sessions récentes
        stats.recentSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        stats.recentSessions = stats.recentSessions.slice(0, 10);
        
        return stats;
    }
    
    getProgressData(exerciseName, weeks = 12) {
        const progressData = [];
        
        for (let week = Math.max(1, this.currentWeek - weeks); week <= this.currentWeek; week++) {
            CONFIG.WEEK_CYCLE.forEach(day => {
                const workout = this.getWorkout(week, day);
                if (workout) {
                    const exercise = workout.exercises.find(e => e.name === exerciseName);
                    if (exercise) {
                        const maxWeight = Math.max(...exercise.sets.map(set => 
                            Utils.parseWeight(set.weight)
                        ).filter(w => w > 0));
                        
                        if (maxWeight > 0) {
                            progressData.push({
                                week: week,
                                day: day,
                                date: workout.date,
                                maxWeight: maxWeight,
                                totalVolume: exercise.sets.reduce((sum, set) => {
                                    const reps = parseInt(set.reps) || 0;
                                    const weight = Utils.parseWeight(set.weight);
                                    return sum + (reps * weight);
                                }, 0)
                            });
                        }
                    }
                }
            });
        }
        
        return progressData;
    }
    
    // Gestion des semaines
    setCurrentWeek(week) {
        this.currentWeek = week;
        this.save();
        
        // Mise à jour de l'affichage
        const weekDisplay = document.getElementById('current-week');
        if (weekDisplay) {
            weekDisplay.textContent = week;
        }
    }
    
    getCurrentWeek() {
        return this.currentWeek;
    }
    
    // Import/Export
    exportAllData() {
        const exportData = {
            version: CONFIG.APP_VERSION,
            exportDate: new Date().toISOString(),
            workoutData: this.workoutData,
            presets: this.presets,
            userSettings: this.userSettings
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.workoutData) {
                this.workoutData = { ...this.workoutData, ...data.workoutData };
            }
            
            if (data.presets) {
                this.presets = { ...this.presets, ...data.presets };
            }
            
            if (data.userSettings) {
                this.userSettings = { ...this.userSettings, ...data.userSettings };
            }
            
            this.save();
            return true;
        } catch (error) {
            console.error('Erreur import:', error);
            return false;
        }
    }
    
    resetAllData() {
        if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
            this.workoutData = {};
            this.presets = { ...CONFIG.DEFAULT_PRESETS };
            this.userSettings = {
                currentWeek: 1,
                lastSession: null,
                preferences: {
                    autoSave: true,
                    notifications: true,
                    theme: 'dark'
                }
            };
            this.currentWeek = 1;
            
            Storage.clear();
            this.save();
            return true;
        }
        return false;
    }
}

// Gestionnaire de modales
class ModalManager {
    constructor() {
        this.activeModal = null;
    }
    
    show(modalHtml, options = {}) {
        this.hide(); // Fermer la modale précédente
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = modalHtml;
        
        // Fermeture au clic sur l'overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });
        
        // Fermeture avec Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        document.body.appendChild(overlay);
        this.activeModal = overlay;
        
        // Animation d'entrée
        setTimeout(() => {
            overlay.style.opacity = '1';
            const modal = overlay.querySelector('.modal');
            if (modal) {
                modal.style.transform = 'scale(1)';
            }
        }, 10);
        
        // Focus sur le premier input
        const firstInput = overlay.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Initialiser les icônes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        return overlay;
    }
    
    hide() {
        if (this.activeModal) {
            this.activeModal.style.opacity = '0';
            const modal = this.activeModal.querySelector('.modal');
            if (modal) {
                modal.style.transform = 'scale(0.95)';
            }
            
            setTimeout(() => {
                if (this.activeModal && this.activeModal.parentNode) {
                    this.activeModal.parentNode.removeChild(this.activeModal);
                }
                this.activeModal = null;
            }, 200);
        }
    }
    
    confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const modalHtml = `
                <div class="modal" style="transform: scale(0.95); transition: transform 0.2s;">
                    <div class="modal-header">
                        <h3 class="text-lg font-medium">${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p class="text-slate-300">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="window.modalManager.hide(); window.modalResolve(false);">
                            Annuler
                        </button>
                        <button type="button" class="btn-danger" onclick="window.modalManager.hide(); window.modalResolve(true);">
                            Confirmer
                        </button>
                    </div>
                </div>
            `;
            
            window.modalResolve = resolve;
            this.show(modalHtml);
        });
    }
}

// Initialisation globale
window.dataManager = new DataManager();
window.modalManager = new ModalManager();

// Mise à jour de l'affichage de la semaine
document.addEventListener('DOMContentLoaded', () => {
    const weekDisplay = document.getElementById('current-week');
    if (weekDisplay) {
        weekDisplay.textContent = window.dataManager.getCurrentWeek();
    }
});