//TODO: agregar una funcion que elimine balas si se van del grid y players si se remueren

const app = new PIXI.Application({ width: 768, height: 768, backgroundColor: 0x1099bb });
document.body.appendChild(app.view);
const min_step = 0.1  //cada movimiento va a ser un 10% de la pantalla 
//const player_offset = min_step + min_step/2 //offset para que quede centrado el mogolico en la grilla
const player_offset = min_step/2 //el de arriba sirve por si queremos dejar los bordes como pared o para displayear algo
const grid_number = 100/(min_step*100) //cantidad de casillas en un eje



let idle_images = ["sprites/cubo.png","sprites/cubo2.png","sprites/cubo3.png"];
let idle_array = []
idle_images.forEach(tex => idle_array.push(PIXI.Texture.from(tex)));
let idle_animation = new PIXI.AnimatedSprite(idle_array);

let collision_images = ["sprites/cubo.png","sprites/cubo-col.png","sprites/cubo-col2.png", "sprites/cubo-col3.png", "sprites/cubo.png"];
let collision_array = []
collision_images.forEach(tex => collision_array.push(PIXI.Texture.from(tex)));
let collision_animation = new PIXI.AnimatedSprite(collision_array);



// Scale mode for all textures, will retain pixelation
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

function collision_callback(player) {
    player.textures = collision_array
    player.loop = false
    player.animationSpeed = 0.3
    player.gotoAndPlay(0)

    player.onComplete = function() {
        player.textures = idle_array
        player.loop = true
        player.animationSpeed = 0.1
        player.gotoAndPlay(0)
    }
}

function collision(player,direccion, eje){
    if (eje == "x") {
        player.posx += direccion
        current_x = player.x
        player.finalx = app.screen.width * (min_step*player.posx + player_offset - min_step/2*direccion);

        player.final.push({x: player.finalx, y:player.finaly, callback: () => collision_callback(player)})
        player.posx -= direccion
        player.finalx = current_x
        player.final.push({x: current_x, y: player.finaly})
    } else if (eje == "y") {
        player.posy += direccion
        current_y = player.y
        player.finaly = app.screen.width * (min_step*player.posy + player_offset - min_step/2*direccion);

        player.final.push({x: player.finalx, y:player.finaly, callback: () => collision_callback(player)})
        player.posy -= direccion
        player.finaly = current_y
        player.final.push({x: player.finalx, y: current_y})
    }
}

function fucking_move(player,direccion,eje){
    //direccion puede ser +1 o -1 por si se mueve hacia adelante o atras en el eje
    if(eje == "x"){
        //checkea colision con los bordes
        if( player.posx + direccion >=0 && (min_step)*(player.posx+direccion)<1){ 
            player.posx += direccion
            player.finalx = app.screen.width*(min_step)*(player.posx) + app.screen.width*(player_offset);
            if (player.final.length > 0) {
                player.final[0].x = player.finalx
            } else {
                player.final.push({x: player.finalx, y:player.finaly})
            }
            player.movingx = direccion
        } else {
            collision(player, direccion, eje)
        }
    }

    if(eje == "y"){
        if( player.posy + direccion >=0 && (min_step)*(player.posy+direccion)<1){
            player.posy += direccion
            player.finaly = app.screen.height*(min_step)*(player.posy) + app.screen.height*(player_offset)
            if (player.final.length > 0) {
                player.final[0].y = player.finaly
            } else {
                player.final.push({x: player.finalx, y:player.finaly})
            }
            player.movingy = direccion
        } else {
            collision(player, direccion, eje)
        }
    }
}

function fucking_move_bullets(player,direccion,eje){
      if(eje == "x"){
          player.posx += direccion*grid_number
          player.finalx = app.screen.width*(min_step)*(player.posx) + app.screen.width*(player_offset);
          player.final.push({x: player.finalx, y:player.finaly})
          player.movingx = direccion
    }
    if(eje == "y"){
          player.posy += direccion*grid_number //numero de casillas que recorre el  tiro, de momento recorre toda toda la grilla
          player.finaly = app.screen.height*(min_step)*(player.posy) + app.screen.height*(player_offset)
          player.final.push({x: player.finalx, y:player.finaly})
          player.movingy = direccion

}



}

//hace la grilla en base al minstep
function create_grid(){
  let i = 1
  for(; i*min_step < 1 ;i++){
      let rectangle = new PIXI.Graphics();
      rectangle.beginFill(0x0);
      rectangle.drawRect(app.screen.width*min_step*i, 0, Math.max(app.screen.width*0.001,1), app.screen.height);
      rectangle.endFill();
      app.stage.addChild(rectangle);

      let rectangle2 = new PIXI.Graphics();
      rectangle2.beginFill(0x0);
      rectangle2.drawRect(0, app.screen.height*min_step*i, app.screen.width, Math.max(app.screen.height*0.001,1));
      rectangle2.endFill();
      app.stage.addChild(rectangle2);
  }
}

