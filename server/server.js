const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { customAlphabet } = require('nanoid/non-secure');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 20);

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { addUser, removeUser, getAllUsersInRoom, getUser } = require('./actions/userActions');
const { rooms, addRoom, removeRoom, getRoomByRoomID } = require('./actions/roomActions');
const { addCanvas, updateCanvas, getCanvasByRoomID, clearCanvas, removeCanvas } = require('./actions/canvasActions');

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../build'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.post('/join', (req, res) => {
//   let roomId = req.body.roomId;
//   let socketId = req.body.socketId;
//   let name = req.body.name;


// });

app.post('/create-room', (req, res) => {

  const socketID = req.body.socketID;
  console.log('socketID', socketID);
  console.log('rooms', rooms);

  const createRandomRoomID = (e) => {
    const randomId = nanoid();
		const formatedStringId = randomId.substring(0,5) + '-' + randomId.substring(5, 10) + '-' + randomId.substring(10, 15) + '-' + randomId.substring(15, 20);
		return formatedStringId;
  };

  const roomID = createRandomRoomID();

  const room = getRoomByRoomID(roomID);

  console.log('room', room);

  if (!room) {
    addRoom({ drawer: socketID, roomID });
    addCanvas({ roomID });
    console.log('Added');
  };

  return res.status(201).json({ roomID });
});

app.post('/get-lobby/:roomID', (req, res) => {

  const roomID = req.params.roomID;
  console.log('roomID', roomID);
  console.log('rooms', rooms);

  const users = getAllUsersInRoom(roomID);

  console.log(users);

  return res.status(201).json({ users });
});

io.on('connection', (socket) => {

  socket.on('JOIN', ({ username, roomID, userCharacter }) => {
    console.log('New user connected', username, socket.id, roomID);

    roomID = roomID.trim();
    username = username.trim();

    if (!roomID || !username) return;

    addUser({ id: socket.id, username, roomID, userCharacter });

    const users = getAllUsersInRoom(roomID);

    const room = getRoomByRoomID(roomID);
    
    console.log(socket.id);
    console.log(users);

    if (!room) {
      addRoom({ drawer: users[0].id, roomID });
      addCanvas({ roomID });
      console.log('Added');
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
    console.log('canvas', canvas);
    
    if (canvas !== undefined) {
      socket.emit('GET_CANVAS', canvas.data);
    };
    
    socket.emit('SET_DRAWER', drawer);
    io.in(roomID).emit('GET_USERS', users);
  });

  socket.on('RESIZED', () => {
    const canvas = getCanvasByRoomID(socket.roomID);
    socket.emit('RESIZED', canvas.data);
  });

  socket.on('DRAW', (data) => {
    const canvas = updateCanvas(socket.roomID, data);
    socket.broadcast.emit('DRAW', canvas);
  });

  socket.on('CLEAR_CANVAS', (data) => {
    console.log('Clearing Canvas');
    clearCanvas(socket.roomID);
    socket.broadcast.emit('CLEAR_CANVAS');
  });

  socket.on('SEND_MESSAGE', (data) => {
    const user = getUser(socket.id);
    io.in(user.roomID).emit('MESSAGE', { 
      username: user.username, 
      content: data.content, 
      id: socket.id 
    });
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      const room = getRoomByRoomID(socket.roomID);

      const userWasAdmin = socket.id === room.drawer;
      const users = getAllUsersInRoom(user.roomID);

      if (userWasAdmin && users.length > 0) {
        room.drawer = users[0].id;

        io.in(user.roomID).emit('SET_DRAWER', room.drawer);
        io.in(user.roomID).emit('MESSAGE', {
          type: 'NEW_DRAWER',
          content: `${users[0].username} is now the drawer. 🖌️`,
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