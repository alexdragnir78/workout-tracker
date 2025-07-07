// Configuration et constantes pour Workout Tracker

const CONFIG = {
    APP_VERSION: '2.0.0',
    STORAGE_KEYS: {
        WORKOUT_DATA: 'workoutData',
        PRESETS: 'workoutPresets',
        USER_SETTINGS: 'userSettings'
    },
    DEFAULT_PRESETS: {
        Push: [
            { id: 'push-1', name: 'DC Barre', sets: 5, restTime: '3min', category: 'Pectoraux' },
            { id: 'push-2', name: 'DC Incliné', sets: 4, restTime: '3min', category: 'Pectoraux' },
            { id: 'push-3', name: 'Dev Militaire', sets: 4, restTime: '3min', category: 'Épaules' },
            { id: 'push-4', name: 'Écarté Poulie H', sets: 4, restTime: '1m30', category: 'Pectoraux' },
            { id: 'push-5', name: 'Élévation Latéral', sets: 3, restTime: '1m30', category: 'Épaules' },
            { id: 'push-6', name: 'Ext Triceps', sets: 3, restTime: '1m30', category: 'Triceps' }
        ],
        Pull: [
            { id: 'pull-1', name: 'Rowing Barre', sets: 4, restTime: '3min', category: 'Dos' },
            { id: 'pull-2', name: 'Tirage Vertical', sets: 3, restTime: '3min', category: 'Dos' },
            { id: 'pull-3', name: 'Tirage Horizontal', sets: 3, restTime: '3min', category: 'Dos' },
            { id: 'pull-4', name: 'Face Pull', sets: 3, restTime: '1m30', category: 'Épaules' },
            { id: 'pull-5', name: 'Hyperextensions', sets: 3, restTime: '1m30', category: 'Dos' },
            { id: 'pull-6', name: 'Curl Concentré', sets: 3, restTime: '1m30', category: 'Biceps' }
        ],
        Legs: [
            { id: 'legs-1', name: 'Deadlift', sets: 5, restTime: '3min', category: 'Postérieur' },
            { id: 'legs-2', name: 'Squat', sets: 4, restTime: '3min', category: 'Quadriceps' },
            { id: 'legs-3', name: 'Walking Lunges', sets: 3, restTime: '3min', category: 'Fonctionnel' },
            { id: 'legs-4', name: 'Romanian DL', sets: 3, restTime: '1m30', category: 'Postérieur' },
            { id: 'legs-5', name: 'Bulgarian Split', sets: 3, restTime: '1m30', category: 'Unilatéral' }
        ]
    },
    WEEK_CYCLE: ['Push', 'Pull', 'Legs', 'Push', 'Pull'],
    CATEGORIES: {
        Pectoraux: { color: '#f97316', icon: 'activity' },
        Épaules: { color: '#f59e0b', icon: 'target' },
        Dos: { color: '#10b981', icon: 'grid' },
        Biceps: { color: '#3b82f6', icon: 'zap' },
        Triceps: { color: '#8b5cf6', icon: 'flash' },
        Quadriceps: { color: '#ef4444', icon: 'trending-up' },
        Postérieur: { color: '#84cc16', icon: 'arrow-down' },
        Fonctionnel: { color: '#06b6d4', icon: 'rotate-3d' },
        Unilatéral: { color: '#ec4899', icon: 'shuffle' }
    }
};