function create_player(id){
  // const sprite = PIXI.Sprite.from('sprites/cubo.png');
  const sprite = idle_animation
  console.log(sprite)
  sprite.animationSpeed = 0.1
  sprite.play()
  sprite.posx = 0
  sprite.posy = 0
  // Set the initial position
  sprite.anchor.set(0.5);
  sprite.x = app.screen.width*min_step/2;
  sprite.y = app.screen.height*min_step/2;
  //0 si no se mueve , 1 o -1 si se mueve segun la direccion
  sprite.movingx = 0
  sprite.movingy = 0
  sprite.finalx = sprite.x
  sprite.finaly = sprite.y
  sprite.final = [{x: sprite.finalx, y:sprite.finaly}]
  sprite.tipo = "Player"
  sprite.identificacion = id
  app.stage.addChild(sprite);



//esto esa para testear el click , pero no hace falta
  // Opt-in to interactivity
sprite.interactive = true;

// Shows hand cursor
sprite.buttonMode = true;

// Pointers normalize touch and mouse
sprite.on('pointerdown', () => {onClick()});
// Alternatively, use the mouse & touch events:
// sprite.on('click', onClick); // mouse-only
// sprite.on('tap', onClick); // touch-only




  return sprite
}



function shoot(player,direccion){
  tiro = PIXI.Sprite.from('sprites/cubo.png');
  tiro.posx = player.posx
  tiro.posy = player.posy
  tiro.final = []
  tiro.shooter = player
  tiro.anchor.set(0.5);
  tiro.x = player.x;
  tiro.y = player.y;
  tiro.movingx = 0
  tiro.movingy = 0
  tiro.tipo = "Tiro"
  app.stage.addChild(tiro);
  fucking_move_bullets(tiro,1,"x")

  return tiro
}






var lista_de_tiros = []
function onClick() {
    tiro  = shoot(sprite,1,);
    lista_de_tiros.push(tiro)
}





//funcion robada del tuto para capturar teclado, para testeo
function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
      if (event.key === key.value) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = event => {
      if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
      "keydown", downListener, false
    );
    window.addEventListener(
      "keyup", upListener, false
    );
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
  }

function new_move(sprite, speed) {
    for (i = 0; i < sprite.length; i++) {

        if (sprite[i].final.length > 0) {
            final = sprite[i].final[0]

            if (sprite[i].x < final.x) {
                sprite[i].x = Math.min(sprite[i].x + speed, final.x);
            } else if (sprite[i].x > final.x) {
                sprite[i].x = Math.max(sprite[i].x - speed, final.x);
            }

            if (sprite[i].y < final.y) {
                sprite[i].y = Math.min(sprite[i].y + speed, final.y);
            } else if (sprite[i].y > final.y) {
                sprite[i].y = Math.max(sprite[i].y - speed, final.y);
            }

            if (sprite[i].x == final.x && sprite[i].y == final.y) {
                f = sprite[i].final.shift()
                if (f.callback) {
                    f.callback()
                }

            }  
        }
    }
}

function move(sprite,speed){
  for(i=0;i<sprite.length;i++){

    if (sprite[i].movingx == 1){
        if (sprite[i].x < sprite[i].finalx){
            sprite[i].x += speed;
        }
        else if (sprite[i].x >= sprite[i].finalx){
          sprite[i].x = sprite[i].finalx
          sprite[i].movingx = 0
        }
      }
        else if (sprite[i].movingx == -1){
          if (sprite[i].x > sprite[i].finalx){
            sprite[i].x -= speed;
        }
        else if (sprite[i].x <= sprite[i].finalx){
          sprite[i].x = sprite[i].finalx
          sprite[i].movingx = 0
        }
    }

    if (sprite[i].movingy == 1){
        if (sprite[i].y < sprite[i].finaly){
            sprite[i].y += speed;
        }

        else if (sprite[i].y >= sprite[i].finaly){
          sprite[i].y = sprite[i].finaly
          sprite[i].movingy = 0
        }
      }
        else if (sprite[i].movingy == -1){
          if (sprite[i].y > sprite[i].finaly){
            sprite[i].y -= speed;
        }
        else if (sprite[i].y <= sprite[i].finaly){
          sprite[i].y = sprite[i].finaly
          sprite[i].movingy = 0
        }
      }
  }
}

//inicializamos todas las mugres que tengamos que inicialzar, creamos players, grid etc
function setup(){


  create_grid();


  sprite = create_player("juan")
  console.log(sprite)


  app.ticker.add(delta => gameLoop(delta));
}

let left = keyboard("ArrowLeft"),
    up = keyboard("ArrowUp"),
    right = keyboard("ArrowRight"),
    down = keyboard("ArrowDown");



function gameLoop(delta){
  
  
  up.press = () => {
    fucking_move(sprite,-1,"y")
    };
    
    
  down.press = () => {
      fucking_move(sprite,1,"y")
  };
    
    
  right.press = () => {
      fucking_move(sprite,1,"x")
  };
  
  left.press = () => {
    fucking_move(sprite,-1,"x")
  };

  new_move([sprite],2)


  new_move(lista_de_tiros,5)
  


  }
  setup();
  gameLoop();
