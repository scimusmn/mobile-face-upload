$(document).ready(function() {

  var socket = io();

  socket.on('display-user-photo', function(data) {

    console.log('display-user-photo', data);
    var el = $('<img src="' + data + '"/>');
    $('#stage').append(el);

    $(el).css('height', 75);

  });

});
