export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // Initialize score
    this.highScore = 0; // Initialize high score
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Create the player sprite
    this.player = this.physics.add.sprite(400, 550, 'player'); // Player starts near the bottom
    this.player.setCollideWorldBounds(true);

    // Set up cursor keys for input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create a group for bullets
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: -1 // Unlimited bullets
    });

    // Create a group for enemy bullets
    this.enemyBullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: -1 // Unlimited bullets
    });

    // Create a container for enemies
    this.enemyContainer = this.add.container();

    // Create enemies
    this.createEnemies();

    // Create barriers
    this.createBarriers();

    // Create score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    this.highScoreText = this.add.text(16, 50, 'High Score: ' + this.highScore, { fontSize: '32px', fill: '#000' });

    // Enemy movement direction
    this.enemyDirection = 1;

    // Fire bullets on spacebar press
    this.input.keyboard.on('keydown-SPACE', this.shootBullet, this);

    // Check for collisions between bullets and enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // Check for collisions between player and enemies
    this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);

    // Check for collisions between player and enemy bullets
    this.physics.add.collider(this.player, this.enemyBullets, this.playerHit, null, this);

    // Check for collisions between enemy bullets and barriers
    this.physics.add.collider(this.enemyBullets, this.barriers, this.hitBarrier, null, this);

    // Add touch input for movement and shooting
    this.createControls();

    // Enemy shooting event
    this.time.addEvent({
      delay: 2000, // 2 seconds
      callback: this.enemyShoot,
      callbackScope: this,
      loop: true
    });

    // Bring player to top
    this.children.bringToTop(this.player);
  }

  createControls() {
    // Create left and right buttons for movement
    this.leftButton = this.add.sprite(100, 550, 'left_button').setInteractive();
    this.rightButton = this.add.sprite(200, 550, 'right_button').setInteractive();

    // Track button states
    this.leftButtonPressed = false;
    this.rightButtonPressed = false;

    // Add input listeners for left button
    this.leftButton.on('pointerdown', () => { 
      this.leftButtonPressed = true; 
    });
    this.leftButton.on('pointerup', () => { 
      this.leftButtonPressed = false; 
    });
    this.leftButton.on('pointerout', () => { 
      this.leftButtonPressed = false; 
    });

    // Add input listeners for right button
    this.rightButton.on('pointerdown', () => { 
      this.rightButtonPressed = true; 
    });
    this.rightButton.on('pointerup', () => { 
      this.rightButtonPressed = false; 
    });
    this.rightButton.on('pointerout', () => { 
      this.rightButtonPressed = false; 
    });

    // Create fire button
    this.fireButton = this.add.sprite(700, 550, 'fire_button').setInteractive();
    this.fireButton.on('pointerdown', this.shootBullet, this);
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -300;
    }
  }

  enemyShoot() {
    const enemies = this.enemyContainer.list;
    const randomEnemy = Phaser.Utils.Array.GetRandom(enemies);
    const bullet = this.enemyBullets.get(randomEnemy.x, randomEnemy.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = 100; // Slower enemy bullets
    }
  }

  createEnemies() {
    const numEnemies = 10;
    const spacing = 80;
    const rows = 3;

    this.enemies = this.physics.add.group();

    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < numEnemies; i++) {
        const x = 50 + i * spacing;
        const y = 50 + row * 50;
        const enemy = this.physics.add.sprite(x, y, 'enemy');
        this.enemies.add(enemy);
        this.enemyContainer.add(enemy);
      }
    }

    // Add the enemy container to the scene
    this.add.existing(this.enemyContainer);
  }

  createBarriers() {
    this.barriers = this.physics.add.group();
    const barrierPositions = [200, 400, 600];

    barrierPositions.forEach(pos => {
      const barrier = this.physics.add.sprite(pos, 450, 'barrier');
      barrier.setImmovable(true);
      barrier.body.moves = false; // Ensure barriers do not move
      barrier.setData('hitPoints', 5); // Set initial hit points
      this.barriers.add(barrier);
    });
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();

    // Increment score
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // Check for game over
    if (this.enemies.countActive(true) === 0) {
      this.gameOver();
    }
  }

  playerHit(player, bullet) {
    // Update high score if current score is higher
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    // Reset score
    this.score = 0;

    this.scene.restart();
  }

  hitBarrier(bullet, barrier) {
    bullet.destroy();
    const hitPoints = barrier.getData('hitPoints') - 1;
    barrier.setData('hitPoints', hitPoints);

    if (hitPoints <= 0) {
      barrier.destroy();
    }
  }

  update() {
    // Check for input and move the player accordingly
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // Handle touch input for continuous movement
    if (this.leftButtonPressed) {
      this.player.setVelocityX(-200);
    } else if (this.rightButtonPressed) {
      this.player.setVelocityX(200);
    } else if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.setVelocityX(0);
    }

    // Move enemy container
    this.enemyContainer.x += this.enemyDirection;

    // Check bounds and change direction if necessary
    if (this.enemyContainer.x > 200 || this.enemyContainer.x < -200) {
      this.enemyDirection *= -1;
      this.enemyContainer.y += 10; // Move enemies down when changing direction
    }
  }

  gameOver() {
    // Update high score text
    this.highScoreText.setText('High Score: ' + this.highScore);

    this.scene.start('PreloadScene'); // Go back to the start screen
  }
}
