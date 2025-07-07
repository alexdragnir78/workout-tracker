// Page de statistiques - Analyse des performances

class StatsPage {
    constructor() {
        this.selectedPeriod = 'all';
        this.selectedExercise = null;
        this.stats = null;
    }
    
    render() {
        this.stats = window.dataManager.getStats();
        
        return `
            <div class="max-w-6xl mx-auto space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-white">Statistiques</h1>
                        <p class="text-slate-400 mt-1">Analysez vos performances et votre progression</p>
                    </div>
                    
                    <div class="flex space-x-3">
                        <select id="period-selector" class="form-select" onchange="statsPage.changePeriod(this.value)">
                            <option value="all">Toute la période</option>
                            <option value="month">30 derniers jours</option>
                            <option value="week">7 derniers jours</option>
                            <option value="current">Semaine actuelle</option>
                        </select>
                        <button onclick="statsPage.exportReport()" class="btn-primary">
                            <i data-lucide="file-text" class="w-4 h-4 mr-2"></i>
                            Rapport
                        </button>
                    </div>
                </div>
                
                <!-- Métriques principales -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${this.renderMainMetrics()}
                </div>
                
                <!-- Graphiques et analyses -->
                <div class="grid lg:grid-cols-2 gap-6">
                    <!-- Répartition par jour -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-medium">Répartition des séances</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderSessionDistribution()}
                        </div>
                    </div>
                    
                    <!-- Volume d'entraînement -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-medium">Volume d'entraînement</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderVolumeChart()}
                        </div>
                    </div>
                </div>
                
                <!-- Progression par exercice -->
                <div class="card">
                    <div class="card-header">
                        <div class="flex items-center justify-between">
                            <h3 class="font-medium">Progression par exercice</h3>
                            <select id="exercise-selector" class="form-select" onchange="statsPage.selectExercise(this.value)">
                                <option value="">Sélectionner un exercice</option>
                                ${Object.keys(this.stats.exerciseStats).map(exercise => 
                                    `<option value="${exercise}" ${this.selectedExercise === exercise ? 'selected' : ''}>${exercise}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        ${this.renderExerciseProgression()}
                    </div>
                </div>
                
                <!-- Séances récentes -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="font-medium">Séances récentes</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderRecentSessions()}
                    </div>
                </div>
                
                <!-- Records personnels -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="font-medium">Records personnels</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderPersonalRecords()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMainMetrics() {
        const { totalSessions, totalWeeks, sessionsByDay, totalVolume } = this.stats;
        
        return `
            <div class="stat-card">
                <div class="stat-number text-cyan-500">${totalSessions}</div>
                <div class="stat-label">Séances totales</div>
                <div class="text-xs text-slate-500 mt-1">
                    ${this.calculateWeeklyAverage(totalSessions, totalWeeks).toFixed(1)} par semaine
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number text-green-500">${totalWeeks}</div>
                <div class="stat-label">Semaines d'entraînement</div>
                <div class="text-xs text-slate-500 mt-1">
                    ${this.calculateConsistency()}% de régularité
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number text-orange-500">${this.formatVolume(totalVolume)}</div>
                <div class="stat-label">Volume total</div>
                <div class="text-xs text-slate-500 mt-1">
                    ${this.formatVolume(totalVolume / Math.max(totalSessions, 1))} par séance
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number text-purple-500">${Object.keys(this.stats.exerciseStats).length}</div>
                <div class="stat-label">Exercices pratiqués</div>
                <div class="text-xs text-slate-500 mt-1">
                    ${this.getMostPopularExercise()}
                </div>
            </div>
        `;
    }
    
