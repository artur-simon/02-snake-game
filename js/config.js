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
        backgroundTempo: 140,
        baseVolume: 0.15,
        backgroundNotes: [
            // Main melody with 8-bit feel
            { note: 'E4', duration: 0.25 },
            { note: 'G4', duration: 0.25 },
            { note: 'B4', duration: 0.25 },
            { note: 'E5', duration: 0.25 }, // Arpeggio up
            { note: 'B4', duration: 0.25 },
            { note: 'G4', duration: 0.25 },
            { note: 'E4', duration: 0.5 }, // Arpeggio down
            
            { note: 'A4', duration: 0.25 },
            { note: 'C5', duration: 0.25 },
            { note: 'E5', duration: 0.25 },
            { note: 'A5', duration: 0.25 }, // Second arpeggio up
            { note: 'E5', duration: 0.25 },
            { note: 'C5', duration: 0.25 },
            { note: 'A4', duration: 0.5 }, // Second arpeggio down
            
            // Bridge section
            { note: 'G4', duration: 0.25 },
            { note: 'B4', duration: 0.25 },
            { note: 'D5', duration: 0.25 },
            { note: 'F5', duration: 0.25 }, // Tension building
            { note: 'G5', duration: 0.5 },
            { note: 'E5', duration: 0.5 }, // Resolution
        ],
        // Chiptune-style bass line
        bassNotes: [
            { note: 'E2', duration: 0.5 },
            { note: 'E3', duration: 0.25 },
            { note: 'E2', duration: 0.25 },
            { note: 'A2', duration: 0.5 },
            { note: 'A3', duration: 0.25 },
            { note: 'A2', duration: 0.25 },
            { note: 'G2', duration: 0.5 },
            { note: 'G3', duration: 0.25 },
            { note: 'G2', duration: 0.25 },
            { note: 'C3', duration: 0.5 },
            { note: 'C4', duration: 0.25 },
            { note: 'C3', duration: 0.25 }
        ],
        // Add arpeggio patterns
        arpeggios: [
            { note: 'E4', duration: 0.125 },
            { note: 'G4', duration: 0.125 },
            { note: 'B4', duration: 0.125 },
            { note: 'E5', duration: 0.125 }
        ],
        sfx: {
            eat: [
                { note: 'E5', duration: 0.1, volume: 0.2 },
                { note: 'G5', duration: 0.1, volume: 0.15 },
                { note: 'B5', duration: 0.1, volume: 0.1 }
            ],
            death: [
                { note: 'E4', duration: 0.1, volume: 0.3 },
                { note: 'E3', duration: 0.1, volume: 0.3 },
                { note: 'E2', duration: 0.3, volume: 0.3 },
                { note: 'Eb2', duration: 0.4, volume: 0.2 }
            ],
            specialFood: [
                { note: 'E6', duration: 0.1, volume: 0.15 },
                { note: 'G6', duration: 0.1, volume: 0.15 },
                { note: 'B6', duration: 0.1, volume: 0.15 },
                { note: 'E7', duration: 0.2, volume: 0.1 }
            ]
        }
    },
    debug: {
        showGrid: true,
        showCollisions: true,
        showFPS: true
    },
    ranking: {
        maxScores: 10,
        defaultNames: ["CPU_01", "CPU_02", "CPU_03", "CPU_04", "CPU_05", "CPU_06", "CPU_07", "CPU_08", "CPU_09", "CPU_10"],
        defaultScores: [100, 80, 60, 40, 20, 10, 5, 3, 2, 1]
    }
};
