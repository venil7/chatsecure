/*
* Chat Secure serverside;
*/

var static = require('node-static'),
  socket_io = require('socket.io'),
  file = new(static.Server)('./public'),
  http = require('http'),
  server = http.createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response);
    }).resume();
  }),
  io = socket_io.listen(server),
  // people = [];
  rooms = [];

server.listen(process.env.PORT || 3000);

io.sockets.on('connection', function(socket) {
  
  socket.on('join', function(user) {
    user.id = socket.id;
    socket.user = user;
    socket.join(user.room);
    rooms[user.room] = rooms[user.room] || [];
    var people = rooms[user.room];
    people.push(user);
    // people.push(user);
    // letting others know user arrived
    socket.broadcast.in(user.room).emit('join', user);
    // letting user himself know about everyone in chat including himself
    for(var i in people) {
      socket.emit('join', people[i]);
    }
  });

  socket.on('msg', function(msg){
    socket.broadcast.in(socket.user.room || '').emit('msg', msg);
  });

  socket.on('leave', function () {
    socket.broadcast.in(socket.user.room || '').emit('leave', socket.id);
    socket.leave(room);
  });

  socket.on('disconnect', function () {
    socket.broadcast.in(socket.user.room || '').emit('leave', socket.id);
  });
});