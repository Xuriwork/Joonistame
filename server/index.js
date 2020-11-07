const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { customAlphabet } = require('nanoid/non-secure');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 20);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { addUser, deleteUser, getAllUsersInRoom, getAllUsersInLobby, getUser, emitUserIsCorrect, getAllUsersInRoomWhoGuessedCorrectly } = require('./actions/userActions');
const { addRoom, removeRoom, getRoom } = require('./actions/roomActions');
const { addCanvas, updateCanvas, getCanvasByRoomID, clearCanvas, removeCanvas } = require('./actions/canvasActions');
const { addLobby, deleteLobby, getLobby, checkIfNameExistsInLobby } = require('./actions/lobbyActions');

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../build'));
app.use(cors());
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'https://joonistame.herokuapp.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  };
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const createRandomID = () => {
  const randomId = nanoid();
  const formatedStringId = randomId.substring(0,5) + '-' + randomId.substring(5, 10) + '-' + randomId.substring(10, 15) + '-' + randomId.substring(15, 20);
  return formatedStringId;
};

io.on('connection', (socket) => {

  socket.on('JOIN_LOBBY', async ({ lobbyID, userCharacter, username }, callback) => {
    const lobby = await getLobby(lobbyID);
    const users = await getAllUsersInLobby(lobbyID);

    if (!lobby) return callback(false, 'No lobby with that ID exists');
    if (users.length === 10) {
      return callback(false, 'Sorry, this room is full ☹️')
    };

    const user = checkIfNameExistsInLobby(users, username);

    if (!user) {
      addUser({ id: socket.id, username, roomID: lobbyID, userCharacter });
      socket.join(lobbyID);
      socket.lobbyID = lobbyID;
      callback(true);
    } else {
      callback(false, 'Name is already in use');
      return;
    };
  });

  socket.on('CREATE_LOBBY', async ({ userCharacter, username }, callback) => {
    const lobbyID = createRandomID();
    const lobby = await getLobby(lobbyID)[0];

    if (!lobby) {
      addUser({ id: socket.id, username, roomID: lobbyID, userCharacter });
      addLobby({ host: socket.id, hostName: username, lobbyID })
      .then(() => {
        socket.join(lobbyID);
        socket.lobbyID = lobbyID;
        callback(lobbyID);
      })
      .catch((error) => console.log(error));
    };
  });

  socket.on('JOINED_LOBBY', async (lobbyID) => {
    const lobby = await getLobby(lobbyID);
    const users = await getAllUsersInLobby(lobbyID);

    if (users.length > 1) {
      io.sockets.connected[lobby[0].host].emit('ABLE_TO_START', true);
    };
    io.in(lobbyID).emit('GET_USERS', users);
  });

  socket.on('START_GAME', (roomID) => {
    io.in(roomID).emit('START_GAME');
  });

  socket.on('JOIN_GAME_ROOM', async ({ username, roomID, userCharacter }) => {
    console.log(roomID);
    const lobby = await deleteLobby(roomID);
    console.log('hostName', lobby);
    socket.lobbyID = null;
    socket.leaveAll();

    roomID = roomID.trim();
    username = username.trim();

    if (!roomID || !username) return;

    addUser({ id: socket.id, username, roomID, userCharacter });

    const users = getAllUsersInRoom(roomID);
    const room = getRoom(roomID);

    console.log('users', users);
    
    if (!room) {
      addRoom({ drawer: users[0].id, roomID });
      addCanvas({ roomID });
    };

    const { drawer } = getRoom(roomID);

    socket.join(roomID);
    socket.roomID = roomID;

    io.in(roomID).emit('MESSAGE', {
      type: 'SERVER-USER_JOINED',
      content: `${username} joined the room. 👋`
    });
    
    socket.to(roomID).emit('NEW_USER_JOINED');

    const canvas = getCanvasByRoomID(socket.roomID);
    
    if (canvas !== undefined) {
      socket.emit('GET_CANVAS', canvas.data);
    };
    
    socket.emit('SET_DRAWER', drawer);
    io.in(roomID).emit('GET_USERS', users);
  });

  const emitNewRound = () => {
    const roomID = socket.roomID;
    const users = getAllUsersInRoom(roomID);
    const room = getRoom(roomID);

    const indexOfCurrentDrawer = users.findIndex((user) => user.id === room.drawer);
    
    const newDrawer = users[indexOfCurrentDrawer + 1] ? users[indexOfCurrentDrawer + 1] : users[0];
    room.drawer = newDrawer.id;
    
    const usersInRoomWhoGuessedCorrectly = getAllUsersInRoomWhoGuessedCorrectly(roomID);
    usersInRoomWhoGuessedCorrectly.forEach((user) => user.isCorrectGuess = false);
    
    clearInterval(room.countdownTimer);
    io.in(roomID).emit('SET_DRAWER', newDrawer.id);
    io.in(socket.roomID).emit('NEW_ROUND');
    io.in(roomID).emit('GET_USERS', users);
  };

  socket.on('SET_WORD', (word) => {
    const room = getRoom(socket.roomID);
    room.word = word;

    const splitWord = word.split('');

    const hiddenWord = [];
    splitWord.forEach(() => hiddenWord.push('_'));

    socket.emit('SET_WORD', word);
    socket.to(socket.roomID).emit('SET_WORD', hiddenWord);

    let countdown = 90;
    room.countdownTimer = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(room.countdownTimer);
        emitNewRound();
      };
    }, 1000);
  });

  socket.on('RESIZED', () => {
    const canvas = getCanvasByRoomID(socket.roomID);
    socket.emit('RESIZED', canvas.data);
  });

  socket.on('DRAW', (data) => {
    const canvas = updateCanvas(socket.roomID, data);
    socket.to(socket.roomID).emit('DRAW', canvas);
  });

  socket.on('CLEAR_CANVAS', () => {
    clearCanvas(socket.roomID);
    socket.broadcast.emit('CLEAR_CANVAS');
  });

  socket.on('SEND_MESSAGE', (data) => {
    const room = getRoom(socket.roomID);
    const user = getUser(socket.id);

    if (data.content.toLowerCase() === room.word.toLowerCase()) {
      if (socket.id === room.drawer) return;
      emitUserIsCorrect({ id: socket.id, io, drawerUserID: room.drawer, roomID: socket.roomID });
      
      const usersWhoGuessedCorrectly = getAllUsersInRoomWhoGuessedCorrectly(socket.roomID);
      const usersInRoom = getAllUsersInRoom(socket.roomID);

      if (usersInRoom.length - 1 === usersWhoGuessedCorrectly.length) {
        emitNewRound();
      };

      return io.in(socket.roomID).emit('MESSAGE', {
        type: 'SERVER-NEW_ROUND',
        content: 'New round',
      });
    };

    io.in(socket.roomID).emit('MESSAGE', { 
      username: user.username, 
      content: data.content, 
      id: socket.id 
    });
  });

  socket.on('disconnect', async () => {

    const user = await deleteUser(socket.id);

    if (socket.lobbyID) {
      const lobby = await getLobby(socket.lobbyID);
      const users = await getAllUsersInLobby(socket.lobbyID);
      const userWasLobbyHost = socket.id === lobby.host;
      
      if (userWasLobbyHost && users.length > 0) {
        lobby.host = users[0].id;
        io.in(socket.lobbyID).emit('GET_USERS', users);
      };

      if (users.length === 0) deleteLobby(socket.lobbyID);

      if (users.length === 1) {
        io.sockets.connected[lobby[0].host].emit('ABLE_TO_START', false);
      };

      io.in(socket.lobbyID).emit('GET_USERS', users);
    };

    if (socket.roomID) {
      const room = getRoom(socket.roomID);
      const users = getAllUsersInRoom(user.roomID);
      const userWasAdmin = socket.id === room.drawer;

      if (userWasAdmin && users.length > 0) {
        room.drawer = users[0].id;

        io.in(user.roomID).emit('SET_DRAWER', room.drawer);
        io.in(user.roomID).emit('MESSAGE', {
          type: 'NEW_DRAWER',
          content: `${users[0].username} is now the drawer. ✏️`,
        });

      } else if (users.length === 0) {
        removeRoom(socket.roomID);
        removeCanvas(socket.roomID);
      };

      io.in(user.roomID).emit('MESSAGE', {
        type: 'SERVER_USER-LEFT',
        content: `${user.username} has left the room.`,
      });

      io.in(user.roomID).emit('GET_USERS', users);
    };
  });
});

server.listen(PORT, () => console.log('Server is listening on: ' + PORT));

module.exports = app;