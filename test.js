const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Scale mode for all textures, will retain pixelation
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;


const min_step = 0.1  //cada movimiento va a ser un 10% de la pantalla 
//const player_offset = min_step + min_step/2 //offset para que quede centrado el mogolico en la grilla
const player_offset = min_step/2 //el de arriba sirve por si queremos dejar los bordes como pared o para displayear algo

function fucking_move(player,direccion,eje){
    //direccion puede ser +1 o -1 por si se mueve hacia adelante o atras en el eje
    if(eje == "x"){
        //checkea colision con los bordes
        if( player.posx + direccion >=0 && (min_step)*(player.posx+direccion)<1){ 
            player.posx += direccion
            //player.x = app.screen.width*(min_step)*(player.posx) + app.screen.width*(player_offset)  ;
            player.finalx = app.screen.width*(min_step)*(player.posx) + app.screen.width*(player_offset);
            player.movingx = direccion
        }
    }

    if(eje == "y"){
        if( player.posy + direccion >=0 && (min_step)*(player.posy+direccion)<1){
            player.posy += direccion
            player.finaly = app.screen.height*(min_step)*(player.posy) + app.screen.height*(player_offset)
            player.movingy = direccion
        }
    }

}

//hace la grilla en base al minstep
let i = 1
for(; i*min_step < 1 ;i++){
    let rectangle = new PIXI.Graphics();
    rectangle.beginFill(0x0);
    rectangle.drawRect(app.screen.width*min_step*i, 0, app.screen.width*0.001, app.screen.height);
    rectangle.endFill();
    app.stage.addChild(rectangle);

    let rectangle2 = new PIXI.Graphics();
    rectangle2.beginFill(0x0);
    rectangle2.drawRect(0, app.screen.height*min_step*i, app.screen.width, app.screen.height*0.001);
    rectangle2.endFill();
    app.stage.addChild(rectangle2);


}

const sprite = PIXI.Sprite.from('sprites/cubo.png');
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



// Opt-in to interactivity
sprite.interactive = true;

// Shows hand cursor
sprite.buttonMode = true;

// Pointers normalize touch and mouse
sprite.on('pointerdown', onClick);
// Alternatively, use the mouse & touch events:
// sprite.on('click', onClick); // mouse-only
// sprite.on('tap', onClick); // touch-only
function onClick() {
    fucking_move(sprite,1,"y");

}
app.stage.addChild(sprite);




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

//Capture the keyboard arrow keys

  app.ticker.add(delta => gameLoop(delta));

function move(sprite){
  if (sprite.movingx == 1){
      if (sprite.x < sprite.finalx){
          sprite.x += 2;
      }
      else if (sprite.x >= sprite.finalx){
        sprite.x = sprite.finalx
        sprite.movingx = 0
      }
    }
      else if (sprite.movingx == -1){
        if (sprite.x > sprite.finalx){
          sprite.x -= 2;
      }
      else if (sprite.x <= sprite.finalx){
        sprite.x = sprite.finalx
        sprite.movingx = 0
      }
  }

  if (sprite.movingy == 1){
      if (sprite.y < sprite.finaly){
          sprite.y += 2;
      }

      else if (sprite.y >= sprite.finaly){
        sprite.y = sprite.finaly
        sprite.movingy = 0
      }
    }
      else if (sprite.movingy == -1){
        if (sprite.y > sprite.finaly){
          sprite.y -= 2;
      }
      else if (sprite.y <= sprite.finaly){
        sprite.y = sprite.finaly
        sprite.movingy = 0
      }
    }
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

  move(sprite)


  }

  gameLoop();
  