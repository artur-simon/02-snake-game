let snake;
let food;
let gridSize;
let score = 0;
let gameStarted = false;
let gameOver = false;
let showDebug = false;
let audioCtx;
let backgroundSequencer;
let highScores = [];
let isNewHighScore = false;
let playerName = "";
let showingLeaderboard = false;
let database;

class Snake {
    constructor() {
        console.log('Creating new snake...');
        this.body = [];
        this.size = CONFIG.game.gridSize;
        this.direction = createVector(1, 0);
        this.nextDirection = this.direction.copy();
        this.speed = CONFIG.game.initialSpeed;
        
        // Initialize snake in the middle of the grid
        const startX = floor(width / (2 * this.size)) * this.size;
        const startY = floor(height / (2 * this.size)) * this.size;
        
        for (let i = 0; i < CONFIG.snake.initialLength; i++) {
            this.body.push(createVector(startX - i * this.size, startY));
        }
        console.log(`Snake created at position (${startX}, ${startY})`);
    }

    update() {
        if (!gameStarted) return;
        
        // Log movement
        console.log(`Snake moving: ${this.direction.x}, ${this.direction.y}`);

        // Update direction
        this.direction = this.nextDirection.copy();

        // Move body
        for (let i = this.body.length - 1; i > 0; i--) {
            this.body[i] = this.body[i - 1].copy();
        }

        // Move head
        this.body[0].add(p5.Vector.mult(this.direction, this.size));

        // Check wall collision
        if (this.body[0].x < 0) this.body[0].x = width - this.size;
        if (this.body[0].x >= width) this.body[0].x = 0;
        if (this.body[0].y < 0) this.body[0].y = height - this.size;
        if (this.body[0].y >= height) this.body[0].y = 0;

        // Log collisions
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[0].equals(this.body[i])) {
                console.log('Snake collision detected!');
                gameOver = true;
                playSfx(CONFIG.audio.sfx.death);
            }
        }
    }

    draw() {
        // Draw snake body
        for (let i = 0; i < this.body.length; i++) {
            const alpha = map(i, 0, this.body.length, 255, 100);
            fill(0, 255, 0, alpha);
            noStroke();
            rect(this.body[i].x, this.body[i].y, this.size, this.size);
            
            // Add glow effect
            drawingContext.shadowBlur = CONFIG.snake.glowStrength;
            drawingContext.shadowColor = CONFIG.snake.glowColor;
        }
        
        // Reset shadow for other elements
        drawingContext.shadowBlur = 0;
    }

    setDirection(x, y) {
        // Prevent 180-degree turns
        if (this.direction.x !== -x || this.direction.y !== -y) {
            this.nextDirection = createVector(x, y);
        }
    }

    grow() {
        console.log(`Snake growing! New length: ${this.body.length + 1}`);
        // Add new segment at the end of the snake
        const tail = this.body[this.body.length - 1].copy();
        this.body.push(tail);
        
        // Increase speed
        this.speed = min(this.speed + CONFIG.game.speedIncrease, CONFIG.game.maxSpeed);
        console.log(`Speed increased to: ${this.speed}`);
    }
}

class Food {
    constructor() {
        console.log('Spawning new food...');
        this.size = CONFIG.game.gridSize;
        this.pos = this.getRandomPosition();
        this.isSpecial = random() < CONFIG.food.specialFoodChance;
        this.glowIntensity = 0;
        console.log(`Food spawned at (${this.pos.x}, ${this.pos.y}), Special: ${this.isSpecial}`);
    }

    getRandomPosition() {
        const cols = floor(width / this.size);
        const rows = floor(height / this.size);
        return createVector(
            floor(random(cols)) * this.size,
            floor(random(rows)) * this.size
        );
    }

    draw() {
        // Update glow intensity
        this.glowIntensity = sin(frameCount * 0.1) * 5;

        // Set glow effect
        drawingContext.shadowBlur = CONFIG.food.glowStrength + this.glowIntensity;
        drawingContext.shadowColor = this.isSpecial ? CONFIG.food.specialColor : CONFIG.food.normalColor;

        // Draw food
        fill(this.isSpecial ? CONFIG.food.specialColor : CONFIG.food.normalColor);
        noStroke();
        rect(this.pos.x, this.pos.y, this.size, this.size);

        // Reset shadow
        drawingContext.shadowBlur = 0;
    }
}

