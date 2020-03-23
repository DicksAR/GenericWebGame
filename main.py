from tornado import web
from tornado import locks
from tornado import gen
from tornado import ioloop
from tornado import escape

import time

import uuid

start_time = 0

round_time = 5

settings = {
    "rows" : 10,
    "columns" : 10,
    "max_players" : 8,
    "initial_player_positions" : [
        {"x": 6, "y": 0},
        {"x": 9, "y": 2},
        {"x": 9, "y": 6},
        {"x": 7, "y": 9},
        {"x": 3, "y": 9},
        {"x": 0, "y": 7},
        {"x": 0, "y": 3},
        {"x": 2, "y": 0}
    ]
}

game_lock = locks.Lock()
game = {
    "waiting": True,

    "time" : 0,

    "round_start_time" : 0,

    "round_started" : 0,

    "round_time": round_time,

    "round_time_left" : round_time,

    "round" : 0,

    "players" : {},

    "last_actions" : []
}

{ "actions" : [ 
    {"move" : "up"},
    {"move" : "down"},
    {"shoot" : "up"},
]}

# def update(game: game_state, actions: [actions]) -> game_state:
#     pass


async def new_round():
    async with game_lock:
        game["round"] += 1
#         game["round_time_left"] = game["round_time"]
#         game["round_start_time"] = game["time"]

#         for player_uuid, action in game["last_actions"]:




async def update():
    async with game_lock:
        game["time"] = round(time.time() - start_time, 2)
        game["round_time_left"] = game["time"] - game["round_start_time"]
        print(game["time"], game["round_start_time"])
        # game["round_time_left"] = game["round_time"] - game["round_time_left"]

async def start():
    async with game_lock:
        for player in enumerate(game["players"].values()):
            player['position'] = settings["initial_player_positions"]
        game["waiting"] = False


class JoinHandler(web.RequestHandler):
    async def post(self):
        if self.request.headers.get('Content-Type') == "application/json":
            json = escape.json_decode(self.request.body)
            username = json.get('name')
        else:
            username = self.get_argument('name')
        if game["waiting"]:
            async with game_lock:
                if len(game["players"]) == settings["max_players"]:
                    self.write({"error": "Sala llena"})
                    return
                user_uuid = str(uuid.uuid4())
                #Crear nuevo jugador
                game["players"][user_uuid] = {"name":username}
            self.set_secure_cookie('user', user_uuid.encode('utf-8'))
            self.write({"ok": "Joined"})
        else:
            self.write({"error": "La partida ya ha iniciado"})
        #@TODO: Enviar evento a los viewers (?)

class LeaveHandler(web.RequestHandler):
    async def get(self): #@TODO: Cambiar a POST
        user_uuid = self.get_secure_cookie('user')
        if user_uuid:
            async with game_lock:
                if game["players"].get(user_uuid):
                    game["players"].pop(user_uuid)
                    self.clear_cookie('user')
                    self.write({"ok": "Se ha abandonado la partida"})
                else:
                    self.write({"error": "No estás en esta partida man"})
        else:
            self.write({"error": "Ni Dios sabe quién sos"})
        #@TODO: Si la partida ya empezó se tiene que registrar como un evento, supongo

class CommandHandler(web.RequestHandler):
    def get(self, command):
        if command == "join":
            self.set_cookie('Cookie!!', "Valor")
            #La pregunta aca es como pasarlo luego a WebSockets...
            # Opción 1: Que el Join se devuelva en el Json una intrucción (set-cookie)
            # que el frontend extraiga y setee la cookie
            # Desventaja: Hay que hacer las implementaciones en el front-end para extraer las cookies de
            # la respuesta del websocket y para enviar esta cookie en cada mensaje websocket
            # Para pensar: Cómo implementar la identificación por websockets
            # Se puede enviar la cookie una sola vez y dejar que el backend adminstre las sesiones

    def post(self, command):
        if command == "actions":
            #process action
            action = None
            with game_lock:
                game['last_actions'].append(action)


class StatusHandler(web.RequestHandler):
    def get(self):
        self.write(game)



#HTML handlers

class ViewerHandler(web.RequestHandler):
    def get(self):
        self.render('viewer.html')

class PlayerHandler(web.RequestHandler):
    def get(self):
        self.render('player.html')

async def main_loop():
    ms = 200
    tick = 0
    while True:
        nxt = gen.sleep(ms/1000) # Start the clock.
        await update()       # Run while the clock is ticking.
        if tick >= (round_time * 1000 / ms):
            tick = 0
            await new_round()
        else:
            tick += 1
        await nxt            # Wait for the timer to run out.

def main():
    app = web.Application([
        (r"/status", StatusHandler),
        (r"/viewer", ViewerHandler),
        (r"/player", PlayerHandler),
        (r"/join", JoinHandler),
        (r"/leave", LeaveHandler),
        (r"/(command|join|action)", CommandHandler),
    ],
        cookie_secret=u"はじめまして、Gianfrancoです"
    )
    app.listen(8888)
    global start_time
    start_time = round(time.time(),2)
    # callback = ioloop.PeriodicCallback(update, 200)
    # callback.start()
    # ioloop.IOLoop.current().spawn_callback(main_loop)
    ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()