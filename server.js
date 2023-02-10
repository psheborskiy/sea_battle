const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const MAX_USERS = 2;
const PREPARATION_TIME = 10;

let timer = PREPARATION_TIME;
let interval = null;
let turn = null;
let game = {};
let status = "Waiting opponent connction";

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});

io.on("connection", (socket) => {
  console.info("a user connected");
  changeGameStatus("Waiting opponent connction");

  if (io.engine.clientsCount > MAX_USERS) {
    socket.disconnect();
    return;
  }

  if (io.engine.clientsCount === 2) {
    changeGameStatus("Waiting for start");
  }

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("fire", (msg) => {
    const opponentId = Object.keys(game).filter((i) => i != socket.id);
    const opponentBoard = game[opponentId].board;

    if (turn === `${socket.id}`) {
      switchTurn();
      if (!!opponentBoard[msg.y][msg.x] === true) {
        io.to(opponentId).emit("drowned", msg);
        socket.emit("injured", msg);
      } else {
        socket.emit("miss", msg);
      }
    }
  });

  socket.on("new_game", () => {
    console.info(`New game request! Players online: ${io.engine.clientsCount}`);

    startNewGame();

    if (io.engine.clientsCount === 2) {
      changeGameStatus("Boats placement...");
      startBackTimer(socket);
    }
  });

  socket.on("boardGenerated", (board) => {
    console.log("boardGenerated " + socket.id);
    const count = board.reduce(
      (currentCount, row) =>
        currentCount + row.filter((i) => !!i === true).length,
      0
    );

    if (count === 20) {
      console.log("Add to game: " + socket.id);
      game[`${socket.id}`] = {
        board: board,
      };
    }
  });
});

function startBackTimer() {
  sendInfo("Please generate boats before 60s!");

  interval = setInterval(() => {
    timer = timer - 1;

    io.emit("timer", {
      timer: timer,
    });

    if (timer <= 0) {
      onBackTimerEnd();
    }
  }, 1000);
}

function onBackTimerEnd() {
  clearInterval(interval);

  setTimeout(() => {
    playersValidation();
  }, 1500);
}

async function playersValidation() {
  if (Object.keys(game).length === 2) {
    changeGameStatus(`Battle!!!`);
    switchTurn();
  } else {
    game = {};
    timer = PREPARATION_TIME;

    changeGameStatus("need restart!");
    sendInfo("Please restart game, some user didn't generate boats");
  }
}

function switchTurn() {
  turn = Object.keys(game).filter((id) => id != turn)[0];
  io.emit("turn", turn);
}

function startNewGame() {
  timer = PREPARATION_TIME;
  game = {};
  turn = null;
  status = "Waiting opponent connction";

  io.emit("new_game")
}

function changeGameStatus(newStatus) {
  status = newStatus;
  io.emit("game_status_changed", status);
}

function sendInfo(message) {
  io.emit("info", {
    message: message,
  });
}
