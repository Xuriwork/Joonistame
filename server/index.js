const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { customAlphabet } = require('nanoid/non-secure');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 20);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { addUser, deleteUser, getAllUsersInRoom, getAllUsersInLobby, getUser, emitUserIsCorrect, getAllUsersInRoomWhoGuessedCorrectly, resetIsCorrectGuessStatus } = require('./actions/userActions');
const { addRoom, removeRoom, getRoom, setNewDrawer, setNewWord } = require('./actions/roomActions');
const { addCanvas, updateCanvas, getCanvasByRoomID, clearCanvas, removeCanvas } = require('./actions/canvasActions');
const { addLobby, addUserToLobby, removeUserFromLobby, deleteLobby, getLobby, checkIfNameExistsInLobby } = require('./actions/lobbyActions');

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

    if (!lobby[0]) return callback(false, 'No lobby with that ID exists');
    if (users.length === 10) {
      return callback(false, 'Sorry, this room is full ☹️')
    };

    const user = checkIfNameExistsInLobby(users, username);

    console.log(user);

    if (!user) {
      addUserToLobby({ lobbyID, user: { id: socket.id, username, userCharacter } });
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
    const lobby = await getLobby(lobbyID);

    if (!lobby[0]) {
      await addLobby({ host: socket.id, hostName: username, lobbyID })
      .then(() => {
        addUserToLobby({ lobbyID, user: { id: socket.id, username, userCharacter } });
        socket.join(lobbyID);
        socket.lobbyID = lobbyID;
      })
      .then(() => callback(lobbyID))
      .catch((error) => console.log(error));
    };
  });

  socket.on('JOINED_LOBBY', async (lobbyID) => {
    const lobby = await getLobby(lobbyID);

    if (lobby[0] && lobby[0].users.length > 1) {
      
      io.sockets.connected[lobby[0].host].emit('ABLE_TO_START', true);
    };
    io.in(lobbyID).emit('GET_USERS', lobby[0].users);
  });

  socket.on('START_GAME', (roomID) => {
    io.in(roomID).emit('START_GAME');
  });

  socket.on('JOIN_GAME_ROOM', async ({ username, roomID, userCharacter }) => {
    const lobby = await getLobby(roomID);

    if (lobby[0]) {
      socket.lobbyID = null;
      socket.leaveAll();

      roomID = roomID.trim();
      username = username.trim();

      if (!roomID || !username) return;

      const user = await getUser(socket.id);
      if (!user[0]) {
        await addUser({ id: socket.id, username, roomID, userCharacter });
      };

      const users = await getAllUsersInRoom(roomID);
      
      const drawer = users.find((user) => user.username === lobby[0].hostName).id;
      
      const room = await getRoom(roomID);
      
      if (!room[0]) {
        await addRoom({ drawer, roomID });
        addCanvas({ roomID });
      };
      
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
    };
  });

  const emitNewRound = async () => {
    const roomID = socket.roomID;
    const users = await getAllUsersInRoom(roomID);
    const room = await getRoom(roomID);

    const indexOfCurrentDrawer = users.findIndex((user) => user.id === room[0].drawer);
    const newDrawer = users[indexOfCurrentDrawer + 1] ? users[indexOfCurrentDrawer + 1] : users[0];

    await setNewDrawer({ roomID: newDrawer.id, drawer: newDrawer });
    await resetIsCorrectGuessStatus(roomID);
    
    //clearInterval(room[0].countdownTimer);
    io.in(roomID).emit('CLEAR_CANVAS');
    io.in(socket.roomID).emit('NEW_ROUND');
    io.in(roomID).emit('SET_DRAWER', newDrawer.id);
    io.in(roomID).emit('GET_USERS', users);
    clearCanvas(socket.roomID);
    console.log('New Round')
  };

  socket.on('SET_WORD', async (word) => {
    const room = await getRoom(socket.roomID);
    await setNewWord({ roomID: socket.roomID, word });

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

  socket.on('SEND_MESSAGE', async (data) => {
    const room = await getRoom(socket.roomID);
    const user = await getUser(socket.id);

    if (room[0]) {
      if (data.content.toLowerCase() === room[0].word.toLowerCase()) {
        console.log(data.content)
        
        if (socket.id === room[0].drawer) return;
        
        await emitUserIsCorrect({ userID: socket.id, io, drawerUserID: room[0].drawer, roomID: socket.roomID });
        const usersWhoGuessedCorrectly = await getAllUsersInRoomWhoGuessedCorrectly(socket.roomID);
        const usersInRoom = await getAllUsersInRoom(socket.roomID);

        console.log(usersInRoom.length - 1, usersWhoGuessedCorrectly.length)

        if (usersInRoom.length - 1 === usersWhoGuessedCorrectly.length) {
          emitNewRound();
        };

        return io.in(socket.roomID).emit('MESSAGE', {
          type: 'SERVER-NEW_ROUND',
          content: 'New round',
        });
      };
  
      if (user[0]) {
        io.in(socket.roomID).emit('MESSAGE', { 
          username: user[0].username, 
          content: data.content, 
          id: socket.id 
        });
      }
    };

  });

  socket.on('disconnect', async () => {

    const user = await deleteUser(socket.id);
    
    // if (socket.lobbyID) {
    //   const lobby = await getLobby(socket.lobbyID);
    //   const userWasLobbyHost = socket.id === lobby.host;
    //   const users = lobby[0].users;
      
    //   if (user[0]) {
    //     await removeUserFromLobby({ lobbyID: socket.lobbyID, user: { id: socket.id, username: user[0].username, userCharacter: user[0].userCharacter } });
    //   };
        
    //   if (userWasLobbyHost && users.length > 0) {
    //     lobby.host = users[0].id;
    //     io.in(socket.lobbyID).emit('GET_USERS', users);
    //   };

    //   if (users.length === 0) await deleteLobby(socket.lobbyID);

    //   if (lobby[0] && lobby[0].host && users.length === 1) {
    //     io.sockets.connected[lobby[0].host].emit('ABLE_TO_START', false);
    //   };

    //   io.in(socket.lobbyID).emit('GET_USERS', users);
    // };

    if (socket.roomID) {
      const room = await getRoom(socket.roomID);
      const drawer = room[0].drawer;
      const users = getAllUsersInRoom(user.roomID);
      const userWasAdmin = socket.id === drawer;

      if (userWasAdmin && users.length > 0) {
        setNewDrawer({ room: room[0].roomID, drawer: users[0].id });

        io.in(user.roomID).emit('SET_DRAWER', drawer);
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