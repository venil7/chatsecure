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
  people = [];

server.listen(process.env.PORT || 3000);

io.sockets.on('connection', function(socket) {
  socket.on('join', function(person) {
    people.push(person);
    socket.broadcast.emit('join', person);
    for(var i in people) {
      socket.emit('join', people[i]);
    }
  });

  socket.on('msg', function(msg){
    socket.broadcast.emit('msg', msg);
  });
});