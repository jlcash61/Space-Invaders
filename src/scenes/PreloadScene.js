export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {    
    this.load.image('player', 'assets/images/player.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('fire_button', 'assets/images/fire_button.png');
    this.load.image('start_button', 'assets/images/start_button.png');
    this.load.image('left_button', 'assets/images/left_button.png');
    this.load.image('right_button', 'assets/images/right_button.png');
    this.load.image('barrier', 'assets/images/barrier.png');
  }

  create() {
    // Add the start button
    const startButton = this.add.sprite(400, 300, 'start_button').setInteractive();
    
    // Add click event listener to start the game
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
