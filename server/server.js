const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { customAlphabet } = require('nanoid/non-secure');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 20);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { addUser, removeUser, getAllUsersInRoom, getUser, emitUserIsCorrect, getAllUsersInRoomWhoGuessedCorrectly } = require('./actions/userActions');
const { addRoom, removeRoom, getRoomByRoomID } = require('./actions/roomActions');
const { addCanvas, updateCanvas, getCanvasByRoomID, clearCanvas, removeCanvas } = require('./actions/canvasActions');
const { addLobby, addUserToLobby, removeUserFromLobby, removeLobby, getLobbyByLobbyID, checkIfNameExistsInLobby } = require('./actions/lobbyActions');

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../build'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const createRandomRoomID = () => {
  const randomId = nanoid();
  const formatedStringId = randomId.substring(0,5) + '-' + randomId.substring(5, 10) + '-' + randomId.substring(10, 15) + '-' + randomId.substring(15, 20);
  return formatedStringId;
};

io.on('connection', (socket) => {

  socket.on('JOIN_LOBBY', ({ roomID, userCharacter, username }, callback) => {
    const lobby = getLobbyByLobbyID(roomID);
    if (!lobby) return callback(false, 'No lobby with that ID exists');
    if (lobby.users.length === 10) {
      return callback(false, 'Sorry, this room is full ☹️')
    };

    const user = checkIfNameExistsInLobby(lobby.users, username);

    if (!user) {
      addUserToLobby({ id: socket.id, username, roomID, userCharacter });
      socket.join(roomID);
      socket.roomID = roomID;
      callback(true);
    } else {
      callback(false, 'Name is already in use');
      return;
    };
  });

  socket.on('CREATE_LOBBY', ({ userCharacter, username }, callback) => {
    const roomID = createRandomRoomID();
    const room = getRoomByRoomID(roomID);
    if (!room) {
      addLobby({ drawer: socket.id, roomID });
      addUserToLobby({ id: socket.id, username, roomID, userCharacter });
      socket.join(roomID);
      socket.roomID = roomID;
      callback(roomID);
    };
  });

  socket.on('JOINED_LOBBY', (roomID) => {
    const { users, drawer } = getLobbyByLobbyID(roomID);

    if (users.length > 1) {
      io.sockets.connected[drawer].emit('ABLE_TO_START');
    };
    
    io.in(roomID).emit('GET_USERS', users);
  });

  socket.on('START_GAME', (roomID) => {
    io.in(roomID).emit('START_GAME');
  });

  socket.on('JOIN_GAME_ROOM', ({ username, roomID, userCharacter }) => {
    removeLobby(roomID);
    socket.roomID = null;
    socket.leaveAll();

    roomID = roomID.trim();
    username = username.trim();

    if (!roomID || !username) return;

    addUser({ id: socket.id, username, roomID, userCharacter });

    const users = getAllUsersInRoom(roomID);
    const room = getRoomByRoomID(roomID);
    
    if (!room) {
      addRoom({ drawer: users[0].id, roomID });
      addCanvas({ roomID });
    };

    const { drawer } = getRoomByRoomID(roomID);

    socket.join(roomID);
    socket.roomID = roomID;
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

  socket.on('NEW_ROUND', () => {
    const users = getAllUsersInRoomWhoGuessedCorrectly(socket.roomID);
    users.forEach((user) => user.isCorrectGuess = false);
    io.in(socket.roomID).emit('GET_USERS', users);
    io.in(socket.roomID).emit('NEW_ROUND');
  });

  socket.on('SET_WORD', (word) => {
    const room = getRoomByRoomID(socket.roomID);
    room.word = word;

    const splitWord = word.split('');

    const hiddenWord = [];
    splitWord.forEach(() => hiddenWord.push('_'));

    socket.emit('SET_WORD', word);
    socket.to(socket.roomID).emit('SET_WORD', hiddenWord);

    let countdown = 90;
    const countdownTimer = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(countdownTimer);
        io.in(socket.roomID).emit('NEW_ROUND');
      };
    }, 1000);
  });

  socket.on('RESIZED', () => {
    const canvas = getCanvasByRoomID(socket.roomID);
    socket.emit('RESIZED', canvas.data);
  });

  socket.on('DRAW', (data) => {
    const canvas = updateCanvas(socket.roomID, data);
    console.log('Draw');
    socket.to(socket.roomID).emit('DRAW', canvas);
  });

  socket.on('CLEAR_CANVAS', () => {
    clearCanvas(socket.roomID);
    socket.broadcast.emit('CLEAR_CANVAS');
  });

  socket.on('SEND_MESSAGE', (data) => {
    const room = getRoomByRoomID(socket.roomID);
    const user = getUser(socket.id);

    if (data.content.toLowerCase() === room.word.toLowerCase()) {
      if (socket.id === room.drawer) return;
      emitUserIsCorrect({ user, io, drawerUserID: room.drawer });
      
      const usersWhoGuessedCorrectly = getAllUsersInRoomWhoGuessedCorrectly(socket.roomID);
      const usersInRoom = getAllUsersInRoom(socket.roomID);

      console.log(usersInRoom.length, usersWhoGuessedCorrectly.length)

      if (usersInRoom.length - 1 === usersWhoGuessedCorrectly.length) {
        io.in(socket.roomID).emit('NEW_ROUND');
      };

      return;
    };

    io.in(user.roomID).emit('MESSAGE', { 
      username: user.username, 
      content: data.content, 
      id: socket.id 
    });
  });

  socket.on('disconnect', () => {

    // const test = true;
    // if (test) return;
    
    const user = removeUser(socket.id);
    const userInLobby = removeUserFromLobby({ userID: socket.id, roomID: socket.roomID });

    if (userInLobby) {
      const lobby = getLobbyByLobbyID(socket.roomID);
      if (lobby.users.length === 0) removeLobby(socket.id);
      io.in(socket.roomID).emit('GET_USERS', lobby.users);
    };

    if (user) {
      const room = getRoomByRoomID(socket.roomID);

      const userWasAdmin = socket.id === room.drawer;
      const users = getAllUsersInRoom(user.roomID);

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