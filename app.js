/*
* Chat Secure serverside;
*/

var static = require('node-static'),
  socket_io = require('socket.io'),
/*  _ = require('underscore');*/
  file = new(static.Server)('./public'),
  http = require('http'),
  server = http.createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response);
    }).resume();
  }),
  io = socket_io.listen(server, {log: false}),
  people = [];

server.listen(process.env.PORT || 3000);

io.sockets.on('connection', function(socket) {
  
  socket.on('join', function(user) {
    user.id = socket.id;
    socket.user = user;
    socket.join(user.room);
    people.push(user);
    // letting others know user arrived
    socket.broadcast.in(user.room).emit('join', user);
    // letting user himself know about everyone in chat including himself
    var room_people = io.sockets.clients(user.room).map(function(s){
      return s.user
    });
    for(var i in room_people) {
      socket.emit('join', room_people[i]);
    }
  });

  socket.on('msg', function(msg){
    var room  = (socket.user && socket.user.room) || '';
    msg.user = socket.user;
    socket.broadcast.in(room).emit('msg', msg);
  });

  socket.on('leave', function () {
    var room  = (socket.user && socket.user.room) || '';
    socket.broadcast.in(room).emit('leave', socket.id);
    socket.leave(room);
  });

  socket.on('disconnect', function () {
    var room  = (socket.user && socket.user.room) || '';
    socket.broadcast.in(room).emit('leave', socket.id);
  });
});