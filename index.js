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

  socket.on('submit-user-faces', function(data) {

    var userFaces = saveFaces(data);

    socket.broadcast.emit('new-user-faces', userFaces);

  });

});

function saveFaces(data) {

  var savedFaces = {};

  for (var key in data) {

    var obj = data[key];
    if (!obj || obj === '') continue;

    // Find/replace to ensure proper base64 encoding
    var base64Data = obj.replace(/^data:image\/png;base64,/, '');

    var filePath = FACES_DIR + 'USER_FACE_' + key + '_' + Math.round(Math.random() * 9999) + '.png';
    var savePath = 'public/' + filePath;
    var localPath = '../' + filePath;

    // Save base64 png to disk with random identifier
    fs.writeFile(savePath, base64Data, 'base64', function(err) {

      if (err) throw err;

    });

    savedFaces[key] = localPath;

  }

  return savedFaces;

}

// Listen for http requests on port <portNumber>
http.listen(portNumber, function() {

  console.log('Listening to Node server on port ' + portNumber + '...');

});

/*
    Clear Directory

    Removes all files. Call on startup if
    there is no reason to keep log of files.

*/
function clearDirectory(dirPath) {
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

clearDirectory('public/' + FACES_DIR);
