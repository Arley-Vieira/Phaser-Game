import './style.css'
import Phaser from 'phaser'

var config = {
  type: Phaser.WEBGL,
  width: 410,
  height: 303,
  canvas: canvas_id,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: false,
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

var player;

var losesfx;

var foes;

var cursors;

var isMoving = false;

var foeSpeed = -100;
var foespawnTime = 3000;

var foeSpeedIncrement = -5;
var foeSpeedMax = -525;

var foespawnTimeDecrement = 80;
var foespawnTimeMin = 203;

var playerSpeed = 170;

var spawnTimer;

var cloudMGroup;
var cloudMSpawnTimer;
var cloudMSpawnTime = 600;
var cloudMSpeed = -150;

var cloudBGroup;
var cloudBSpawnTimer;
var cloudBSpawnTime = 3000;
var cloudBSpeed = -80;

var gameTimer;
var gameTimeCount = 0;
var textTimer;

var gameOver = false;

function preload() {
  this.load.image('bg', '/assets/bg.png');
  this.load.spritesheet('player', 'assets/player.png', { frameWidth: 52, frameHeight: 29 });
  this.load.spritesheet('foe', 'assets/foe.png', { frameWidth: 24, frameHeight: 18 });
  this.load.image('cloudMed', '/assets/cloudMed.png');
  this.load.image('cloudBig', '/assets/cloudBig.png');
  this.load.audio('lose', '/assets/lose.mp3');

}

function create() {
  this.add.image(400, 300, 'bg');

  losesfx = this.sound.add('lose');

  this.anims.create({
    key: 'idle_player',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'idle_foe',
    frames: this.anims.generateFrameNumbers('foe', { start: 0, end: 1 }),
    frameRate: 8,
    repeat: -1
  });

  cloudMGroup = this.physics.add.group();
  cloudBGroup = this.physics.add.group();
  foes = this.physics.add.group();

  player = this.physics.add.sprite(215, 150, 'player');
  player.setCollideWorldBounds(true);
  player.setSize(36, 12).setOffset(0, 15);
  player.anims.play('idle_player');
  player.setDepth(2);

  cursors = this.input.keyboard.createCursorKeys();

  spawnTimer = this.time.addEvent({
    delay: foespawnTime,
    callback: spawnFoe,
    callbackScope: this,
    loop: true
  });

  cloudMSpawnTimer = this.time.addEvent({
    delay: cloudMSpawnTime,
    callback: spawnCloudM,
    callbackScope: this,
    loop: true
  });

  cloudBSpawnTimer = this.time.addEvent({
    delay: cloudBSpawnTime,
    callback: spawnCloudB,
    callbackScope: this,
    loop: true
  });

  this.physics.add.collider(player, foes, hitPlayer, null, this);

  this.physics.world.setBounds(0, 0, Infinity, this.game.config.height);

  gameTimer = this.time.addEvent({
    delay: 100,
    callback: updateTimer,
    callbackScope: this,
    loop: true
  });

  
  textTimer = this.add.text(155, 15, "      0", {
    font: "25px 'Pixeloid'",
    fill: "#000000",
    align: "right",
    callback: updateTimer
  });
  
  textTimer.setDepth(2.5);
  
  textTimer.setDepth(2.5);

  this.time.addEvent({
    delay: 2500,
    callback: increaseDifficulty,
    callbackScope: this,
    loop: true
  })
}

function spawnFoe() {
  const newfoe = this.physics.add.sprite(500, Phaser.Math.Between(5, 303), 'foe');
  newfoe.setVelocityX(foeSpeed);
  newfoe.anims.play('idle_foe');
  newfoe.setSize(23, 10).setOffset(0, 5);
  foes.add(newfoe);

  newfoe.once('outOfBounds', () => newfoe.destroy());
}

function spawnCloudM() {
  const newCloudMed = this.physics.add.image(500, Phaser.Math.Between(5, 303), 'cloudMed');
  newCloudMed.setVelocityX(cloudMSpeed);
  cloudMGroup.add(newCloudMed);
  

  newCloudMed.once('outOfBounds', () => newCloudMed.destroy());
}

function spawnCloudB() {
  const newCloudBig = this.physics.add.image(500, Phaser.Math.Between(5, 303), 'cloudBig');
  newCloudBig.setVelocityX(cloudBSpeed);
  cloudBGroup.add(newCloudBig);

  newCloudBig.once('outOfBounds', () => newCloudBig.destroy());
}

function hitPlayer(player, foe) {
  losesfx.play()
  gameOver = true;
  player.setFrame(5);
  this.physics.pause();
  this.anims.pauseAll();
  endGame();
  
}

function increaseDifficulty(){
  if (foeSpeed > foeSpeedMax) {
    foeSpeed += foeSpeedIncrement;
  }
  if (foespawnTime > foespawnTimeMin) {
    foespawnTime -= foespawnTimeDecrement;

    //Updates
    spawnTimer.delay = foespawnTime;
  }
}

function endGame() {
  gameOver = true;
  gameTimer.remove();
}

function updateTimer(){
  gameTimeCount++;
  textTimer.setText("      " + gameTimeCount);
}

function update() {
  if (gameOver) {
    return;
  }
  
  foes.children.iterate((foe) => {
    if (foe && foe.x < 0) { 
      foe.destroy();
    } else if (foe) { 
      foe.setVelocityX(foeSpeed);
    }
  });

  cloudMGroup.children.iterate((cloudM) => {
    if (cloudM) {
      cloudM.setVelocityX(cloudMSpeed);
      cloudM.setDepth(0);
    }
  });

  cloudBGroup.children.iterate((cloudB) => {
    if (cloudB) {
      cloudB.setVelocityX(cloudBSpeed);
      cloudB.setDepth(0);
    }
  });

  player.setVelocity(0);
  isMoving = false;

  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
    isMoving = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
    isMoving = true;
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
    isMoving = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
    isMoving = true;
  }

  if (!isMoving) {
    player.setVelocity(0);
  }
}
