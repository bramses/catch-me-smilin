const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('assets/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('assets/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('assets/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('assets/weights'),
]).then(startVideo)

function startVideo () {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {

        // detect and resize to canvas
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // clear canvas old rects
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        resizedDetections.forEach(detection => {
            
            // find top left corner of left eye
            const leftEye = detection.landmarks.getLeftEye();
            const topLeftEye = { x: leftEye[0].x, y: leftEye[0].y };

            // draw censor only when face != happy
            if(detection.expressions.happy < 0.8) {
                const box = { x: topLeftEye.x - 95, y: topLeftEye.y, width: 290, height: 10 }
                const drawOptions = {
                    lineWidth: 20,
                    boxColor: 'black'
                }
                const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
                drawBox.draw(canvas)
            }
        })
    }, 100)
    // draw detections and expressions
    // faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);      
})