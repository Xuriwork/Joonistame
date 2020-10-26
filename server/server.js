const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { addUser, removeUser, getAllUsersInRoom } = require('./actions/userActions');
const { addRoom, removeRoom, getRoomByName } = require('./actions/roomActions');
const { addCanvas, updateCanvas, getCanvasByRoomId, clearCanvas, removeCanvas } = require('./actions/canvasActions');

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + '/../../build'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

io.on('connection', (socket) => {

  socket.on('JOIN', ({ username, roomName }) => {
    socket.leaveAll();

    if (username.trim() === '') return;
    if (roomName.trim() === '') return;

    console.log('New user connected', username, socket.id);

    roomName = roomName.trim();
    username = username.trim();

    addUser({ id: socket.id, username, roomName });

    const users = getAllUsersInRoom(roomName);

    const room = getRoomByName(roomName);
    const roomId = shortid.generate();
    if (!room) {
      addRoom({ name: roomName, drawer: users[0].id, roomId });
      addCanvas({ roomId })
    };

    const { drawer } = getRoomByName(roomName);

    socket.join(roomName);
    socket.roomId = roomId;
    socket.roomName = roomName;

    console.log(socket.roomId);

    const canvas = getCanvasByRoomId(socket.roomId);
    console.log(canvas);
    socket.emit('GET_CANVAS', canvas.data);
    
    socket.emit('SET_DRAWER', drawer);
    io.in(roomName).emit('GET_USERS', users);
  });

  socket.on('RESIZED', () => {
    const canvas = getCanvasByRoomId(socket.roomId);
    socket.emit('RESIZED', canvas.data);
  });

  socket.on('DRAW', (data) => {
    const canvas = updateCanvas(socket.roomId, data);
    socket.broadcast.emit('DRAW', canvas);
  });

  socket.on('ERASE_CANVAS', (data) => {
    console.log('Erasing Canvas');
    clearCanvas(socket.roomId);
    socket.broadcast.emit('ERASE_CANVAS');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    const user = removeUser(socket.id);
    if (user) {
      const room = getRoomByName(socket.roomName);

      const userWasAdmin = socket.id === room.drawer;
      const users = getAllUsersInRoom(user.roomName);

      if (userWasAdmin && users.length > 0) {
        room.drawer = users[0].id;

        io.in(user.roomName).emit('SET_DRAWER', room.drawer);
        io.in(user.roomName).emit('MESSAGE', {
          type: 'NEW_DRAWER',
          content: `${users[0].username} is now the drawer. 🖌️`,
        });

      } else if (users.length === 0) {
        removeRoom(socket.roomName);
        removeCanvas(socket.roomId);
      };

      io.in(user.roomName).emit('MESSAGE', {
        type: 'SERVER_USER-LEFT',
        content: `${user.username} has left the room.`,
      });

      io.in(user.roomName).emit('GET_USERS', users);
    };
  });
});

server.listen(PORT, () => console.log('Server is listening on: ' + PORT));

module.exports = app;