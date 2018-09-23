var game = new Phaser.Game(12*32, 12*32, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });
var playerx = 2;
var playery = 2;

var maps = [];
var doors = [];
var enterKey;
var i = 0;
var hasPressed = false;
var graphics;
var text;
var arrowText;
var inventory = [];

var inventoryPress = false;
var iKey;
var hasDrawn = false;
var inventoryGraphics;
var inventoryTitle;
var pressed = false;
current_music = 0;

var musiclist = ["Forest", "Inn", "Tavern", "Library", "Overworld"];

function preload() {

    //  tiles are 16x16 each
    game.load.image('tiles', 'assets/1x/tiles.png');
    game.load.image('inn', 'assets/inn.png');
    game.load.spritesheet('dude', 'assets/1x/guy.png', 32, 32);
    game.load.bitmapFont('pixelfont', 'assets/font.png', 'assets/font.fnt');
    game.load.bitmapFont('arrowfont', 'assets/fontalt.png', 'assets/font.fnt');
    game.load.bitmapFont('invfont', 'assets/blackfont.png', 'assets/blackfont.fnt');
    game.load.audio('Forest', ['assets/Forest.mp3']);
    game.load.audio('Inn', ['assets/Inn.mp3']);
    game.load.audio('Tavern', ['assets/Tavern-Loop.mp3']);
    game.load.audio('Library', ['assets/Library.mp3']);
    game.load.audio('Overworld', ['assets/Overworld.mp3']);
}

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;

}

function stringToArray(s) {
  s = s.split("\n");
  toreturn = []
  for (var line=0; line<s.length; line++) {
    thisline = s[line].split(",");
    toreturn.push(thisline);
  }
  return toreturn
}

var music;

var cursors;
var outdoor_maps_S;
var current_map_num;
var musics = {0:"Overworld",1:"Overworld",2:"Overworld",3:"Overworld",4:"Overworld",5:"Overworld",6:"Inn",7:"Inn",8:"Tavern",9:"Library",10:"Library",11:"Overworld",12:"Overworld",13:"Overworld",14:"Forest",15:"Forest", 16:"Overworld",17:"Overworld"};


function create() {

    music = game.add.audio('Overworld');
    current_playing_music = 'Overworld';
    music.play();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();
    enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    interactKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
    iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);


    TLS = loadFile("assets/top-left.csv");
    TLA = stringToArray(TLS);
    BLS = loadFile("assets/bottom-left-2.csv");
    BLA = stringToArray(BLS);
    BMS = loadFile("assets/bottom-mid.csv");
    BMA = stringToArray(BMS);
    TMS = loadFile("assets/top-mid.csv");
    TMA = stringToArray(TMS);
    TRS = loadFile("assets/top-right-1.csv");
    TRA = stringToArray(TRS);
    BRS = loadFile("assets/bottom-right.csv");
    BRA = stringToArray(BRS);

    innDS = loadFile("assets/inn-down.csv");
    innDA = stringToArray(innDS);
    innUS = loadFile("assets/inn-up.csv");
    innUA = stringToArray(innUS);
    tavernS = loadFile("assets/tavern.csv");
    tavernA = stringToArray(tavernS);
    libDS = loadFile("assets/lib-down.csv");
    libDA = stringToArray(libDS);
    libUS = loadFile("assets/lib-up.csv");
    libUA = stringToArray(libUS);
    h1S = loadFile("assets/house-01.csv");
    h1A = stringToArray(h1S);
    h2S = loadFile("assets/house-02.csv");
    h2A = stringToArray(h2S);
    h3S = loadFile("assets/house-03.csv");
    h3A = stringToArray(h3S);
    forestS = loadFile("assets/forest.csv");
    forestA = stringToArray(forestS);
    forestPS = loadFile("assets/forest-post.csv");
    forestPA = stringToArray(forestPS);
    BRPS = loadFile("assets/bottom-right-post.csv");
    BRPA = stringToArray(BRPS);
    BMPS = loadFile("assets/bottom-mid-post.csv");
    BMPA = stringToArray(BRPS);

    game.cache.addTilemap('dynamicMap', null, TLS, Phaser.Tilemap.CSV);
    map = game.add.tilemap('dynamicMap', 32, 32);
    map.addTilesetImage('tiles', 'tiles', 32, 32);
    new_floor_layer = map.createLayer(0);

    player = game.add.sprite(32*2, 32*2, 'dude');
    game.physics.arcade.enable(player);

    player.animations.add('forward', [0,1,2, 3,4,5,6,7], 10, true);
    player.animations.add('right', [8,9,10,11,12,13,14,15], 10, true);
    player.animations.add('left', [16,17,18,19,20,21,22,23], 10, true);
    player.animations.add('back', [24,25,26,27,28,29,30,31], 10, true);
    
    music = game.add.audio('Overworld');
    

    current_map = TLA;
    current_map_num = 0;

    outdoor_maps_S = {0:TLS, 3:BLS, 1:TMS, 4: BMS, 2:TRS, 5:BRS, 6:innDS, 7:innUS, 8:tavernS, 9:libUS, 10:libDS, 11:h1S, 12:h2S, 13:h3S, 14:forestS, 15:forestPS, 16:BRPS, 17:BMPS};
    outdoor_maps_A = {0:TLA, 3:BLA, 1:TMA, 4: BMA, 2:TRA, 5:BRA, 6:innDA, 7:innUA, 8:tavernA, 9:libUA, 10:libDA, 11:h1A, 12:h2A, 13:h3A, 14:forestA, 15:forestPA, 16:BRPA, 17:BMPA};
}