function setup() {
    console.log('Game Initializing...');
    createCanvas(600, 600);
    snake = new Snake();
    food = new Food();
    gridSize = CONFIG.game.gridSize;
    initializeFirebase();
    console.log('Game Initialized');
}

function draw() {
    background(0);
    
    // Draw grid if enabled
    if (CONFIG.game.gridVisible) {
        drawGrid();
    }

    // Update game state
    if (!gameOver) {
        if (frameCount % floor(60/snake.speed) === 0) {
            snake.update();
            checkFoodCollision();
        }
    }

    // Draw game elements
    food.draw();
    snake.draw();

    // Draw UI
    drawUI();
    
    if (showDebug) {
        drawDebugPanel();
    }
}

function drawGrid() {
    stroke(CONFIG.grid.color);
    strokeWeight(1);
    fill(0, 0, 0, 0);
    
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            rect(x, y, gridSize, gridSize);
        }
    }
}

function drawUI() {
    push();
    
    // Score display
    fill(0, 255, 0);
    noStroke();
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 20, 20);
    
    if (gameOver) {
        // Game over panel
        fill(0, 0, 0, 200);
        stroke(0, 255, 0);
        strokeWeight(2);
        rectMode(CENTER);
        rect(width/2, height/2, 400, 250, 10);
        
        // Game over text with glow
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = '#ff0000';
        fill(255, 0, 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(32);
        text('GAME OVER', width/2, height/2 - 80);
        
        if (isNewHighScore) {
            // High score text with glow
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = '#00ff00';
            fill(0, 255, 0);
            textSize(24);
            text('NEW HIGH SCORE!', width/2, height/2 - 20);
            
            // Input field background
            fill(0, 0, 0, 150);
            stroke(0, 255, 0);
            strokeWeight(1);
            rectMode(CENTER);
            rect(width/2, height/2 + 80, 200, 40, 5);
            
            // Name input text
            noStroke();
            text('Enter your name:', width/2, height/2 + 30);
            text(playerName + '_', width/2, height/2 + 80);
        } else {
            // Restart instruction with pulse
            const pulseIntensity = sin(frameCount * 0.05) * 127 + 128;
            fill(0, pulseIntensity, 0);
            textSize(20);
            text('Press SPACE to restart', width/2, height/2 + 40);
        }
    } else if (showingLeaderboard || !gameStarted) {
        drawLeaderboard();
    }
    
    pop();
}

