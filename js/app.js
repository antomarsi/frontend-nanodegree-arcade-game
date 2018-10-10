const player_step_x = 100;
const player_step_y = 85;
const NUMBER_OF_ENEMIES = 3;
// Enable this to show bound boxes
const DEBUG = false;

class Character {
    constructor(sprite, x, y, width, height) {
        this.sprite = sprite;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get boundbox() {
        return {
            x: this.x + this.width * 0.125,
            y: this.y + (this.height * 0.65),
            width: this.width * 0.75,
            height: this.height / 4
        };
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        if (DEBUG) {
            var bb = this.boundbox;
            ctx.beginPath();
            ctx.lineWidth="4";
            ctx.strokeStyle="red";
            ctx.rect(bb.x, bb.y, bb.width, bb.height);
            ctx.stroke();
        }
    }

    update(deltaTime) {}
}

class Enemy extends Character {

    constructor() {
        super('images/enemy-bug.png', 0, 0, 101, 171);
        this.speed = 0;
        this.resetRandomPosition()
    }

    resetRandomPosition() {
        this.x = -this.width;
        this.y = ((Math.floor(Math.random() * 3) +1) * 85) - 85/2
        this.speed = Math.floor(Math.random() * 200) + 10;
    }

    update(deltaTime) {
        this.x += this.speed * deltaTime;
        if (this.x > ctx.canvas.width) {
            this.resetRandomPosition();
        }
    }
}

class Player extends Character {
    constructor() {
        super('images/char-boy.png', 0, 0, 101, 171);
        this.resetPosition();
    }

    resetPosition() {
        this.x = player_step_x * 2;
        this.y = player_step_y * 5 - (this.height/4);
    }
    update(deltaTime) {
        if (this.y == -42.75) {
            console.log("YOU WIN");
            this.resetPosition();
        }
    }

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
            console.log('collision detected');
            this.resetPosition();
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
//
var player = new Player();

var allEnemies = [];
for(var i = 0; i < NUMBER_OF_ENEMIES; i++) {
    allEnemies.push(new Enemy());
}
console.log(allEnemies);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
