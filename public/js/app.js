var chatApp = angular.module('chatsecure', []);

/// services:

/// encryption service
chatApp.factory('encService', function() {
  return {
  };
});

/// socketio service
/// returns original io object, id defined;
chatApp.factory('ioService', function() {
  var service = io;
  if (service) {
    return service;
  }
  throw 'socket io is not defined';
});

/// communication service
/// dependencies: 
///  - encService - encoding service
///  - io - socket io;
chatApp.factory('commService', function(encService, ioService, $rootScope) {
  var localScope = $rootScope.$new();
  var socket = ioService.connect();

  socket.on('join', function(person) {
    localScope.$emit('join', person);
  });

  socket.on('msg', function(msg) {
    localScope.$emit('msg', msg);
  });

  var _service = {
    send: function(msg) {
      // var msg = {name:name, text:text};
      socket.emit('msg', msg);
      // console.log('message sent:' + msg);
    },
    login: function(name) {
      socket.emit('join', {name:name});
      // console.log('logged in as:' + name);
      return localScope;
    }
  };

  return _service;
});

/// controllers:

/// chat controller
var ChatCtrl = function($scope, commService, $window) {
  var name = $window.prompt('enter name');
  $scope.people = [];
  $scope.messages = []

  var listener = commService.login(name);
  listener.$on('join', function(e, person) {
    $scope.people.push(person.name);
    // console.log('by controller:', person);
    $scope.$digest();
  });

  listener.$on('msg', function(e, msg) {
    $scope.messages.push(msg.text);
    // console.log('by controller:', msg);
    $scope.$digest();
  });

  $scope.send = function(msg) {
    commService.send({name:name, text:msg});

    $scope.messages.push(msg);
    $scope.msg='';
  };

  // console.log('chat controller init');
  return this;
};