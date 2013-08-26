var chatApp = angular.module('chatsecure', ['ngRoute']);

/// configuration:
chatApp.config(function($routeProvider) {
  $routeProvider.
  when('/chat', {
    templateUrl : '/templates/chat.html',
    controller : 'ChatCtrl'
  }).
  when('/login', {
    templateUrl : '/templates/login.html',
    controller : 'LoginCtrl'
  }).
  otherwise({
    redirectTo : '/login'
  });
});

/// services:

/// user input
chatApp.value('userInput', {
  name : null,
  room : null
});

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
chatApp.controller('ChatCtrl', function($scope, commService, userInput) {  
  $scope.people = [];
  $scope.messages = []

  var listener = commService.login(userInput.name);

  listener.$on('join', function(e, person) {
    $scope.$apply(function() {
      $scope.people.push(person.name);
    });
  });

  listener.$on('msg', function(e, msg) {
    $scope.$apply(function(){
      $scope.messages.push(msg.text);
    });
  });

  $scope.send = function(msg) {
    commService.send({name:name, text:msg});

    $scope.messages.push(msg);
    $scope.msg='';
  };
});

chatApp.controller('LoginCtrl', function($scope, $location, userInput) {  
  console.log('login init');

  $scope.submit = function(name, room) {
    userInput.name = name;
    userInput.room = room;
    // console.log('userInput', userInput);
    $location.path("/chat");
  };
});
