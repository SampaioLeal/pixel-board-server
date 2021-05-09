const io = require("socket.io")(3003, { cors: { origin: "*" } });

function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  return "#" + randomColor;
}

function notifyAll() {
  io.emit("update", project);
}

/**
 * IPlayer {
 *   id: string
 *   color: string
 * }
 */

class Sketch {
  lines = 50;
  columns = 70;
  players = [];
  pixels = Array.from(Array(this.lines), () =>
    new Array(this.columns).fill("transparent")
  );

  constructor() {}

  refreshPlayers = async () => {
    const sockets = await io.fetchSockets();
    const players = sockets.map((socket) => ({
      id: socket.id,
      color: getRandomColor(),
    }));

    this.players = players;
    notifyAll();
  };

  paintPixel = (line, column, color) => {
    this.pixels[line][column] = color;
    notifyAll();
  };
}

const project = new Sketch();

io.on("connection", (socket) => {
  // console.log(socket);

  project.refreshPlayers();

  socket.on("paint", project.paintPixel);

  socket.on("disconnect", () => {
    project.refreshPlayers();
  });
});
