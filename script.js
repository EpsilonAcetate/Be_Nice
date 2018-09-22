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

function preload() {

    //  tiles are 16x16 each
    game.load.image('tiles', 'assets/1x/tiles.png');
    game.load.image('inn', 'assets/inn.png');
    game.load.spritesheet('dude', 'assets/front-walk.png', 32, 32);
    game.load.bitmapFont('pixelfont', 'assets/font.png', 'assets/font.fnt');
    game.load.bitmapFont('arrowfont', 'assets/fontalt.png', 'assets/font.fnt');
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

var cursors;
var outdoor_maps_S;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();
    enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    interactKey = game.input.keyboard.addKey(Phaser.Keyboard.F);


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

    game.cache.addTilemap('dynamicMap', null, TLS, Phaser.Tilemap.CSV);
    map = game.add.tilemap('dynamicMap', 32, 32);
    map.addTilesetImage('tiles', 'tiles', 32, 32);
    new_floor_layer = map.createLayer(0);

    player = game.add.sprite(32*2, 32*2, 'dude');
    game.physics.arcade.enable(player);

    player.animations.add('left', [0, 1, 2, 3,4,5,6,7], 10, true);
  //  player.animations.add('right', [5, 6, 7, 8], 10, true);

    current_map = TLA;

    outdoor_maps_S = {0:TLS, 3:BLS, 1:TMS, 4: BMS, 2:TRS, 5:BRS, 6:innDS, 7:innUS, 8:tavernS, 9:libUS, 10:libDS, 11:h1S, 12:h2S, 13:h3S, 14:forestS};
    outdoor_maps_A = {0:TLA, 3:BLA, 1:TMA, 4: BMA, 2:TRA, 5:BRA, 6:innDA, 7:innUA, 8:tavernA, 9:libUA, 10:libDA, 11:h1A, 12:h2A, 13:h3A, 14:forestA};
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
        return true;
//      console.log(y);
//      console.log(x);
//      console.log(current_map);
        console.log(current_map[y][x]);
       // console.log((1 <= current_map[y][x] && current_map[y][x] <= 20) || (111 <= current_map[y][x] && current_map[y][x] <= 131));
        return current_map[y][x] < 21 || current_map[y][x] >= 75;
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
    game.physics.arcade.enable(player);
    playerx = newx;
    playery = newy;
    current_map = outdoor_maps_A[outdoor_doors[doornum]];
    console.log(current_map);
    updating = false;
}

door_dests = {
    83:[0, 9, 8], 98:[6, 9, 7], 82:[7,5,9], 84:[6,5,10], 86:[8,8,5], 87:[4,6,7], 88:[1,5,5], 89:[10,6,4], 90:[10,1,3], 
    91:[9, 5,4],92:[5,3,7],93:[11,5,4],95:[12,5,1],94:[3,5,7],96:[2,6,6],97:[13,5,1], 80:[14,7,11],99:[0,6,0]
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

    newx = door_dests[doornum][2]
    newy = door_dests[doornum][1]
    console.log( "(" + newx + "," + newy + ")");
    player = game.add.sprite(newx*32, newy*32, 'dude');
    game.physics.arcade.enable(player);
    playerx = newx;
    playery = newy;
    current_map = outdoor_maps_A[door_dests[doornum][0]];
    console.log(current_map);
    updating = true;
    updating = false;
}
var npcs = {
    68:["old man", ["man: blah blah", "how are you today?", "sup", "Asdf"], false, "test object", ["oh my god, you\n have my test \n object!", "thank you so much"]],
    70:["old lady", ["old lady: hello there,\n young one", "my husband is dying qq", "gib herbs"], false, "herbs", ["oh my god", "tysm"]],
    72:["inkeeper", ["inkeeper: hi dude","i have a crush on the\nbartender","i lost my ring tho"], false, "ring", ["i love u"]],
    74:["barkeeper",["barkeeper: sup", "i have a crush on the\n inkeeper"], false, "ring", ["i love u"]],
    76:["farmer", ["man: hi i'm planting a tree", "wanna lend me a hand?"], false, "nada", []],
}
var objects = {
    170:["test object", true], 171:["test object second", true]
}
npclocations = [68, 70, 72, 74, 76]
var dialogqueue = []
var awaitingdialogue = false;

function update() {
//     console.log( "(" + playerx + "," + playery + ")");
    var thistile = current_map[playery][playerx]
    console.log(thistile);
    if (170 <= thistile && thistile <= 200) {
        try{
            destroyTextBox();
        } catch(error){}
        dialogqueue = []
        current_map[playery][playerx] = 1;
        dialogqueue.push(objects[thistile][0]);
        inventory.push(objects[thistile][0]);
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
   //         player.animations.play('right');
        } else if (cursors.down.isDown && canMove(playery+1, playerx)) {
            movePlayer(0, 1);
   //         player.animations.play('right');
        } else if (cursors.up.isDown && canMove(playery-1, playerx)) {
            movePlayer(0, -1);
   //         player.animations.play('right');
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
        }

    } else if(enterKey.isUp){
        hasPressed = false;
    }
    
}

