const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("assets/weights"),
  faceapi.nets.faceLandmark68Net.loadFromUri("assets/weights"),
  faceapi.nets.faceRecognitionNet.loadFromUri("assets/weights"),
  faceapi.nets.faceExpressionNet.loadFromUri("assets/weights"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

// document.getElementById("test").onclick = async () => {
//     // const res = await getAIResponse("yo bot")
//     const res = await getAIResponse("Tell me a joke. If it's funny, I'll respond with 'yes'. Then tell me more jokes like that. If it's not funny, I'll respond with 'no'. Then tell me a different kind of joke. Include the punchline after a '...'. Keep telling me jokes until I say 'stop'\n\nJoke: I invented a new word!...Plagiarism!\nHuman: yes\nJoke: Did you hear about the mathematician who's afraid of negative numbers?...He'll stop at nothing to avoid them\nHuman: no\nJoke: Why do we tell actors to 'break a leg?'...Because every play has a cast.\nHuman: yes\nJoke:")
//     document.getElementById("jokeText").innerHTML = res
//     speakJoke(res)
// }

async function getAIResponse(prompt) {
  console.log("called");
  const res = await fetch("http://localhost:5000/get-message", {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: prompt,
    }),
  });
  const completion = await res.json();
  return completion["choices"][0]["text"];
}

let lol = false;
let currentlyTellingJoke = false;
let isTalking = false; // global flag for anything talking

function respondToSentiment() {
  setInterval(async () => {
    console.log(isTalking);
    if (!isTalking) {
      if (currentlyTellingJoke) {
        if (lol) {
          var synth = window.speechSynthesis;
          var utterThis = new SpeechSynthesisUtterance("Thank you, thank you.");
          synth.speak(utterThis);
          isTalking = true;
          utterThis.onend = () => {
            currentlyTellingJoke = false;
            lol = false;
            isTalking = false;
          };
        } else {
          var synth = window.speechSynthesis;
          var utterThis = new SpeechSynthesisUtterance(
            "Wait, I have a better joke."
          );
          synth.speak(utterThis);
          isTalking = true;
          utterThis.onend = () => {
            currentlyTellingJoke = false;
            lol = false;
            isTalking = false;
          };
        }
      } else {
        currentlyTellingJoke = true;
        const res = await getAIResponse(
          "Tell me a joke. If it's funny, I'll respond with 'yes'. Then tell me more jokes like that. If it's not funny, I'll respond with 'no'. Then tell me a different kind of joke. Include the punchline after a '...'. Keep telling me jokes until I say 'stop'\n\nJoke: I invented a new word!...Plagiarism!\nHuman: yes\nJoke: Did you hear about the mathematician who's afraid of negative numbers?...He'll stop at nothing to avoid them\nHuman: no\nJoke: Why do we tell actors to 'break a leg?'...Because every play has a cast.\nHuman: yes\nJoke:"
        );
        document.getElementById("jokeText").innerHTML = res;
        speakJoke(res);
      }
    }
  }, 4500);
}

async function speakJoke(joke) {
  var synth = window.speechSynthesis;
  var utterThis = new SpeechSynthesisUtterance(joke);
  synth.speak(utterThis);
  isTalking = true;
  utterThis.onend = () => {
    isTalking = false;
  };
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  respondToSentiment();

  setInterval(async () => {
    // detect and resize to canvas
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // clear canvas old rects
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    resizedDetections.forEach((detection) => {
        if (detection.expressions.happy > 0.5) {
          lol = true;
        }

      
        // const box = { x: 50, y: 50, width: 100, height: 100 };
        //   const leftEye = detection.landmarks.getLeftEye();
        // const topLeftEye = { x: leftEye[0].x, y: leftEye[0].y };

        // // see DrawBoxOptions below
        // const drawOptions = {
        //   label: "Hello I am a box!",
        //   lineWidth: 2,
        //   boxColor: "blue",
        // };
        // const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
        // drawBox.draw(canvas);

      // find top left corner of left eye

      //find top left corner of left eye
      //   const leftEye = detection.landmarks.getLeftEye();
      //   const topLeftEye = { x: leftEye[0].x, y: leftEye[0].y };

      //   // draw censor only when face != happy
      //   if(detection.expressions.happy < 0.8) {
      //       const box = { x: topLeftEye.x - 95, y: topLeftEye.y, width: 290, height: 10 }
      //       const drawOptions = {
      //           lineWidth: 20,
      //           boxColor: 'black'
      //       }
      //       const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
      //       drawBox.draw(canvas)
      //   }
    });
  }, 100);
  // draw detections and expressions
  // faceapi.draw.drawDetections(canvas, resizedDetections);
  // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
});