    renderSessionDistribution() {
        const { sessionsByDay } = this.stats;
        const total = Object.values(sessionsByDay).reduce((sum, count) => sum + count, 0);
        
        if (total === 0) {
            return '<p class="text-slate-400 text-center py-8">Aucune séance enregistrée</p>';
        }
        
        return `
            <div class="space-y-4">
                ${Object.entries(sessionsByDay).map(([day, count]) => {
                    const percentage = total > 0 ? (count / total * 100) : 0;
                    const color = day === 'Push' ? 'bg-orange-500' : 
                                 day === 'Pull' ? 'bg-green-500' : 'bg-blue-500';
                    
                    return `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-4 h-4 rounded ${color}"></div>
                                <span class="font-medium">${day}</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <span class="text-slate-400">${count} séances</span>
                                <span class="font-medium">${percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${day.toLowerCase()}" style="width: ${percentage}%"></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    renderVolumeChart() {
        const weeklyVolume = this.calculateWeeklyVolume();
        
        if (weeklyVolume.length === 0) {
            return '<p class="text-slate-400 text-center py-8">Aucune donnée de volume</p>';
        }
        
        const maxVolume = Math.max(...weeklyVolume.map(w => w.volume));
        
        return `
            <div class="space-y-3">
                <div class="flex justify-between text-sm text-slate-400">
                    <span>Volume par semaine (kg)</span>
                    <span>Max: ${this.formatVolume(maxVolume)}</span>
                </div>
                
                <div class="space-y-2">
                    ${weeklyVolume.slice(-8).map(week => {
                        const height = maxVolume > 0 ? (week.volume / maxVolume * 100) : 0;
                        return `
                            <div class="flex items-center space-x-3">
                                <span class="text-xs text-slate-400 w-16">S${week.week}</span>
                                <div class="flex-1 bg-slate-700 rounded-full h-6 relative">
                                    <div 
                                        class="bg-cyan-500 h-full rounded-full transition-all duration-500"
                                        style="width: ${height}%"
                                    ></div>
                                    <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                        ${this.formatVolume(week.volume)}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    renderExerciseProgression() {
        if (!this.selectedExercise) {
            return `
                <div class="text-center py-8 text-slate-400">
                    <i data-lucide="trending-up" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p>Sélectionnez un exercice pour voir sa progression</p>
                </div>
            `;
        }
        
        const progressData = window.dataManager.getProgressData(this.selectedExercise);
        
        if (progressData.length === 0) {
            return `
                <div class="text-center py-8 text-slate-400">
                    <p>Aucune donnée pour ${this.selectedExercise}</p>
                </div>
            `;
        }
        
        const exerciseStats = this.stats.exerciseStats[this.selectedExercise];
        const latestWeight = progressData[progressData.length - 1]?.maxWeight || 0;
        const firstWeight = progressData[0]?.maxWeight || 0;
        const progression = latestWeight - firstWeight;
        
        return `
            <div class="space-y-6">
                <!-- Métriques de l'exercice -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-slate-700 rounded-lg p-4 text-center">
                        <div class="text-xl font-bold text-cyan-500">${latestWeight}kg</div>
                        <div class="text-sm text-slate-400">Charge actuelle</div>
                    </div>
                    <div class="bg-slate-700 rounded-lg p-4 text-center">
                        <div class="text-xl font-bold ${progression >= 0 ? 'text-green-500' : 'text-red-500'}">
                            ${progression >= 0 ? '+' : ''}${progression}kg
                        </div>
                        <div class="text-sm text-slate-400">Progression</div>
                    </div>
                    <div class="bg-slate-700 rounded-lg p-4 text-center">
                        <div class="text-xl font-bold text-orange-500">${exerciseStats.maxWeight}kg</div>
                        <div class="text-sm text-slate-400">Record</div>
                    </div>
                    <div class="bg-slate-700 rounded-lg p-4 text-center">
                        <div class="text-xl font-bold text-purple-500">${this.formatVolume(exerciseStats.totalVolume)}</div>
                        <div class="text-sm text-slate-400">Volume total</div>
                    </div>
                </div>
                
                <!-- Graphique de progression -->
                <div class="bg-slate-700 rounded-lg p-4">
                    <h4 class="font-medium mb-4">Évolution de la charge maximale</h4>
                    ${this.renderProgressChart(progressData)}
                </div>
            </div>
        `;
    }
    
    renderProgressChart(progressData) {
        if (progressData.length < 2) {
            return '<p class="text-slate-400 text-center py-4">Pas assez de données pour afficher la progression</p>';
        }
        
        const maxWeight = Math.max(...progressData.map(d => d.maxWeight));
        const minWeight = Math.min(...progressData.map(d => d.maxWeight));
        const range = maxWeight - minWeight;
        
        return `
            <div class="relative h-32">
                <svg class="w-full h-full" viewBox="0 0 400 100">
                    <!-- Ligne de progression -->
                    <polyline
                        fill="none"
                        stroke="#06b6d4"
                        stroke-width="2"
                        points="${progressData.map((point, index) => {
                            const x = (index / (progressData.length - 1)) * 380 + 10;
                            const y = range > 0 ? 90 - ((point.maxWeight - minWeight) / range) * 80 : 50;
                            return `${x},${y}`;
                        }).join(' ')}"
                    />
                    
                    <!-- Points de données -->
                    ${progressData.map((point, index) => {
                        const x = (index / (progressData.length - 1)) * 380 + 10;
                        const y = range > 0 ? 90 - ((point.maxWeight - minWeight) / range) * 80 : 50;
                        return `<circle cx="${x}" cy="${y}" r="3" fill="#06b6d4" />`;
                    }).join('')}
                </svg>
                
                <!-- Labels -->
                <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400">
                    <span>S${progressData[0].week}</span>
                    <span>S${progressData[progressData.length - 1].week}</span>
                </div>
            </div>
        `;
    }
    
    renderRecentSessions() {
        const { recentSessions } = this.stats;
        
        if (recentSessions.length === 0) {
            return '<p class="text-slate-400 text-center py-8">Aucune séance récente</p>';
        }
        
        return `
            <div class="space-y-3">
                ${recentSessions.map(session => `
                    <div class="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 rounded-full ${
                                session.day === 'Push' ? 'bg-orange-500' :
                                session.day === 'Pull' ? 'bg-green-500' : 'bg-blue-500'
                            }"></div>
                            <div>
                                <div class="font-medium">${session.day} - Semaine ${session.week}</div>
                                <div class="text-sm text-slate-400">
                                    ${Utils.formatDate(session.date)} • ${session.exercises} exercices
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onclick="statsPage.viewSession(${session.week}, '${session.day}')"
                            class="btn-icon text-slate-400 hover:text-cyan-500"
                        >
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderPersonalRecords() {
        const records = this.calculatePersonalRecords();
        
        if (records.length === 0) {
            return '<p class="text-slate-400 text-center py-8">Aucun record personnel</p>';
        }
        
        return `
            <div class="grid md:grid-cols-2 gap-4">
                ${records.slice(0, 6).map(record => `
                    <div class="bg-slate-700 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium text-white">${record.exercise}</div>
                                <div class="text-sm text-slate-400">${record.category}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xl font-bold text-cyan-500">${record.maxWeight}kg</div>
                                <div class="text-xs text-slate-400">S${record.week}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    init() {
        window.statsPage = this;
    }
    
    refresh() {
        this.stats = window.dataManager.getStats();
        const content = this.render();
        document.getElementById('main-content').innerHTML = content;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    changePeriod(period) {
        this.selectedPeriod = period;
        this.refresh();
    }
    
    selectExercise(exercise) {
        this.selectedExercise = exercise;
        this.refresh();
    }
    
    viewSession(week, day) {
        // Naviguer vers la séance spécifique
        window.dataManager.setCurrentWeek(week);
        const workoutPage = window.router.getPageInstance('workout');
        if (workoutPage) {
            workoutPage.currentWeek = week;
            workoutPage.currentDay = day;
        }
        navigateTo('workout');
    }
    
    exportReport() {
        const reportData = this.generateReport();
        const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-stats-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Rapport exporté avec succès');
    }
    
    generateReport() {
        const { totalSessions, totalWeeks, sessionsByDay, totalVolume, exerciseStats } = this.stats;
        
        return `
RAPPORT DE STATISTIQUES WORKOUT TRACKER
Généré le ${new Date().toLocaleDateString('fr-FR')}

=== RÉSUMÉ GÉNÉRAL ===
Séances totales: ${totalSessions}
Semaines d'entraînement: ${totalWeeks}
Volume total: ${this.formatVolume(totalVolume)}
Moyenne par séance: ${this.formatVolume(totalVolume / Math.max(totalSessions, 1))}
Régularité: ${this.calculateConsistency()}%

=== RÉPARTITION PAR TYPE ===
Push: ${sessionsByDay.Push || 0} séances
Pull: ${sessionsByDay.Pull || 0} séances  
Legs: ${sessionsByDay.Legs || 0} séances

=== TOP EXERCICES ===
${Object.entries(exerciseStats)
  .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
  .slice(0, 10)
  .map(([exercise, stats], index) => 
    `${index + 1}. ${exercise}: ${this.formatVolume(stats.totalVolume)} (Record: ${stats.maxWeight}kg)`
  ).join('\n')}

=== PROGRESSION RÉCENTE ===
${this.stats.recentSessions.slice(0, 5).map(session => 
  `${Utils.formatDate(session.date)}: ${session.day} S${session.week} (${session.exercises} exercices)`
).join('\n')}
        `.trim();
    }
    
    // Méthodes utilitaires
    calculateWeeklyAverage(sessions, weeks) {
        return weeks > 0 ? sessions / weeks : 0;
    }
    
    calculateConsistency() {
        // Calcul basé sur la régularité d'entraînement (3 séances par semaine idéalement)
        const expectedSessions = this.stats.totalWeeks * 3;
        const actualSessions = this.stats.totalSessions;
        return expectedSessions > 0 ? Math.min(100, (actualSessions / expectedSessions) * 100) : 0;
    }
    
    formatVolume(volume) {
        if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'T';
        }
        return Math.round(volume) + 'kg';
    }
    
    getMostPopularExercise() {
        const exerciseStats = this.stats.exerciseStats;
        if (Object.keys(exerciseStats).length === 0) return 'Aucun';
        
        const mostPopular = Object.entries(exerciseStats)
            .sort((a, b) => b[1].totalVolume - a[1].totalVolume)[0];
        
        return `Top: ${mostPopular[0]}`;
    }
    
    calculateWeeklyVolume() {
        const weeklyData = {};
        
        Object.entries(window.dataManager.workoutData).forEach(([key, workout]) => {
            const week = parseInt(key.split('-')[0].replace('week', ''));
            
            if (!weeklyData[week]) {
                weeklyData[week] = { week, volume: 0 };
            }
            
            workout.exercises?.forEach(exercise => {
                exercise.sets?.forEach(set => {
                    if (set.reps && set.weight) {
                        const volume = parseInt(set.reps) * Utils.parseWeight(set.weight);
                        weeklyData[week].volume += volume;
                    }
                });
            });
        });
        
        return Object.values(weeklyData).sort((a, b) => a.week - b.week);
    }
    
    calculatePersonalRecords() {
        const records = [];
        
        Object.entries(this.stats.exerciseStats).forEach(([exerciseName, stats]) => {
            // Trouver la semaine du record
            const progressData = window.dataManager.getProgressData(exerciseName);
            const recordData = progressData.find(d => d.maxWeight === stats.maxWeight);
            
            records.push({
                exercise: exerciseName,
                maxWeight: stats.maxWeight,
                week: recordData?.week || 'N/A',
                category: this.getExerciseCategory(exerciseName)
            });
        });
        
        return records.sort((a, b) => b.maxWeight - a.maxWeight);
    }
    
    getExerciseCategory(exerciseName) {
        // Essayer de déterminer la catégorie basée sur le nom
        const presets = window.dataManager.getPresets();
        
        for (const [dayType, exercises] of Object.entries(presets)) {
            const exercise = exercises.find(e => e.name === exerciseName);
            if (exercise) {
                return exercise.category || dayType;
            }
        }
        
        return 'Autre';
    }
}