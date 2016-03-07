$(document).ready(function() {

  var socket = io.connect();

  // Use button click to trigger hidden file input.
  // TODO - These Ids should come in through a parameter.
  // ...Probably as a jquery object, OR search doc for a certain class

  $('#faceBtn_normal').click(function() {
    $('#faceInput_normal').click();
  });

  document.getElementById('faceInput_normal').onchange = function(e) {

    // User has submitted a file.
    // TODO: ensure this is an image file

    // Display loading spinner
    $('#spinner_overlay').show();

    var imgFile = e.target.files[0];
    var options = {
      maxWidth: 300,
      maxHeight: 300,
      contain:true,
      canvas:true,
    };

    // First, get meta data to apply proper
    // orientation, which is a common
    // issue for mobile photos
    loadImage.parseMetaData(imgFile, function(data) {

      // If available, add orientation to options
      if (data.exif) {
        options.orientation = data.exif.get('Orientation');
      }

      // Resize img and return as canvas
      loadImage(imgFile, canvasReadyCallback, options);

    });

  };

  function canvasReadyCallback(imgCanvas) {

    if (imgCanvas.type === 'error') {
      console.log('Error creating canvas image.');
    } else {

      // Temp
      document.body.appendChild(imgCanvas);

      // Our default crop size assumes
      // the user has not perfectly filled
      // their camera with their face, so
      // we crop a 1/4 of the original size
      // off each side.
      var cropRect = {    x: imgCanvas.width * 0.25,
                          y: imgCanvas.height * 0.25,
                          width: imgCanvas.width * 0.5,
                          height: imgCanvas.height * 0.5,
                      };

      // Find face within image.
      // If found, use the returned info
      // to crop image. If not found, continue
      // with default "guess" crop.
      $(imgCanvas).faceDetection({
        complete: function(faces) {

          if (faces.length > 0) {

            console.log('Faces detected:\n', faces);

            // The returned face rect is the CENTER
            // T-square of the face, so we must pad
            // the returned width and height in order
            // to see entire face.

            // [ o o ]
            // [ --- ]

            // [       ]
            // [  o o  ]
            // [  ---  ]
            // [       ]

            var f = faces[0];
            cropRect.x = f.x;
            cropRect.y = f.y - (f.height / 4);
            cropRect.width = f.width;
            cropRect.height = f.height + (f.height / 1.85);

            // Temp - Display confidence level,
            // at some point we should throw out any
            // faces below X confidence and use default crop
            $('#main-section').find('p').html('CONFIDENCE: ' + f.confidence);

          } else {
            console.log('No faces detected. Using default crop.');
          }

          maskAndCropCanvas(imgCanvas, cropRect);

        }, error: function(code, message) {

          console.log('Face detection error. ' + code + ': ' + message);
          window.alert('FaceDetect error. Show Tryg this: ' + code + ' : ' + message);
          maskAndCropCanvas(imgCanvas, cropRect);

        },
      });

    }
  }

  function maskAndCropCanvas(imgCanvas, cropRect) {

    // Crop incoming canvas to cropRect area
    var croppedImgCanvas = loadImage.scale(imgCanvas, {
      left: cropRect.x,
      top: cropRect.y,
      sourceWidth: cropRect.width,
      sourceHeight: cropRect.height,
      canvas: true,
    });

    // NOTE: It may be wiser to do any masking
    // on the "other-side" where there is
    // likely more processing power. However,
    // we are doing it here to display a preview.

    // Peform masking using faceMask.png
    var ctx = croppedImgCanvas.getContext('2d');
    var maskImg = document.createElement('img');
    maskImg.src = 'img/faceMask.png';

    maskImg.onload = function() {

      maskImg.width  = croppedImgCanvas.width;
      maskImg.height = croppedImgCanvas.height;

      // This turns on masking mode.
      // Whatever is drawn after will act
      // as a mask for what is underneath.
      ctx.globalCompositeOperation = 'destination-in';

      // Draw mask onto face image.
      ctx.drawImage(maskImg, 0, 0, croppedImgCanvas.width, croppedImgCanvas.height);

      delete maskImg;

      // Temp
      ctx.globalCompositeOperation = 'destination-over';
      var edgeColors = sampleEdgeColors(croppedImgCanvas);

      canvasToImage(croppedImgCanvas);

    };

  }

  function sampleEdgeColors(canvas, applyAsBackground) {

    var context = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    // Target points at edge
    // of context rect.
    // [ •   •   • ]
    // [           ]
    // [ •       • ]
    // [           ]
    // [ •   •   • ]
    var samplePoints = [{x: w * 0.2, y: h * 0.2},
                        {x: w * 0.5, y: h * 0.2},
                        {x: w * 0.8, y: h * 0.2},
                        {x: w * 0.2, y: h * 0.5},
                        {x: w * 0.8, y: h * 0.5},
                        {x: w * 0.2, y: h * 0.8},
                        {x: w * 0.5, y: h * 0.8},
                        {x: w * 0.8, y: h * 0.8},
                        ];

    var pixel;
    var color;
    var edgeColors = [];
    for (var i = 0; i < samplePoints.length; i++) {

      // Get pixel data at x,y point on canvas
      pixel = context.getImageData(Math.round(samplePoints[i].x), Math.round(samplePoints[i].y), 1, 1).data;

      edgeColors.push({   r: pixel[0],
                          g: pixel[1],
                          b: pixel[2],
                      });

      // Here we actually add gradients to canvas
      var gx = Math.round(samplePoints[i].x);
      var gy = Math.round(samplePoints[i].y);

      // Radius should be slightly
      // more than distance between samplePoints.
      var longSide = Math.max(w, h);
      var radiusStart = longSide * 0.15;
      var radiusEnd = longSide * 0.4;

      var c = {   r: pixel[0],
                  g: pixel[1],
                  b: pixel[2],
              };

      var radialGrad = context.createRadialGradient(gx, gy, radiusStart, gx, gy, radiusEnd);
      radialGrad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',1)');
      radialGrad.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');

      context.fillStyle = radialGrad;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    }

    return edgeColors;

  }

  function canvasToImage(cnv) {

    // Convert canvas content to
    // base4 encoded PNG image
    var base64Img = cnv.toDataURL('image/png');

    // Update local image to finished process
    $('#btnFace_1').attr('src', base64Img);

    // File is ready to transfer
    uploadPhoto(base64Img);

    // TODO: Wait for 'upload complete'.
    // Hide loading spinner.
    $('#spinner_overlay').hide();

  }

  function uploadPhoto(content) {

    socket.emit('submit-user-photo', content);

  }

});
