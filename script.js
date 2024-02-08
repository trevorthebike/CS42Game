var start ={
    key: 'start',
    active: true,
    preload: startloadScene,
    create: startbuildGame,
}

var main ={
    key: 'main',
    active: false,
    preload: mainloadScene,
    create: mainbuildGame,
    update: mainaction
}

var win ={
  key: 'win',
  active: false,
  preload: winloadScene,
  create: winbuildGame,
}

var death ={
    key: 'death',
    active: false,
    preload: deathloadScene,
    create: deathbuildGame,
}

let config = {
    type: Phaser.AUTO,
    pixelArt: true,
    zoom: 1, 
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000,
        height: 700
    },
    physics: {
        default: 'arcade',
    },
    scene: [main,start,win,death]
};

let game = new Phaser.Game(config);
let player;
let player_animstate;
let enemys;
let enemy;
let num_enemies;
let enemy_speed;
let counter;
let counter2;
let arrowkeys;
let startimage;
let deathimage;
let gamemusic;
let explodesounds;
let collectibleitem;
let healthpickup;
let score;
let scoretext;
let health;
let healthtext;
let specialattackammo;
let specialattacktext;
let map;
let finder;
let playerattacked;
let attackkey;
let enemyhealth;
let attackcounter;
let attack2counter;
let enemyattacksoundcounter;
let explode;
let invinciblemode=false;
let bats;
let time;

function startloadScene(){
    this.load.image('start', 'assets/startscene.png');
};

function startbuildGame(){
    startimage = this.add.image( 500, 350, 'start');
    ///var pointer = start.input.activePointer;
//if (pointer.isDown
    this.input.on("pointerdown", mainTransition, this);
};

function mainloadScene(){
    this.load.image('enemy', 'assets/SlimeS.png');
    this.load.image('starpickup', 'assets/star.png');
    this.load.image('item', 'assets/coin.png');
    this.load.image('healthpickup', 'assets/health.png');
    this.load.audio('explodesound', "assets/explosion.ogg");
    this.load.audio('gamemusic1', "assets/since_2_a.m.ogg");
    this.load.audio('collectsound', "assets/coin.ogg");
    this.load.audio('playerattacksound', "assets/sword.3.ogg");
    this.load.audio('enemyattacksound', "assets/enemyattack.ogg");
    this.load.audio('batsound', "assets/batnoise.ogg");
    this.load.image("tiles", "assets/basictiles.png");
    this.load.tilemapTiledJSON("map", "assets/newmapofmap.json");
    this.load.atlas("player", "assets/atlas.png", "assets/atlas.json");
    this.load.atlas("explode", "assets/explode.png", "assets/exploding.json");
    this.load.atlas("bat", "assets/bat.png", "assets/bat.json");
}

