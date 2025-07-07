// Page d'entraînement - Interface de suivi des séances

class WorkoutPage {
    constructor() {
        this.currentWeek = 1;
        this.currentDay = 'Push';
        this.currentWorkout = null;
        this.startTime = null;
        this.restTimer = null;
    }
    
    render() {
        this.currentWeek = window.dataManager.getCurrentWeek();
        this.currentWorkout = this.getCurrentWorkout();
        
        return `
            <div class="max-w-6xl mx-auto space-y-6">
                <!-- Navigation des semaines -->
                <div class="week-nav">
                    <button onclick="workoutPage.changeWeek(-1)" class="week-nav-btn">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        <span>Semaine précédente</span>
                    </button>
                    
                    <div class="text-center">
                        <h2 class="text-xl font-bold text-white">
                            <span class="day-indicator ${this.currentDay.toLowerCase()}"></span>
                            ${this.currentDay} - Semaine ${this.currentWeek}
                        </h2>
                        <p class="text-slate-400 text-sm">${new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                    
                    <button onclick="workoutPage.changeWeek(1)" class="week-nav-btn">
                        <span>Semaine suivante</span>
                        <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <!-- Sélecteur de jour -->
                <div class="flex justify-center">
                    <div class="flex space-x-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                        ${CONFIG.WEEK_CYCLE.map((day, index) => `
                            <button 
                                onclick="workoutPage.selectDay('${day}')"
                                class="day-btn ${day.toLowerCase()} ${this.currentDay === day ? 'active' : ''}"
                            >
                                ${day}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tableau d'entraînement -->
                ${this.renderWorkoutTable()}
                
                <!-- Notes de séance -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="font-medium flex items-center">
                            <i data-lucide="file-text" class="w-4 h-4 mr-2"></i>
                            Notes de séance
                        </h3>
                    </div>
                    <div class="card-body">
                        <textarea
                            id="session-notes"
                            class="form-textarea"
                            rows="3"
                            placeholder="Ajoutez vos notes sur cette séance..."
                            onchange="workoutPage.updateNotes(this.value)"
                        >${this.currentWorkout?.notes || ''}</textarea>
                    </div>
                </div>
                
                <!-- Actions rapides -->
                <div class="grid md:grid-cols-3 gap-4">
                    <button onclick="workoutPage.startTimer()" class="btn-primary">
                        <i data-lucide="play" class="w-4 h-4 mr-2"></i>
                        Démarrer chrono
                    </button>
                    <button onclick="workoutPage.markAsCompleted()" class="btn-success">
                        <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                        Marquer terminé
                    </button>
                    <button onclick="workoutPage.resetSession()" class="btn-danger">
                        <i data-lucide="refresh-ccw" class="w-4 h-4 mr-2"></i>
                        Réinitialiser
                    </button>
                </div>
            </div>
            
            <!-- Timer Modal -->
            <div id="timer-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div class="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
                    <h3 class="text-xl font-bold mb-4">Temps de repos</h3>
                    <div id="timer-display" class="text-4xl font-bold text-cyan-500 mb-4">0:00</div>
                    <div class="space-x-3">
                        <button onclick="workoutPage.stopTimer()" class="btn-secondary">Arrêter</button>
                        <button onclick="workoutPage.addTime(30)" class="btn-primary">+30s</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderWorkoutTable() {
        if (!this.currentWorkout || !this.currentWorkout.exercises || this.currentWorkout.exercises.length === 0) {
            return `
                <div class="card">
                    <div class="card-body text-center py-12">
                        <i data-lucide="dumbbell" class="w-16 h-16 mx-auto mb-4 text-slate-400"></i>
                        <h3 class="text-xl font-medium text-white mb-2">Aucun exercice programmé</h3>
                        <p class="text-slate-400 mb-6">Créez des presets dans la page d'accueil pour commencer</p>
                        <button onclick="navigateTo('home')" class="btn-primary">
                            <i data-lucide="settings" class="w-4 h-4 mr-2"></i>
                            Configurer les presets
                        </button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="workout-table">
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="text-left">Exercice</th>
                            <th class="text-center">Rep 1</th>
                            <th class="text-center">Poids 1</th>
                            <th class="text-center">Rep 2</th>
                            <th class="text-center">Poids 2</th>
                            <th class="text-center">Rep 3</th>
                            <th class="text-center">Poids 3</th>
                            <th class="text-center">Rep 4</th>
                            <th class="text-center">Poids 4</th>
                            <th class="text-center">Rep 5</th>
                            <th class="text-center">Poids 5</th>
                            <th class="text-center">Repos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.currentWorkout.exercises.map((exercise, exerciseIndex) => 
                            this.renderExerciseRow(exercise, exerciseIndex)
                        ).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    renderExerciseRow(exercise, exerciseIndex) {
        const maxSets = Math.max(exercise.sets?.length || 0, 5);
        
        return `
            <tr class="exercise-row ${this.currentDay.toLowerCase()}">
                <td class="font-medium">
                    <div class="flex items-center space-x-3">
                        <div class="flex-1">
                            <div class="text-white">${exercise.name}</div>
                            ${exercise.category ? `
                                <div class="text-xs text-slate-400">${exercise.category}</div>
                            ` : ''}
                        </div>
                        <button 
                            onclick="workoutPage.startRestTimer('${exercise.restTime}')"
                            class="btn-icon text-slate-400 hover:text-cyan-500"
                            title="Démarrer le repos"
                        >
                            <i data-lucide="timer" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
                ${Array(5).fill(null).map((_, setIndex) => `
                    <td class="text-center">
                        <input
                            type="number"
                            class="workout-input reps"
                            placeholder="12"
                            value="${exercise.sets[setIndex]?.reps || ''}"
                            onchange="workoutPage.updateSet('${exercise.id}', ${setIndex}, 'reps', this.value)"
                            ${setIndex >= (exercise.sets?.length || 0) ? 'disabled' : ''}
                        >
                    </td>
                    <td class="text-center">
                        <input
                            type="text"
                            class="workout-input weight"
                            placeholder="kg"
                            value="${exercise.sets[setIndex]?.weight || ''}"
                            onchange="workoutPage.updateSet('${exercise.id}', ${setIndex}, 'weight', this.value)"
                            ${setIndex >= (exercise.sets?.length || 0) ? 'disabled' : ''}
                        >
                    </td>
                `).join('')}
                <td class="text-center text-slate-400 text-sm">
                    <div class="flex items-center justify-center space-x-1">
                        <i data-lucide="clock" class="w-3 h-3"></i>
                        <span>${exercise.restTime}</span>
                    </div>
                </td>
            </tr>
        `;
    }
    
    init() {
        window.workoutPage = this;
        this.currentWeek = window.dataManager.getCurrentWeek();
        this.currentWorkout = this.getCurrentWorkout();
    }
    
    refresh() {
        this.currentWorkout = this.getCurrentWorkout();
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getCurrentWorkout() {
        let workout = window.dataManager.getWorkout(this.currentWeek, this.currentDay);
        
        if (!workout) {
            // Créer un nouveau workout basé sur le preset
            const preset = window.dataManager.getPreset(this.currentDay);
            workout = window.dataManager.createWorkout(this.currentWeek, this.currentDay, preset);
        }
        
        return workout;
    }
    
    changeWeek(direction) {
        const newWeek = Math.max(1, this.currentWeek + direction);
        this.currentWeek = newWeek;
        window.dataManager.setCurrentWeek(newWeek);
        this.refresh();
    }
    
    selectDay(day) {
        this.currentDay = day;
        this.refresh();
    }
    
    updateSet(exerciseId, setIndex, field, value) {
        const success = window.dataManager.updateWorkoutSet(
            this.currentWeek, 
            this.currentDay, 
            exerciseId, 
            setIndex, 
            field, 
            value
        );
        
        if (success) {
            // Auto-save notification discrète
            this.showQuickSave();
        }
    }
    
    updateNotes(notes) {
        window.dataManager.updateWorkout(this.currentWeek, this.currentDay, { notes });
        this.showQuickSave();
    }
    
    showQuickSave() {
        // Affichage discret de la sauvegarde
        const saveIndicator = document.createElement('div');
        saveIndicator.className = 'fixed top-4 left-4 bg-green-600 text-white px-3 py-1 rounded text-sm z-50 transition-opacity';
        saveIndicator.textContent = 'Sauvegardé';
        saveIndicator.style.opacity = '0';
        
        document.body.appendChild(saveIndicator);
        
        setTimeout(() => saveIndicator.style.opacity = '1', 10);
        setTimeout(() => {
            saveIndicator.style.opacity = '0';
            setTimeout(() => document.body.removeChild(saveIndicator), 300);
        }, 1500);
    }
    
    startTimer() {
        if (!this.restTimer) {
            this.startRestTimer('3min');
        }
    }
    
    startRestTimer(restTime) {
        const seconds = this.parseRestTimeToSeconds(restTime);
        let remainingTime = seconds;
        
        const modal = document.getElementById('timer-modal');
        const display = document.getElementById('timer-display');
        
        modal.classList.remove('hidden');
        
        this.restTimer = setInterval(() => {
            const minutes = Math.floor(remainingTime / 60);
            const secs = remainingTime % 60;
            display.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
            
            if (remainingTime <= 0) {
                this.stopTimer();
                this.playNotificationSound();
                showToast('Temps de repos terminé !', 'success');
            }
            
            remainingTime--;
        }, 1000);
    }
    
    stopTimer() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        
        const modal = document.getElementById('timer-modal');
        modal.classList.add('hidden');
    }
    
    addTime(seconds) {
        // Ajouter du temps au timer actuel
        const display = document.getElementById('timer-display');
        const currentTime = display.textContent.split(':');
        const currentSeconds = parseInt(currentTime[0]) * 60 + parseInt(currentTime[1]);
        const newSeconds = currentSeconds + seconds;
        
        const minutes = Math.floor(newSeconds / 60);
        const secs = newSeconds % 60;
        display.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    playNotificationSound() {
        // Son de notification simple
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    markAsCompleted() {
        const workout = this.currentWorkout;
        if (!workout) return;
        
        // Vérifier si au moins un set est complété
        const hasData = workout.exercises.some(exercise => 
            exercise.sets.some(set => set.reps || set.weight)
        );
        
        if (!hasData) {
            showToast('Ajoutez au moins quelques données avant de marquer comme terminé', 'error');
            return;
        }
        
        // Calculer la durée si elle n'est pas déjà définie
        const duration = this.startTime ? 
            Math.round((Date.now() - this.startTime) / 1000 / 60) : 0;
        
        const updates = {
            completed: true,
            completedAt: new Date().toISOString(),
            duration: duration
        };
        
        window.dataManager.updateWorkout(this.currentWeek, this.currentDay, updates);
        
        showToast('Séance marquée comme terminée !', 'success');
        
        // Proposer de passer au jour suivant
        setTimeout(() => {
            this.suggestNextDay();
        }, 1500);
    }
    
    suggestNextDay() {
        const currentIndex = CONFIG.WEEK_CYCLE.indexOf(this.currentDay);
        const nextIndex = (currentIndex + 1) % CONFIG.WEEK_CYCLE.length;
        const nextDay = CONFIG.WEEK_CYCLE[nextIndex];
        
        // Si on passe de Pull à Push, proposer la semaine suivante
        const nextWeek = (this.currentDay === 'Pull' && nextDay === 'Push') ? 
            this.currentWeek + 1 : this.currentWeek;
        
        const modalHtml = `
            <div class="modal" style="transform: scale(0.95); transition: transform 0.2s;">
                <div class="modal-header">
                    <h3 class="text-lg font-medium">Séance terminée !</h3>
                </div>
                <div class="modal-body text-center space-y-4">
                    <div class="text-6xl">🎉</div>
                    <p class="text-slate-300">
                        Excellent travail ! Voulez-vous passer à la prochaine séance ?
                    </p>
                    <div class="bg-slate-700 rounded-lg p-4">
                        <div class="text-sm text-slate-400">Prochaine séance :</div>
                        <div class="text-lg font-medium text-white">
                            ${nextDay} - Semaine ${nextWeek}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="window.modalManager.hide()">
                        Rester ici
                    </button>
                    <button type="button" class="btn-primary" onclick="workoutPage.goToNextSession(${nextWeek}, '${nextDay}')">
                        Prochaine séance
                    </button>
                </div>
            </div>
        `;
        
        window.modalManager.show(modalHtml);
    }
    
    goToNextSession(week, day) {
        this.currentWeek = week;
        this.currentDay = day;
        window.dataManager.setCurrentWeek(week);
        window.modalManager.hide();
        this.refresh();
    }
    
    async resetSession() {
        const confirmed = await window.modalManager.confirm(
            'Êtes-vous sûr de vouloir réinitialiser cette séance ? Toutes les données saisies seront perdues.',
            'Réinitialiser la séance'
        );
        
        if (confirmed) {
            // Supprimer le workout actuel
            const key = window.dataManager.getWorkoutKey(this.currentWeek, this.currentDay);
            delete window.dataManager.workoutData[key];
            window.dataManager.save();
            
            showToast('Séance réinitialisée');
            this.refresh();
        }
    }
    
    // Méthodes utilitaires
    parseRestTimeToSeconds(restTime) {
        if (restTime.includes('h')) {
            return parseFloat(restTime) * 3600;
        } else if (restTime.includes('m')) {
            const match = restTime.match(/(\d+)m(\d+)?/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = match[2] ? parseInt(match[2]) : 0;
                return minutes * 60 + seconds;
            }
            return parseFloat(restTime) * 60;
        } else {
            return parseFloat(restTime) || 90; // Default 90 seconds
        }
    }
    
    cleanup() {
        // Nettoyage lors du changement de page
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        
        const modal = document.getElementById('timer-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}