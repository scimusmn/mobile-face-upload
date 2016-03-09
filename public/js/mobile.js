$(document).ready(function() {

  // Connect socket.io
  var socket = io.connect();

  // Setup face inputs
  var faceInputFocused = new FaceInput('faceBtn_focused');
  var faceInputHappy = new FaceInput('faceBtn_happy');
  var faceInputOuch = new FaceInput('faceBtn_ouch');

  // When 'done' button is clicked,
  // gather the all processed
  // images and send over socket.
  $('#btnDone').click(function() {

    var content = { Focused: faceInputFocused.base64Img,
                    Happy: faceInputHappy.base64Img,
                    Ouch: faceInputOuch.base64Img,
                    };

    socket.emit('submit-user-faces', content);

  });

});