function mainbuildGame(){
    time = 10000;
    score = 0;
    num_enemies = 1500;
    enemy_speed = 50;
    counter = 0;
    counter2 = 0;
    specialattackammo = 1;
    playerattacked = 0;
    enemyhealth = 1;
    attackcounter=0;
    attack2counter=0;
    enemyattacksoundcounter = 0;
    health = 100;
    invinciblemode = false;
    gamemusic = this.sound.add('gamemusic1');
    gamemusic.play({
  		volume: 0.05,
  		loop: true}   );
    attackkey = this.input.keyboard.addKey('Space');
    attack2key = this.input.keyboard.addKey('A');
    let fkey = this.input.keyboard.addKey('F');
    fkey.on(
    'down', 
    function () {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }, 
    this );
    arrowkeys = this.input.keyboard.createCursorKeys();
    map = this.make.tilemap( { key: "map" } );
    let tiles = map.addTilesetImage( "mytiles", "tiles" );
    let myworldlayer = map.createLayer( "mylayer", tiles, 0, 0 )
    myworldlayer.setCollisionByProperty( { collide: true } );
    finder = new EasyStar.js();
    let grid = [];
    for(let y = 0; y < map.height; y++){
      let col = [];
      for(let x = 0; x < map.width; x++){
        tile = map.getTileAt(x, y);
        col.push(tile.index); 
      }
      grid.push(col);
    }
    finder.setGrid(grid);
    let tileset = map.tilesets[0];
    let properties = tileset.tileProperties;
    let acceptableTiles = [];
    console.log(tiles.total);
    for(let i = tileset.firstgid-1; i < tiles.total; i++){ 
      if (!properties[i].collide) {
        console.log("pushed tile");
        acceptableTiles.push(i+1);
        if(properties[i].score) {
          finder.setTileCost(i+1, properties[i].score);
        }
      }
    }
    finder.setAcceptableTiles(acceptableTiles);
    player = this.physics.add.sprite( 100, 400, "player", "misa-front" );
    ;
    player_animstate = 'stop';
    player.setScale(0.5);
    this.anims.create( { key: 'runfront',frames: [{ key: 'player',frame:"misa-front-walk.000"},{ key: 'player',frame:"misa-front-walk.001"},
    { key: 'player',frame:"misa-front-walk.002"},{ key: 'player',frame:"misa-front-walk.003"}], frameRate: 4, repeat: -1});
    this.anims.create( { key: 'runback',frames: [{ key: 'player',frame:"misa-back-walk.000"},{ key: 'player',frame:"misa-back-walk.001"},
    { key: 'player',frame:"misa-back-walk.002"},{ key: 'player',frame:"misa-back-walk.003"}], frameRate: 4, repeat: -1});
    this.anims.create( { key: 'runleft',frames: [{ key: 'player',frame:"misa-left-walk.000"},{ key: 'player',frame:"misa-left-walk.001"},
    { key: 'player',frame:"misa-left-walk.002"},{ key: 'player',frame:"misa-left-walk.003"}], frameRate: 4, repeat: -1});
    this.anims.create( { key: 'runright',frames: [{ key: 'player',frame:"misa-right-walk.000"},{ key: 'player',frame:"misa-right-walk.001"},
    { key: 'player',frame:"misa-right-walk.002"},{ key: 'player',frame:"misa-right-walk.003"}], frameRate: 4, repeat: -1});
    this.anims.create( { key: 'stopfront',frames: [{ key: 'player',frame:"misa-front"}], frameRate: 0, repeat: 0});
    this.anims.create( { key: 'explode',frames: [{ key: 'explode',frame:"bubble_explo5.png"},{ key: 'explode',frame:"bubble_explo4.png"},
    { key: 'explode',frame:"bubble_explo3.png"},{ key: 'explode',frame:"bubble_explo2.png"},{ key: 'explode',frame:"bubble_explo1.png"}], frameRate: 5, repeat: -1});
    this.anims.create( { key: 'bat',frames: [{ key: 'bat',frame:"bat-1.png"},{ key: 'bat',frame:"bat-2.png"},{ key: 'bat',frame:"bat-3.png"},
    { key: 'bat',frame:"bat-4.png"},{ key: 'bat',frame:"bat-5.png"}], frameRate: 5, repeat: -1});

    this.physics.add.collider( player, myworldlayer ); 
    createEnemy.call(this);
    createBat.call(this);
    let mycamera = this.cameras.main;
    mycamera.startFollow(player);
    mycamera.setBounds( 0, 0, map.widthInPixels, map.heightInPixels ); 
    scoretext = this.add.text(
        580,
        50,
        'Current Score: 0',{
            fontFamily: 'GulimChe',
            fontsize: '80',
            color: '#000000',
            align: 'center'
        }
    )
    scoretext.setOrigin(0.5);
    scoretext.setScrollFactor(0);
    healthtext = this.add.text(400,50,'Current Health: 100',{
      fontFamily: 'GulimChe',
      fontsize: '80',
      color: '#000000',
      align: 'center'
    });
    healthtext.setOrigin(0.5);
    healthtext.setScrollFactor(0);
    specialattacktext = this.add.text(800,50,'Special Attacks Left: ',{
      fontFamily: 'GulimChe',
      fontsize: '80',
      color: '#000000',
      align: 'center'
    });
    specialattacktext.setOrigin(0.5);
    specialattacktext.setScrollFactor(0);
    specialattacktext.setText('Special Attacks Left: ' + specialattackammo + "  Timer" +time );
    healthpickup = this.physics.add.group({
      key: 'healthpickup',
      repeat: 3,
      setXY: { x: 20, y: 400, stepX: 200, stepY: 0}
    });
    collectibleitem = this.physics.add.group({
        key: 'item',
        repeat: 4,
        setXY: { x: 100, y: 700, stepX: 350, stepY: -100}
    });
    starpickup = this.physics.add.sprite( 600, 400, "starpickup" );
    this.physics.add.collider( starpickup, myworldlayer );
    this.physics.add.collider( collectibleitem, myworldlayer );
    this.physics.add.overlap(player, starpickup, collectStar, null, this);
    this.physics.add.overlap(player, collectibleitem, collectItem, null, this);
    this.physics.add.collider( healthpickup, myworldlayer );
    this.physics.add.overlap(player, healthpickup, collectHealth, null, this);
    this.physics.add.overlap( player, enemys, enemyattack, null, this );
    this.physics.add.overlap( player, bats, batattack, null, this );
    this.physics.add.overlap( player, enemys, playerattack, null, this );
    this.physics.add.overlap( player, enemys, playerattack2, null, this );
}

