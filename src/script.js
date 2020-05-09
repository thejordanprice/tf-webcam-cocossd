const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const section = document.getElementById('section');

var modelHasLoaded = false;
var model = undefined;

cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  modelHasLoaded = true;
  // Show section model is ready to use.
  section.classList.remove('invisible');
});

// Check if webcam access is supported
const hasGetUserMedia = () => {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

var children = [];

const predictWebcam = () => {
  // Classifying the stream.
  model.detect(video).then((predictions) => {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    for (let n = 0; n < predictions.length; n++) {
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    window.requestAnimationFrame(predictWebcam);
  });
}


// Enable webcame view and start classification
const enableCam = (event) => {
  if (!modelHasLoaded) {
    return;
  }
  
  // Hide the button.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters
  const constraints = {
    video: true
  };

  // Activate the webcam stream
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

// If webcam supported, add event listener to button
if (hasGetUserMedia()) {
  const enableWebcamButton = document.getElementById('webcamButton');
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}