function movePlayer(x, y) {  
    // Because we're adding 32 to the player's position, we need to prevent cases where the user tries to move  
    // the player mid-move, knocking it off the grid. This is a crude way to do it but it works.  
    if (player.isMoving) { return; }  player.isMoving = true;  
    if (updating) {return;}
    // Tween the player to the next grid space over 250ms, and when done, allow the player to make another move  
    playerx += x;
    playery += y;
    game.add.tween(player).to({
        x: player.x + x * 32, y: player.y + y * 32
    }, 250, Phaser.Easing.Quadratic.InOut, true).onComplete.add(
    function() { player.isMoving = false;}, this);
}


////////////////////////////////////////////////////////////////////////
//Creates a text box on the bottom of the game screen. Takes textString
//argument and populates the text box with size 32 font. An arrow is 
//placed in the bottom right corner of the text box.
///////////////////////////////////////////////////////////////////////
function createText(textString){ //for text string make sure you have ''.
    graphics = game.add.graphics(0, 0);
    graphics.lineStyle(4, 0xFFFFFF, 1);
    graphics.beginFill(0x000000, 1);
    graphics.drawRect(2 + game.world.width/16, game.world.height - game.world.height/3, game.world.width - game.world.width/8 - 4, game.world.height/4 - 2 );
    graphics.endFill();

    text = game.add.bitmapText(20+game.world.width/16, game.world.height - game.world.height/3 + 10, 'pixelfont',textString,20);
     
    arrowText = game.add.bitmapText((7*game.world.width)/8 ,(5*game.world.height)/6, 'arrowfont','v',32);
}

////////////////////////////////////////////////////////////////////////
//Destroys text box and related texts.
////////////////////////////////////////////////////////////////////////
function destroyTextBox(){
    graphics.destroy();
    text.destroy();
    arrowText.destroy();
}

function canMove(y, x) {
    try{
        return walkover.includes(parseInt(current_map[y][x]));
//      console.log(y);
//      console.log(x);
//      console.log(current_map);
        console.log(current_map[y][x]);
       // console.log((1 <= current_map[y][x] && current_map[y][x] <= 20) || (111 <= current_map[y][x] && current_map[y][x] <= 131));
//        return current_map[y][x] < 21 || current_map[y][x] >= 75;
        //return (1 <= current_map[y][x] && current_map[y][x] <= 20) || (111 <= current_map[y][x] && current_map[y][x] <= 131)
    } catch(err){
        return false
    }
}

var outdoor_doors = {
    130:0, 129:3, 131:1, 132:0,133:2,134:1,135:5,136:2,137:4,138:5,139:3,126:4,127:1,128:4
}

var updating = false;
function replaceMap_outdoors(x, y, doornum) {
    console.log(doornum);
    console.log(outdoor_doors[doornum]);
    console.log(outdoor_maps_S[outdoor_doors[doornum]]);
    updating = true;
    player.destroy();
    current_map = outdoor_doors[doornum];
    
    game.cache.addTilemap('dynamicMap', null, outdoor_maps_S[outdoor_doors[doornum]], Phaser.Tilemap.CSV);
    new_map = game.add.tilemap('dynamicMap', 32, 32);
    new_map.addTilesetImage('tiles', 'tiles', 32, 32);
    new_floor_layer = new_map.createLayer(0);

    new_floor_layer = new_map.createLayer(0);
    if ([129,130,128,127,135,136].includes(parseInt(doornum))) {
        newx = x;
    } else if ([131,126,133,138].includes(parseInt(doornum))) {
        newx = 1;
    } else {
        newx = 10;
    }
    if ([131,132,133,134,126,139,137,138].includes(parseInt(doornum))) {
        newy = y;
    } else if ([130,127,126,136].includes(parseInt(doornum))) {
        newy = 10;
    } else {
        newy = 1;
    }
    console.log( "(" + newx + "," + newy + ")");
    player = game.add.sprite(newx*32, newy*32, 'dude');
    player.animations.add('forward', [0,1,2, 3,4,5,6,7], 10, true);
    player.animations.add('right', [8,9,10,11,12,13,14,15], 10, true);
    player.animations.add('left', [16,17,18,19,20,21,22,23], 10, true);
    player.animations.add('back', [24,25,26,27,28,29,30,31], 10, true);

    game.physics.arcade.enable(player);
    playerx = newx;
    playery = newy;
    current_map = outdoor_maps_A[outdoor_doors[doornum]];
    console.log(current_map);
    updating = false;
}

