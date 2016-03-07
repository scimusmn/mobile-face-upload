$(document).ready(function() {

  var socket = io();

  socket.on('display-user-photo', function(data) {

    console.log('display-user-photo', data);
    var el = $('<img src="' + data + '"/>');
    $('#stage').append(el);

    $(el).css('height', 75);

  });

  // TODO:
  // URL.revokeObjectURL(imgURL);
  // Depending on the the format of the image
  // srcs' we should be ensuring they get release
  // from memory once loaded appropiately.

});
