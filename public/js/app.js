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
chatApp.factory('commService', function(encService, ioService) {
  var socket = ioService.connect();
  return {
    send: function(msg) {
      console.log('message sent:' + msg);
    },
    login: function(name) {
      socket.emit('join', {name:name});
      console.log('logged in as:' + name);
    }
  };
});

/// controllers:

/// chat controller
var ChatCtrl = function($scope, commService, $window) {
  var name = $window.prompt('enter name');
  commService.login(name);

  $scope.people = [name];
  $scope.messages = ['chat -1','chat -2'];  

  console.log('chat controller init');
  
  $scope.send = function(msg) {
    $scope.messages.push(msg);
    commService.send(msg);
    $scope.msg='';
  };

  return this;
};