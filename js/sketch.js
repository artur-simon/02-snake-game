let snake;
let food;
let gridSize;
let score = 0;
let gameStarted = false;
let gameOver = false;
let showDebug = false;
let audioCtx;
let backgroundSequencer;

class Snake {
    constructor() {
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
    }

    update() {
        if (!gameStarted) return;

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

        // Check self collision
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[0].equals(this.body[i])) {
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
        // Add new segment at the end of the snake
        const tail = this.body[this.body.length - 1].copy();
        this.body.push(tail);
        
        // Increase speed
        this.speed = min(this.speed + CONFIG.game.speedIncrease, CONFIG.game.maxSpeed);
    }
}

class Food {
    constructor() {
        this.size = CONFIG.game.gridSize;
        this.pos = this.getRandomPosition();
        this.isSpecial = random() < CONFIG.food.specialFoodChance;
        this.glowIntensity = 0;
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
    createCanvas(600, 600);
    snake = new Snake();
    food = new Food();
    gridSize = CONFIG.game.gridSize;
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
    fill(0, 255, 0);
    noStroke();
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 20, 20);
    
    if (gameOver) {
        textAlign(CENTER, CENTER);
        textSize(32);
        text('GAME OVER', width/2, height/2);
        textSize(20);
        text('Press SPACE to restart', width/2, height/2 + 40);
    } else if (!gameStarted) {
        textAlign(CENTER, CENTER);
        textSize(32);
        text('NEURAL SNAKE', width/2, height/2);
        textSize(20);
        text('Use arrow keys to move', width/2, height/2 + 40);
        text('Press SPACE to start', width/2, height/2 + 70);
    }
    pop();
}

function checkFoodCollision() {
    if (snake.body[0].equals(food.pos)) {
        score += food.isSpecial ? CONFIG.food.specialFoodPoints : 1;
        snake.grow();
        food = new Food();
        playSfx(food.isSpecial ? CONFIG.audio.sfx.specialFood : CONFIG.audio.sfx.eat);
    }
}

function keyPressed() {
    if (!audioCtx) {
        initAudio();
    }

    if (key === ' ') {
        if (gameOver) {
            resetGame();
        } else if (!gameStarted) {
            gameStarted = true;
            if (backgroundSequencer) backgroundSequencer.play();
        }
    }

    if (keyCode === UP_ARROW) snake.setDirection(0, -1);
    if (keyCode === DOWN_ARROW) snake.setDirection(0, 1);
    if (keyCode === LEFT_ARROW) snake.setDirection(-1, 0);
    if (keyCode === RIGHT_ARROW) snake.setDirection(1, 0);
    
    if (key === 'D' || key === 'd') {
        showDebug = !showDebug;
    }
}

function resetGame() {
    snake = new Snake();
    food = new Food();
    score = 0;
    gameStarted = false;
    gameOver = false;
}

// Audio Functions
function initAudio() {
    if (audioCtx) return; // Prevent multiple initializations
    
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        backgroundSequencer = new Sequencer(audioCtx, CONFIG.audio.backgroundTempo);
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
    }

    play() {
        this.isPlaying = true;
    }

    stop() {
        this.isPlaying = false;
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

    playNote(note, time, duration) {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.filter);
        
        const freq = noteToFreq(note);
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.exponentialRampToValueAtTime(0.3, time + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
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
    if (!audioCtx) {
        if (!initAudio()) return;
    }
    
    if (backgroundSequencer.isPlaying) {
        backgroundSequencer.stop();
        document.getElementById('muteButton').textContent = '🔇';
    } else {
        backgroundSequencer.play();
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