function mainaction(){ 
    if (arrowkeys.left.isDown) {
        player.setVelocityX(-200);
        if(player_animstate!='runleft'){ 
        player_animstate = 'runleft';
        player.anims.play('runleft');
        }
    }
    else if (arrowkeys.right.isDown) {
        player.setVelocityX(200);
        if(player_animstate != 'runright'){ 
        player_animstate = 'runright';
        player.anims.play('runright');
        }
    }
    else if (arrowkeys.down.isDown)  {
        player.setVelocityY(200);
        if(player_animstate != 'runfront'){
        player_animstate = 'runfront'; 
        player.anims.play('runfront');
        }
    }
    else if (arrowkeys.up.isDown) {
        player.setVelocityY(-200);
        if( player_animstate != 'runback'){ 
        player_animstate = 'runback';
        player.anims.play('runback');
        }
    }
    else{
        player.setVelocity(0);
    }
    let that = this;
    enemys.children.iterate(function (enemy) {
      switch ( enemy.custom_state ) {
        case 'wander':
          if (enemy.custom_state_timer > 0) {
            enemy.custom_state_timer--;
          }
          else {
            enemy.custom_state_timer = 30 * 10;
          }
          if (enemy.custom_state_timer>150) {
              enemy.setVelocityY(-enemy_speed);
          } 
          else {
            enemy.setVelocityY(enemy_speed);
          }
          if(enemy.custom_state_timer==1){
            enemy.custom_state = 'attack family';
          }
          else if(playerattacked==1) {
            enemy.custom_state = 'attack family';
            playerattacked=0;
          }
          break;
        case 'attack family':
          if(counter==100){
          createPath(player,enemy);
          counter=0;
          }
          else{
          counter++;
          }
          if(playerattacked==1) {
            enemy.custom_state = 'pursuit';
            playerattacked=0;
          }
          break;
        case 'pursuit':
          let randomnum = Phaser.Math.Between(1, 4);
          if(randomnum==1){
          health--;
          healthtext.setText('Current Health: ' + health);
          }
          if(health!=0){
            enemy.custom_state = 'attack family';
          }
      }
    });
    time--;
    specialattacktext.setText('Special Attacks Left: ' + specialattackammo + "timer" +time);
    if(time<0){
      deathTransition.call(this);
    }
    if(health<0){
      deathTransition.call(this);
    }
    bats.children.iterate(function (bat) {
      if(bat.y>650){
        bat.setVelocityY(-50);
      }if(bat.y<100){
        bat.setVelocityY(50);
      }
    }
  );
  if(invinciblemode){
    let randomnumber = Phaser.Math.Between(1, 3);
    if(randomnumber==1){
      player.setTint(0xFFFFFF);
    }
    else if(randomnumber==2){
      player.setTint(0x00FF00);
    }
    else if(randomnumber==3){
      player.setTint(0xFF0000);
    }
  }
}

function winloadScene(){
    this.load.image('deathimage1', 'assets/collectallcoins.png');
};

function winbuildGame(){
    gamemusic.stop();
    deathimage = this.add.image( 500, 350,'deathimage1');
    this.input.on('pointerup',startTransition, this);
};

function deathloadScene(){
  this.load.image('playerdeath', 'assets/death.png');
};

function deathbuildGame(){
  gamemusic.stop();
  playerdeathimage = this.add.image( 500, 350,'playerdeath');
  this.input.on('pointerup',startTransition, this);
};

function startTransition() {this.scene.start('start')};
function mainTransition() {this.scene.start('main')};
function winTransition() {this.scene.start('win')};
function deathTransition() {this.scene.start('death');};

function enemyattack(){
  if(!invinciblemode){
  playerattacked = 1;
  enemyattacked = this.sound.add('enemyattacksound');
  if(enemyattacksoundcounter==0){
    enemyattacked.stop();
    enemyattacked.play({
  		volume: 0.2,
  		loop: false}   );
      enemyattacksoundcounter=10;
  }
  else{
    enemyattacksoundcounter--;
  }
  }
}

