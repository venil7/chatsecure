var chatApp = angular.module('chatsecure', ['ngRoute']);

/// configuration:
chatApp.config(function($routeProvider) {
  $routeProvider.
  when('/chat', {
    templateUrl : '/templates/chat.html',
    controller : 'ChatCtrl',
    restricted : true
  }).
  when('/login', {
    templateUrl : '/templates/login.html',
    controller : 'LoginCtrl',
    restricted : false
  }).
  otherwise({
    redirectTo : '/login'
  });
});

/// bootstrap configuration

chatApp.run(function ($rootScope, $location, userInput) {
  $rootScope.$on('$routeChangeStart', function(e, next, current){
    if (!next.restricted || !userInput.name || !userInput.room) {
      $location.path('/login');
    }
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

    socket.on('leave', function(id) {
    localScope.$emit('leave', id);
  });

  var _service = {
    send: function(txt) {
      socket.emit('msg', {txt:txt});
    },
    login: function(name, room) {
      socket.emit('join', {
        name:name,
        room:room
      });
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
      $scope.people.push(person);
    });
  });

  listener.$on('msg', function(e, msg) {
    $scope.$apply(function(){
      $scope.messages.push(msg);
    });
  });

  listener.$on('leave', function(e, id) {
    $scope.$apply(function(){
      $scope.people = $scope.people.filter(function(person) {
        return person.id !== id;
      });
    })
  });

  $scope.send = function(txt) {
    commService.send(txt);

    $scope.messages.push({txt:txt});
    $scope.txt='';
  };
});

chatApp.controller('LoginCtrl', function($scope, $location, userInput) {  
  // console.log('login init');

  $scope.submit = function(name, room) {
    
    angular.extend(userInput, {
      name:name,
      room:room
    });

    $location.path("/chat");
  };
});
