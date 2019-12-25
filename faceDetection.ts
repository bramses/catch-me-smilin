  
import * as faceapi from 'face-api.js';

import { canvas, faceDetectionNet, faceDetectionOptions, saveFile } from './commons';

async function run() {

  await faceDetectionNet.loadFromDisk('./assets/weights')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./assets/weights')
  await faceapi.nets.faceExpressionNet.loadFromDisk('./assets/weights')

  const img = await canvas.loadImage('./assets/images/happy.jpg')
  const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
  .withFaceLandmarks()
    .withFaceExpressions()

  const out = faceapi.createCanvasFromMedia(img) as any
  faceapi.draw.drawDetections(out, results.map(res => res.detection))
  faceapi.draw.drawFaceExpressions(out, results)

  saveFile('faceExpressionRecognition.jpg', out.toBuffer('image/jpeg'))
  console.log('done, saved results to out/faceExpressionRecognition.jpg')
}

run()