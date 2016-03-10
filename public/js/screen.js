$(document).ready(function() {

  var socket = io();

  var numUsers = 0;
  var cellHeight = 100;
  var cellWidth = 65;

  socket.on('new-user-faces', function(data) {

    console.log('new-user-faces', data);
    var userDiv = $('<div style="position:absolute;"></div>');
    var row = Math.floor(numUsers / 5);
    userDiv.css('left', cellWidth * (numUsers % 5));
    userDiv.css('top', cellHeight * row);

    $('#stage').append(userDiv);

    for (var key in data) {

      var imgSrc = data[key];

      var el = $('<img class="' + key + '" src="' + imgSrc + '" style="position:absolute;"/>');
      $(userDiv).append(el);
      $(el).attr('height', cellHeight);

    }

    userDiv.on('mousedown', function() {
      $(userDiv).children('img').hide();
      $(userDiv).children('.Ouch').show();
    });

    userDiv.on('mouseover', function() {
      $(userDiv).children('img').hide();
      $(userDiv).children('.Happy').show();
    });

    userDiv.on('mouseout', function() {
      $(userDiv).children('img').hide();
      $(userDiv).children('.Focused').show();
    });

    $(userDiv).children('img').hide();
    $(userDiv).children('.Focused').show();

    numUsers++;

  });

});