var walkover = [1,2,3,4,5,6,7,8,9,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,78,76,74,72,70,68,101,105,106,107,108,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,187,188,189,192,193,197,198]

door_dests = {
    83:[0, 9, 8], 98:[6, 9, 7], 82:[7,5,9], 84:[6,5,10], 86:[8,8,5], 87:[4,6,7], 88:[1,5,5], 89:[10,6,4], 90:[10,1,3], 
    91:[9, 5,4],92:[5,3,7],93:[11,5,4],95:[12,5,1],94:[3,5,7],96:[2,6,6],97:[13,5,1], 80:[14,7,11],99:[0,6,1]
}
function door_movement(doornum) {
    if (updating) {return;}
    updating = true;
    console.log(doornum);
    console.log(door_dests[doornum][0]);
    console.log(outdoor_maps_S[door_dests[doornum][0]]);
    player.destroy();
    
    game.cache.addTilemap('dynamicMap', null, outdoor_maps_S[door_dests[doornum][0]], Phaser.Tilemap.CSV);
    new_map = game.add.tilemap('dynamicMap', 32, 32);
    new_map.addTilesetImage('tiles', 'tiles', 32, 32);
    new_floor_layer = new_map.createLayer(0);
    current_map_num = door_dests[doornum][0];

    newx = door_dests[doornum][2]
    newy = door_dests[doornum][1]
    console.log( "(" + newx + "," + newy + ")");
    player = game.add.sprite(newx*32, newy*32, 'dude');
    game.physics.arcade.enable(player);
    player.animations.add('forward', [0,1,2, 3,4,5,6,7], 10, true);
    player.animations.add('right', [8,9,10,11,12,13,14,15], 10, true);
    player.animations.add('left', [16,17,18,19,20,21,22,23], 10, true);
    player.animations.add('back', [24,25,26,27,28,29,30,31], 10, true);

    playerx = newx;
    playery = newy;
    current_map = outdoor_maps_A[door_dests[doornum][0]];
    console.log(current_map);
    updating = true;
    updating = false;
}
var npcs = {
    68:["old man", ["Hey kid, what brings you\n to my humble abode?", "I haven’t been doing so well\n these past couple of days.",
     "These aching bones are making\n it too difficult to move \naround much. ", "If only I had some \nSalix Babylonica herb..."], 
     false, "herbs", 
     ["Is that Salix \nBabylonica herb I see?", "Thanks kid, you’re a \ntrue lifesaver.", "I feel much better already.",
      "I don’t have anything on \nhand to offer, but perhaps I can\n treat you to some dinner later."]],
    70:["old lady", ["Hello sweetie.","You remind me of my \ngrandson left many years\n ago."], false, "nada", ["oh my god", "tysm"]],
    72:["inkeeper", ["I was wondering if you \ncould do me a favor...","I feel like the \nbartender hates me, and \n I'm not sure why..."], false, "ring", ["i love u"]],
    74:["barkeeper",["Oh? You think there’s something\n wrong with ME?","Ya sure you’re talkin’\n to the right man?", "Anyone can see that it’s the \nINNKEEPER that has something \nwrong with them." ,"My pub ‘ere can get a little\n wild but everyone knows it’s\n one of the more docile taverns \nin the realm, honest!","And then here comes \nthe Innkeeper, waltzing \nin for the first time anyone in \ntown knows of...","and what does he \ndo? Demand that I keep MY\n pub quieted down...", "claiming that the noise \nwas'bothering the guests' or \nsome such.", "Didn’t even have the \ndecency to say hello, \nthe rotten… *gulp, gulp, gulp…*"]
, false, "ring", ["i love u"]],
    76:["farmer", ["man: hi i'm planting a tree", "wanna lend me a hand?"], false, "nada", [], true],
    78:["girl", ["Excuse me? Mister? Miss?","You look brave and kind, \nso would you please help me?","I lost a special doll in the \nforest while collecting \nmushrooms."," It was my mother’s \nfavorite!","I don’t know what she’d \ndo without it.","I would ask my dad but he’s \nalways stumbling around that \nbuilding with the \nbitter drinks..."," I can’t blame him \nfor being tired,\n he works so hard.", "Could you please find \nthe doll for me?"], false, "doll", ["Thank you so much!!"]],
    101:["librarian", ["looking for something?"], false, "nada", []],
    197:["book", ["A horticulture book \ncatches your attention.", "As you read through it,\n you note that the local\n forest is filled with plants\n with healing attributes."], false, "nada", []]
}
var objects = {
    188:["herbs", "you found some \nmedicinal looking herbs.", true],
    189:["doll", "you found a doll!", true],
    187:["smell", "the plants here \nsmell interesting."],
    193:["dirt", "the earth here is a little soft.", false],
    192:["ring", "a small mineshaft opened up!\n you find a ring among \nthe dirt.", true],
}

