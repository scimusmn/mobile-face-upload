$(document).ready(function() {

  var socket = io();

  socket.on('new-user-faces', function(data) {

    console.log('new-user-faces', data);

    for (var key in data) {

      var imgSrc = data[key];

      $('#stage').append(key);

      var el = $('<img src="' + imgSrc + '"/>');
      $('#stage').append(el);

    }

  });

});
