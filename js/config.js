const CONFIG = {
    game: {
        gridSize: 20,
        initialSpeed: 8,
        speedIncrease: 0.5,
        maxSpeed: 15,
        gridVisible: true
    },
    snake: {
        initialLength: 3,
        color: '#00ff00',
        glowColor: '#00ff00',
        glowStrength: 10
    },
    food: {
        normalColor: '#ff0000',
        specialColor: '#ff00ff',
        specialFoodChance: 0.1,
        specialFoodPoints: 5,
        glowStrength: 8
    },
    grid: {
        color: '#0f0',
        opacity: 0.1
    },
    audio: {
        backgroundTempo: 120,
        baseVolume: 0.15,
        backgroundNotes: [
            // Ambient pentatonic sequence
            { note: 'C3', duration: 0.5 },
            { note: 'E3', duration: 0.5 },
            { note: 'G3', duration: 0.5 },
            { note: 'A3', duration: 0.5 },
            { note: 'C4', duration: 0.5 },
            { note: 'A3', duration: 0.5 },
            { note: 'G3', duration: 0.5 },
            { note: 'E3', duration: 0.5 }
        ],
        sfx: {
            eat: [
                { note: 'E4', duration: 0.1, volume: 0.2 },
                { note: 'G4', duration: 0.1, volume: 0.2 }
            ],
            death: [
                { note: 'C3', duration: 0.2, volume: 0.3 },
                { note: 'G2', duration: 0.3, volume: 0.3 }
            ],
            specialFood: [
                { note: 'C5', duration: 0.1, volume: 0.2 },
                { note: 'E5', duration: 0.1, volume: 0.2 },
                { note: 'G5', duration: 0.1, volume: 0.2 }
            ]
        }
    },
    debug: {
        showGrid: true,
        showCollisions: true,
        showFPS: true
    }
};