function drawLeaderboard() {
    push();
    
    // Background panel
    fill(0, 0, 0, 200);
    stroke(0, 255, 0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(width/2, height/2, 300, 400, 10); // Rounded corners
    
    // Title with glow
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = '#00ff00';
    fill(0, 255, 0);
    noStroke();
    textAlign(CENTER);
    textSize(32);
    text('TOP SCORES', width/2, height/4);
    
    // Reset glow for other text
    drawingContext.shadowBlur = 0;
    
    textSize(20);
    textAlign(CENTER);
    let y = height/3;
    
    // Scores list
    highScores.slice(0, CONFIG.ranking.maxScores).forEach((entry, i) => {
        // Medal colors with glow
        const colors = {
            0: { fill: '#FFD700', glow: '#FFD700' }, // Gold
            1: { fill: '#C0C0C0', glow: '#C0C0C0' }, // Silver
            2: { fill: '#CD7F32', glow: '#CD7F32' }  // Bronze
        };
        
        if (i < 3) {
            drawingContext.shadowBlur = 10;
            drawingContext.shadowColor = colors[i].glow;
            fill(colors[i].fill);
        } else {
            fill(0, 255, 0);
        }
        
        text(`${i + 1}. ${entry.name}: ${entry.score}`, width/2, y);
        y += 30;
    });
    
    if (!gameStarted) {
        // Instruction text with pulsing effect
        const pulseIntensity = sin(frameCount * 0.05) * 127 + 128;
        fill(0, pulseIntensity, 0);
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = '#00ff00';
        text('Press SPACE to start', width/2, height - 100);
    }
    
    pop();
}

function checkFoodCollision() {
    if (snake.body[0].equals(food.pos)) {
        console.log(`Food collected! Score: ${score} -> ${score + (food.isSpecial ? CONFIG.food.specialFoodPoints : 1)}`);
        score += food.isSpecial ? CONFIG.food.specialFoodPoints : 1;
        snake.grow();
        food = new Food();
        playSfx(food.isSpecial ? CONFIG.audio.sfx.specialFood : CONFIG.audio.sfx.eat);
        
        // Check for high score
        if (checkHighScore(score)) {
            console.log('New high score achieved!');
        }
    }
}

function keyPressed() {
    console.log(`Key pressed: ${key} (code: ${keyCode})`);
    
    if (!audioCtx) {
        initAudio();
    }

    if ((key === 'D' || key === 'd') && keyIsDown(ALT)) {
        console.log('Debug panel toggled');
        showDebug = !showDebug;
        return;
    }

    // Handle high score input first
    if (gameOver && isNewHighScore) {
        if (keyCode === ENTER && playerName.length > 0) {
            console.log(`Saving high score for ${playerName}: ${score}`);
            saveScore(playerName, score);
            isNewHighScore = false;
            playerName = "";
            // Now the game can be reset
            gameOver = true;  // Keep game over state
        } else if (keyCode === BACKSPACE) {
            playerName = playerName.slice(0, -1);
        } else if (keyCode >= 48 && keyCode <= 90 && playerName.length < 10) {
            playerName += key;
        }
        return;  // Prevent any other key handling during high score input
    }

    // Only handle space key when not entering high score
    if (key === ' ') {
        if (gameOver && !isNewHighScore) {  // Only reset if not entering high score
            resetGame();
        } else if (!gameStarted) {
            gameStarted = true;
            if (backgroundSequencer) backgroundSequencer.play();
        }
    }

    // Movement controls
    if (keyCode === UP_ARROW) snake.setDirection(0, -1);
    if (keyCode === DOWN_ARROW) snake.setDirection(0, 1);
    if (keyCode === LEFT_ARROW) snake.setDirection(-1, 0);
    if (keyCode === RIGHT_ARROW) snake.setDirection(1, 0);
}

function resetGame() {
    console.log('Resetting game...');
    snake = new Snake();
    food = new Food();
    score = 0;
    gameStarted = false;
    gameOver = false;
    isNewHighScore = false;
    playerName = "";
    console.log('Game reset complete');
}

// Audio Functions
function initAudio() {
    console.log('Initializing audio...');
    if (audioCtx) {
        console.log('Audio already initialized');
        return;
    }
    
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        backgroundSequencer = new Sequencer(audioCtx, CONFIG.audio.backgroundTempo);
        console.log('Audio initialization successful');
        return true;
    } catch (e) {
        console.error('Audio initialization failed:', e);
        return false;
    }
}

function noteToFreq(note) {
    const notes = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11};
    const octave = parseInt(note.slice(-1));
    const semitone = notes[note.slice(0, -1)];
    return 440 * Math.pow(2, (octave - 4 + (semitone - 9) / 12));
}

class Sequencer {
    constructor(audioContext, tempo) {
        this.audioCtx = audioContext;
        this.tempo = tempo;
        this.noteTime = this.audioCtx.currentTime;
        this.currentNote = 0;
        this.isPlaying = false;

        // Create audio nodes
        this.filter = this.audioCtx.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.value = 1000;
        
        this.mainGain = this.audioCtx.createGain();
        this.mainGain.gain.value = CONFIG.audio.baseVolume;
        
        // Connect nodes
        this.filter.connect(this.mainGain);
        this.mainGain.connect(this.audioCtx.destination);
        
        // Add square wave oscillator for chiptune sound
        this.oscType = 'square';
        
        // Add arpeggiator state
        this.arpCounter = 0;
        this.arpSpeed = 16; // 16th notes for arpeggios
    }

