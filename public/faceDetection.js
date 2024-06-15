import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

async function detectFaces(videoElement) {
  const model = await blazeface.load();
  const predictions = await model.estimateFaces(videoElement, false);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  return predictions.map(prediction => {
    const [x, y] = prediction.topLeft;
    const [width, height] = [prediction.bottomRight[0] - x, prediction.bottomRight[1] - y];

    context.drawImage(videoElement, x, y, width, height, 0, 0, width, height);
    const thumbnail = canvas.toDataURL('image/jpeg');

    return {
      timestamp: videoElement.currentTime,
      thumbnail,
    };
  });
}

window.detectFaces = detectFaces;
