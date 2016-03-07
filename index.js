/*
    This node server does two things:
    It serves the html to screens
    based on which url they hit.
    It also saves image streams recieved
    from mobile devices, then reports the
    newly saved file location to listening sockets.
    On start, all previously saved photos will
    be erased.
*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var fs = require('fs');

var portNumber = 3000;
app.set('port', portNumber);
app.use(express.static(path.join(__dirname, 'public')));

var FACES_DIR = 'img/faces/';

// Serve client files
app.get('/', function(request, response) {

  response.sendFile(__dirname + '/mobile.html');

});

app.get('/screen', function(request, response) {

  response.sendFile(__dirname + '/screen.html');

});

// Socket.io connections
io.on('connection', function(socket) {

  socket.on('submit-user-photo', function(data) {

    // Simple find/replace to ensure proper encoding
    var base64Data = data.replace(/^data:image\/png;base64,/, '');

    // Save base64 png to disk with random identifier
    var fileURL = FACES_DIR + 'USER_FACE_' + Math.round(Math.random() * 9999) + '.png';
    fs.writeFile('public/' + fileURL, base64Data, 'base64', function(err) {
      if (err) throw err;

      // Let Screen know it is available
      console.log('success, file saved: ' + fileURL);
      var localFileUrl = '../' + fileURL;
      socket.broadcast.emit('display-user-photo', localFileUrl);

    });

  });

});

// Clear previous faces folder
removeFilesOfDirectory('public/' + FACES_DIR);

function removeFilesOfDirectory(dirPath) {
  var files;
  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }

  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        removeFilesOfDirectory(filePath);
      }
    }
  }
}

// Listen for http requests on port <portNumber>
http.listen(portNumber, function() {

  console.log('Listening to Node server on port ' + portNumber + '...');

});