    play() {
        if (!this.isPlaying) {
            console.log('Starting background music...');
            this.isPlaying = true;
            this.noteTime = this.audioCtx.currentTime;
            this.currentNote = 0;
            this.scheduleNotes(); // Start scheduling notes
        }
    }

    stop() {
        console.log('Stopping background music...');
        this.isPlaying = false;
        // No need to explicitly stop scheduled notes as they'll stop on next check
    }

    scheduleNotes() {
        if (!this.isPlaying) return;

        while (this.noteTime < this.audioCtx.currentTime + 0.2) {
            let contextPlayTime = this.noteTime;
            let currentNote = CONFIG.audio.backgroundNotes[this.currentNote];
            
            this.playNote(currentNote.note, contextPlayTime, currentNote.duration);
            this.moveNote();
        }
        requestAnimationFrame(() => this.scheduleNotes());
    }

    moveNote() {
        let secondsPerBeat = 60.0 / this.tempo;
        this.currentNote++;
        if (this.currentNote === CONFIG.audio.backgroundNotes.length) {
            this.currentNote = 0;
        }
        this.noteTime += secondsPerBeat;
    }

    playNote(note, time, duration, isBass) {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        // Use square wave for melody, triangle for bass
        osc.type = isBass ? 'triangle' : this.oscType;
        
        // Add slight detuning for richer sound
        const detune = isBass ? 0 : (Math.random() - 0.5) * 5;
        osc.detune.value = detune;
        
        // Connect through filter chain
        osc.connect(gainNode);
        gainNode.connect(isBass ? this.bassFilter : this.filter);
        
        const freq = noteToFreq(note);
        osc.frequency.value = freq;
        
        // Chiptune-style envelope
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(
            isBass ? 0.4 : 0.2,
            time + 0.01 // Quick attack
        );
        gainNode.gain.setValueAtTime(
            isBass ? 0.3 : 0.15,
            time + duration - 0.05 // Hold
        );
        gainNode.gain.linearRampToValueAtTime(
            0.001,
            time + duration // Quick release
        );
        
        osc.start(time);
        osc.stop(time + duration);

        // Add arpeggio notes if it's a melody note
        if (!isBass && duration > 0.3) {
            CONFIG.audio.arpeggios.forEach((arpNote, i) => {
                const arpTime = time + (i * duration / this.arpSpeed);
                if (arpTime < time + duration) {
                    this.playArpeggioNote(arpNote.note, arpTime, duration / this.arpSpeed);
                }
            });
        }
    }

    playArpeggioNote(note, time, duration) {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.type = 'square';
        osc.connect(gainNode);
        gainNode.connect(this.filter);
        
        const freq = noteToFreq(note);
        osc.frequency.value = freq;
        
        // Very short envelope for arpeggio notes
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(0.1, time + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.001, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }
}

function playSfx(notes) {
    if (!audioCtx) {
        if (!initAudio()) return;
    }
    
    notes.forEach((note, index) => {
        try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            // Set up filter
            filter.type = "bandpass";
            filter.frequency.value = 1000;
            filter.Q.value = 1;
            
            // Connect nodes
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            const freq = noteToFreq(note.note);
            osc.frequency.value = freq;
            
            const time = audioCtx.currentTime + index * 0.1;
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(note.volume || 0.2, time + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + note.duration);
            
            osc.start(time);
            osc.stop(time + note.duration);
        } catch (e) {
            console.error('Error playing sound effect:', e);
        }
    });
}

function toggleAudio() {
    console.log('Toggling audio...');
    if (!audioCtx) {
        if (!initAudio()) return;
    }
    
    if (backgroundSequencer.isPlaying) {
        console.log('Audio stopped');
        backgroundSequencer.stop();
        document.getElementById('muteButton').textContent = '🔇';
    } else {
        console.log('Audio started');
        backgroundSequencer.play(); // This will now properly start the music
        document.getElementById('muteButton').textContent = '🔊';
    }
}

