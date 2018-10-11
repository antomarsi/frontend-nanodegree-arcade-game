'use strict';

const player_step_x = 100;
const player_step_y = 85;
const NUMBER_OF_ENEMIES = 3;
// Enable this to show bound boxes
var DEBUG = false;

// Object character, base for all charactes with boundbox
class Character {
    constructor(sprite, x, y, width, height) {
        this.sprite = sprite;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    /**
     * @description Getter that will return the Rect of the character
     * @returns {Object} The object with the x, y of the BoundBox and with the width and height
     */
    get boundbox() {
        return {
            x: this.x + this.width * 0.125,
            y: this.y + (this.height * 0.65),
            width: this.width * 0.75,
            height: this.height / 4
        };
    }
    /**
     * @description The render function that draws the sprite
     */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        if (DEBUG) {
            var bb = this.boundbox;
            ctx.beginPath();
            ctx.lineWidth='4';
            ctx.strokeStyle='red';
            ctx.rect(bb.x, bb.y, bb.width, bb.height);
            ctx.stroke();
        }
    }

    /**
     * @description The update method that will run every frame
     * @param {number} the time that elapsed from the last frame
     */
    update(deltaTime) {}
}


// Enemy class
class Enemy extends Character {

    constructor() {
        super('images/enemy-bug.png', 0, 0, 101, 171);
        this.speed = 0;
        this.resetRandomPosition()
    }

    /**
     * @description Reset the enemy position to the left of the screen and with a random Y position in one of the 3 paved rows
     */
    resetRandomPosition() {
        this.x = -this.width;
        this.y = ((Math.floor(Math.random() * 3) +1) * 85) - 85/2
        this.speed = Math.floor(Math.random() * 200) + 10;
    }
    /**
     * @description Update Method that run every frame, move the enemy using the speed, check if he is outside of the
     * canvas, if so, reset his position
     * @param {number} deltatime
     */
    update(deltaTime) {
        this.x += this.speed * deltaTime;
        if (this.x > ctx.canvas.width) {
            this.resetRandomPosition();
        }
    }
}


// Player Class
class Player extends Character {
    constructor() {
        super('images/char-boy.png', 0, 0, 101, 171);
        this.resetPosition();
        this.points = 0;
    }

    /**
     * @description reset the position of the player to the center position of the bottom tile
     */
    resetPosition() {
        this.x = player_step_x * 2;
        this.y = player_step_y * 5 - (this.height/4);
    }

    /**
     * @description Check if the player is in the top tiles (water tiles), if so, reset his position and add a point
     * @param {number} delta psotion
     */
    update(deltaTime) {
        if (this.y == -42.75) {
            this.points++;
            this.resetPosition();
        }
    }
    /**
     * @description This method handles all the player inputs, and limits his position to the edge of the map
     * @param {string} the key that the player pressed
     */
    handleInput(input) {
        switch(input) {
            case 'left':
                this.x -= player_step_x;
                break;
            case 'up':
                this.y -= player_step_y;
                break;
            case 'right':
                this.x += player_step_x;
                break;
            case 'down':
                this.y += player_step_y;
                break;
        }
        // Clamp for the positions
        this.x = Math.min(Math.max(this.x, 0), 400);
        this.y = Math.min(Math.max(this.y, -42.75), 382.25);
    }
    /**
     * @description Check if the player has collided with the given Enemy
     * @param {Enemy} enemy
     * @returns {bool} True if the player has collided with the given Enemy, also, it's resets his score/points to zero and reset his position
     */
    bugCollision(enemy) {
        if (!(enemy instanceof Enemy)) {
            return false;
        }
        var bb = this.boundbox;
        var enemybb = enemy.boundbox;
        if (bb.x < enemybb.x + enemybb.width &&
            bb.x + bb.width > enemybb.x &&
            bb.y < enemybb.y + enemybb.height &&
            bb.y + bb.height > enemybb.y
        ) {
            this.resetPosition();
            this.points = 0;
            return true;
        }
        return false;
    }
}
// CharacterToSelectClass
// Class that will be used to select the skin of the player
class CharacterToSelect extends Character {
    constructor(sprite, x, y, width, height) {
        super(sprite, x, y, width, height)
        this.hovering = false;
    }
    get boundbox() {
        var path = new Path2D();
        path.rect(this.x, this.y, this.width, this.height);
        return path;
    }

    update(deltaTime, mouseinput) {
        this.hovering = false;
        if (ctx.isPointInPath(this.boundbox,mouseinput.x,mouseinput.y)) {
            this.hovering = true;
            if (mouseinput.click) {
                return this.sprite;
            }
        }
        return null;
    }
    render() {
        if (this.hovering) {
            ctx.drawImage(Resources.get('images/Selector.png'), this.x, this.y);
            ctx.globalAlpha = 0.8;
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            ctx.globalAlpha = 1;
        } else {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }

        if (DEBUG) {
            var bb = this.boundbox;
            ctx.beginPath();
            ctx.lineWidth='4';
            ctx.strokeStyle='red';
            ctx.rect(bb.x, bb.y, bb.width, bb.height);
            ctx.stroke();
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
//
var player = new Player();
var playableCharacters = [];
[
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
].forEach(function(charac, idx) {
    playableCharacters.push(new CharacterToSelect(charac, idx * 101, 303, 101, 171));
});
playableCharacters


var allEnemies = [];
for(var i = 0; i < NUMBER_OF_ENEMIES; i++) {
    allEnemies.push(new Enemy());
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        65: 'a'
    };
    if (e.keyCode == 81){
        DEBUG = !DEBUG;
    }

    player.handleInput(allowedKeys[e.keyCode]);
});