npclocations = [68, 70, 72, 74, 76, 78, 101, 197]
var dialogqueue = []
var awaitingdialogue = false;
var objectlocations = [187,188,189,171,192,193];
var donetalking = false;

function hasLooped() {
}

function update() {
//     console.log( "(" + playerx + "," + playery + ")");
    console.log(current_map_num);
    console.log(current_playing_music);
    if (musics[current_map_num] != current_playing_music) {
        game.sound.stopAll();
        music = game.add.audio(musics[current_map_num]);
        current_playing_music = musics[current_map_num]
        music.onLoop.add(hasLooped, this);
        music.play();
    }
    try {
        var thistile = current_map[playery][playerx]
    } catch(error) {
        var thistile = 1;
    }
    console.log(thistile);
    if (interactKey.isDown && objectlocations.includes(parseInt(thistile))) {
        try{
            destroyTextBox();
        } catch(error){}
        dialogqueue = []
        current_map[playery][playerx] = 1;
        dialogqueue.push(objects[thistile][1]);
        if (objects[thistile][2]) {
            dialogqueue.push(objects[thistile][0] + " has been added \nto inventory.")
            inventory.push(objects[thistile][0]);
        }
        if (objects[thistile][0] == "doll") {
            outdoor_maps_S[14] = outdoor_maps_S[15];
            outdoor_maps_A[14] = outdoor_maps_A[15];
            game.cache.addTilemap('dynamicMap', null, outdoor_maps_S[15], Phaser.Tilemap.CSV);
            new_map = game.add.tilemap('dynamicMap', 32, 32);
            new_map.addTilesetImage('tiles', 'tiles', 32, 32);
            new_floor_layer = new_map.createLayer(0);
            current_map = outdoor_maps_A[15];

            player = game.add.sprite(playerx*32, playery*32, 'dude');
            game.physics.arcade.enable(player);
            player.animations.add('forward', [0,1,2, 3,4,5,6,7], 10, true);
    player.animations.add('right', [8,9,10,11,12,13,14,15], 10, true);
    player.animations.add('left', [16,17,18,19,20,21,22,23], 10, true);
    player.animations.add('back', [24,25,26,27,28,29,30,31], 10, true);

        } if (objects[thistile][0] == "dirt" && inventory.includes("shovel")) {
            outdoor_maps_S[4] = outdoor_maps_S[17];
            outdoor_maps_A[4] = outdoor_maps_A[17];
            game.cache.addTilemap('dynamicMap', null, outdoor_maps_S[4], Phaser.Tilemap.CSV);
            new_map = game.add.tilemap('dynamicMap', 32, 32);
            new_map.addTilesetImage('tiles', 'tiles', 32, 32);
            new_floor_layer = new_map.createLayer(0);
            current_map = outdoor_maps_A[4];
            player = game.add.sprite(playerx*32, playery*32, 'dude');
            game.physics.arcade.enable(player);
            player.animations.add('forward', [0,1,2, 3,4,5,6,7], 10, true);
    player.animations.add('right', [8,9,10,11,12,13,14,15], 10, true);
    player.animations.add('left', [16,17,18,19,20,21,22,23], 10, true);
    player.animations.add('back', [24,25,26,27,28,29,30,31], 10, true);

        }
        createText(dialogqueue.shift())
        awaitingdialogue = true;
        console.log(inventory);
       // console.log(hasPressed);
        i = 0;
    }
    if (!updating && [80,83,98,82,84,86,87,88,89,90,91,92,93,94,95,96,97,99].includes(parseInt(thistile))) {
        door_movement(thistile);
    }

    if (!updating && !awaitingdialogue) {
        if (cursors.left.isDown && canMove(playery, playerx-1)){
            movePlayer(-1, 0);
            player.animations.play('left');
            console.log("c");
        } else if (cursors.right.isDown && canMove(playery, playerx+1)) {
            movePlayer(1, 0);
            player.animations.play('right');
        } else if (cursors.down.isDown && canMove(playery+1, playerx)) {
            movePlayer(0, 1);
            player.animations.play('forward');
        } else if (cursors.up.isDown && canMove(playery-1, playerx)) {
            movePlayer(0, -1);
            player.animations.play('back');
        }
    }
    if (111 <= thistile && thistile <= 140) {//MAP EDGE
        console.log("got here");
        replaceMap_outdoors(playerx, playery, current_map[playery][playerx]);
    }
    if (npclocations.includes(parseInt(thistile))) { //NPCS
        if (interactKey.isDown /*npcs[thistile][2] == false*/) {
            try{
                destroyTextBox();
            } catch(error){}
            donetalking = false;
            dialogqueue = []
            if (!inventory.includes(npcs[thistile][3])) {
                for (var which=0; which<npcs[thistile][1].length; which++){
                    dialogqueue.push(npcs[thistile][1][which]);
                }
            } else {
                for (var which=0; which<npcs[thistile][4].length; which++){
                    dialogqueue.push(npcs[thistile][4][which]);
                }
            }
            createText(dialogqueue.shift())
            awaitingdialogue = true;
            npcs[thistile][2] = true;
   //         console.log(dialogqueue);
   //         console.log(hasPressed);
            i = 0;
        }
        try {
            if (npcs[thistile][5] && donetalking) {
                outdoor_maps_S[5] = outdoor_maps_S[16];
                outdoor_maps_A[5] = outdoor_maps_A[16];
                game.cache.addTilemap('dynamicMap', null, outdoor_maps_S[5], Phaser.Tilemap.CSV);
                new_map = game.add.tilemap('dynamicMap', 32, 32);
                new_map.addTilesetImage('tiles', 'tiles', 32, 32);
                new_floor_layer = new_map.createLayer(0);
                current_map = outdoor_maps_A[5];
                player = game.add.sprite(playerx*32, playery*32, 'dude');
                game.physics.arcade.enable(player);
                player.animations.add('forward', [0,1,2, 3,4,5,6,7], 10, true);
    player.animations.add('right', [8,9,10,11,12,13,14,15], 10, true);
    player.animations.add('left', [16,17,18,19,20,21,22,23], 10, true);
    player.animations.add('back', [24,25,26,27,28,29,30,31], 10, true);

                inventory.push("shovel");
            }
        } catch (error){}
       // createText('interaction thing!');
       // hasPressed = true;
    }
    if (awaitingdialogue && (enterKey.isDown) && !hasPressed){
        try{
            destroyTextBox();
        } catch(error){
            console.log("no box to destroy");
        }
        hasPressed = true;
        console.log("i'm at" + i +","+ dialogqueue.length);    
        if(i<dialogqueue.length){
            createText(dialogqueue[i]);
            i++;
        } else {
            awaitingdialogue = false;
            donetalking = true;
        }
    } else if(enterKey.isUp){
        hasPressed = false;
    }


    if(iKey.isDown && !pressed){
    inventoryPress = !inventoryPress;
    pressed = true;
    }
    else if(iKey.isUp){
    pressed = false;

    }

if(inventoryPress && !hasDrawn){
    graph = game.add.group();
items = game.add.group();

inventoryTitle = game.add.bitmapText(game.world.width/8,game.world.height/6,'invfont','Inventory',36);
items.add(inventoryTitle);
    inventoryGraphics = game.add.graphics(0, 0);
    inventoryGraphics.lineStyle(4, 0xFFFFFF , 1);
    inventoryGraphics.beginFill(0xFFFFFF , 1);
 inventoryGraphics.drawRect(game.world.width/8, game.world.height/6 , game.world.width - game.world.width/4, game.world.height - game.world.height/3); 
 //100, 100, 600, 400.
    inventoryGraphics.endFill();
graph.add(inventoryGraphics);
    for(var m = 0; m < inventory.length; m++ ){

    var item = game.add.bitmapText(game.world.width/4,game.world.height/3+(m*(game.world.height/10)),'invfont',inventory[m],24);
    items.add(item);

    }
    hasDrawn = true;
}

else if(!inventoryPress && hasDrawn){
    graph.destroy();
    items.destroy();
    hasDrawn = false;
}

    
}