function batattack(player,bat){
  if(!invinciblemode){
  batsound = this.sound.add('batsound');
  batsound.play({
    volume: 0.1,
    loop: false}   );
  player.anims.play('explode');
  if (health<10){
    deathTransition.call(this)
  }
  else{
    health = 10;
  }
  }
}

function playerattack(player,enemy){
  if(attackcounter==10){
    attackcounter = 0;
    enemy.setTint(0xFF0000);
    attacksound = this.sound.add('playerattacksound');
    attackkey.on('down',function(){
      enemy.disableBody(true,true);
      attacksound.play({
        volume: 1,
        loop: false}   );
    },this);
  }
  else{
    attackcounter++;
  }
};

function playerattack2(player,enemy){
  explodesounds = this.sound.add('explodesound');
  if(invinciblemode){
    if(enemy){
    enemy.clearTint();
    enemy.anims.play('explode');
    playerattack2sound=0;
    explodesounds.play({
      volume: 0.1,
      loop: false}   );}
    playerattack2sound++;
    if(attack2counter==7){
      attack2counter=0;
      enemy.disableBody(true,true);
    }
    else{
    attack2counter++;
    }
  }
}

function collectStar(player,starpickup){
  starpickup.disableBody(true,true);
  invinciblemode=true;
  player.setTint(0xFF0000);
}

function collectItem(player,item){
  collect = this.sound.add('collectsound');
  collect.play({
  	volume: 1,
  	loop: false}   );
  item.disableBody(true,true);
  score++;
  scoretext.setText('Current Score: ' + score);
  if (collectibleitem.countActive(true) === 0)
  {
    winTransition.call(this);
  }
}

function collectHealth(player,healthpickup){
  collect = this.sound.add('collectsound');
  collect.play({
  	volume: 1,
  	loop: false}   );
  healthpickup.disableBody(true,true);
  health=health+10;
  healthtext.setText('Current Health: ' + health);
}

function createPath(player, enemy){
  var toX = Math.floor(player.x/16);
  var toY = Math.floor(player.y/16);
  var fromX = Math.floor(enemy.x/16);
  var fromY = Math.floor(enemy.y/16);
  console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
  finder.findPath(fromX, fromY, toX, toY, function( path ) {
    if (path === null) {
      console.warn("Path was not found.");
    } else {
      console.log(path);
      moveEnemy(player,enemy,path);
    }
  });
  finder.calculate();
}

function moveEnemy(player,enemy,path){
    let mytimeline = game.scene.scenes[0].tweens.createTimeline();
    let newx, newy;
    for ( var i = 0; i < path.length-1; i++ ) {
        newx = path[ i + 1 ].x;
        newy = path[ i + 1 ].y;
        mytimeline.add(
        {
            targets: enemy,
                x: {
                   value: newx * map.tileWidth,
                   duration: 100
                 },
                y: {
                 value: newy * map.tileHeight,
                 duration: 100
        }
      }
    );
  }
  mytimeline.play();
}


function createEnemy(player,myworldlayer){
  enemys = this.physics.add.group({
    defaultKey: 'enemy',
    maxSize: num_enemies
  })
  for (i = 0; i < num_enemies; i++){
    let x = (i+1)*50;
    enemy = enemys.get(x,700);
    if (enemy) {
      enemy.health = enemyhealth;
      enemy.setScale(0.4);
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.setCollideWorldBounds(true);
      enemy.custom_id = 'enemy';
      let rand = Phaser.Math.Between(1, 3);
      switch ( 1) {
        case 1:
          enemy.custom_state = 'wander';
          break;
        case 2:
          enemy.custom_state = 'attack family';
          break;
        case 3:
          enemy.custom_state = 'attack player';
          break;
      }
      enemy.custom_state_timer = 0;
      this.physics.add.collider( enemy, myworldlayer );
    }
  }
}


function createBat(player,myworldlayer){
  bats = this.physics.add.group({
    defaultKey: 'bat',
    maxSize: 5
  })
  for (i = 0; i < 5; i++){
    let x = (i+1)*200;
    bat = bats.get(x,400);
    if (bat) {
      bat.anims.play('bat');
      bat.health = enemyhealth;
      bat.setScale(0.4);
      bat.setActive(true);
      bat.setVisible(true);
      bat.body.setCollideWorldBounds(true);
      this.physics.add.collider( enemy, myworldlayer );
      bat.setVelocityY(50);
    }
  }
}