function drawDebugPanel() {
    if (!showDebug) return;

    push();
    colorMode(RGB, 255);
    
    // Semi-transparent background
    fill(200, 200, 200, 50);
    stroke(200, 200, 200);
    strokeWeight(1);
    rect(10, height - 420, 200, 370);

    // Debug text
    fill(255, 255, 255);
    noStroke();
    textAlign(LEFT);
    textSize(12);
    let y = height - 400;
    const lineHeight = 15;

    // Performance
    text(`FPS: ${Math.round(frameRate())}`, 20, y);
    y += lineHeight;

    // Game State
    text(`Game State:`, 20, y);
    y += lineHeight;
    text(`├─ Started: ${gameStarted}`, 30, y);
    y += lineHeight;
    text(`├─ Game Over: ${gameOver}`, 30, y);
    y += lineHeight;
    text(`├─ Score: ${score}`, 30, y);
    y += lineHeight;
    text(`└─ Snake Speed: ${snake.speed.toFixed(2)}`, 30, y);
    y += lineHeight * 2;

    // Snake Stats
    text(`Snake:`, 20, y);
    y += lineHeight;
    text(`├─ Length: ${snake.body.length}`, 30, y);
    y += lineHeight;
    text(`├─ Position: (${Math.round(snake.body[0].x)}, ${Math.round(snake.body[0].y)})`, 30, y);
    y += lineHeight;
    text(`├─ Direction: (${snake.direction.x}, ${snake.direction.y})`, 30, y);
    y += lineHeight;
    text(`└─ Next Direction: (${snake.nextDirection.x}, ${snake.nextDirection.y})`, 30, y);
    y += lineHeight * 2;

    // Food Stats
    text(`Food:`, 20, y);
    y += lineHeight;
    text(`├─ Position: (${Math.round(food.pos.x)}, ${Math.round(food.pos.y)})`, 30, y);
    y += lineHeight;
    text(`├─ Is Special: ${food.isSpecial}`, 30, y);
    y += lineHeight;
    text(`└─ Glow: ${food.glowIntensity.toFixed(2)}`, 30, y);
    y += lineHeight * 2;

    // System
    text(`System:`, 20, y);
    y += lineHeight;
    text(`├─ Grid Size: ${gridSize}`, 30, y);
    y += lineHeight;
    text(`├─ Frame: ${frameCount}`, 30, y);
    y += lineHeight;
    text(`└─ Audio: ${audioCtx ? (backgroundSequencer?.isPlaying ? 'PLAYING' : 'MUTED') : 'NOT INIT'}`, 30, y);

    pop();
}

function initializeFirebase() {
    console.log('Initializing Firebase...');
    database = firebase.database();
    loadHighScores();
}

function loadHighScores() {
    console.log('Loading high scores...');
    database.ref('scores').orderByChild('score').limitToLast(CONFIG.ranking.maxScores).once('value')
        .then((snapshot) => {
            highScores = [];
            snapshot.forEach((childSnapshot) => {
                highScores.unshift(childSnapshot.val());
            });
            console.log('High scores loaded:', highScores);
        })
        .catch((error) => {
            console.error("Error loading scores:", error);
            console.log('Falling back to default scores');
            highScores = CONFIG.ranking.defaultNames.map((name, i) => ({
                name: name,
                score: CONFIG.ranking.defaultScores[i]
            }));
        });
}

function saveScore(name, score) {
    console.log(`Attempting to save score - Name: ${name}, Score: ${score}`);
    const newScore = {
        name: name,
        score: score,
        timestamp: Date.now()
    };
    console.log('New score object:', newScore);
    
    database.ref('scores').push(newScore)
        .then(() => {
            console.log('Score saved successfully');
            loadHighScores();
        })
        .catch((error) => {
            console.error("Error saving score:", error);
        });
}

function checkHighScore(score) {
    console.log(`Checking if ${score} is a high score...`);
    const isHigh = highScores.length < CONFIG.ranking.maxScores || score > highScores[highScores.length - 1].score;
    console.log(`High score check result: ${isHigh}`);
    if (isHigh) {
        isNewHighScore = true;
    }
    return isHigh;
}
