const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const transcript = document.getElementById("transcript");
const language = document.getElementById("language");

const statusText = document.getElementById("status");
const timerText = document.getElementById("timer");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");

const audioFile = document.getElementById("audioFile");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

let recognition;
let timerInterval;
let seconds = 0;

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    statusText.innerText =
        "Speech Recognition is not supported in this browser.";

    startBtn.disabled = true;

} else {

    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {

        statusText.innerText = "🎙️ Listening...";

        startBtn.disabled = true;
        stopBtn.disabled = false;

        startTimer();
    };

    recognition.onresult = function(event) {

        let finalText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            if (event.results[i].isFinal) {

                finalText +=
                    event.results[i][0].transcript + " ";

            }
        }

        if (finalText) {

            transcript.value += finalText;

            updateCount();
        }
    };

    recognition.onerror = function(event) {

        statusText.innerText =
            "Error: " + event.error;

    };

    recognition.onend = function() {

        startBtn.disabled = false;
        stopBtn.disabled = true;

        stopTimer();

        if (statusText.innerText === "🎙️ Listening...") {
            statusText.innerText = "Recording stopped";
        }
    };
}


startBtn.addEventListener("click", function() {

    if (!recognition) return;

    recognition.lang = language.value;

    try {
        recognition.start();
    } catch (error) {
        console.log(error);
    }

});


stopBtn.addEventListener("click", function() {

    if (recognition) {
        recognition.stop();
    }

});


function startTimer() {

    seconds = 0;

    timerInterval = setInterval(function() {

        seconds++;

        let minutes =
            Math.floor(seconds / 60);

        let remainingSeconds =
            seconds % 60;

        timerText.innerText =
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0");

    }, 1000);
}


function stopTimer() {

    clearInterval(timerInterval);
}


function updateCount() {

    const text = transcript.value.trim();

    const words =
        text === ""
            ? 0
            : text.split(/\s+/).length;

    wordCount.innerText = words;

    charCount.innerText = text.length;
}


copyBtn.addEventListener("click", async function() {

    if (transcript.value.trim() === "") {

        alert("There is no text to copy.");

        return;
    }

    await navigator.clipboard.writeText(
        transcript.value
    );

    alert("Text copied successfully!");
});


clearBtn.addEventListener("click", function() {

    transcript.value = "";

    updateCount();

    statusText.innerText =
        "Ready to record";

    timerText.innerText =
        "00:00";
});


downloadBtn.addEventListener("click", function() {

    const text = transcript.value;

    if (text.trim() === "") {

        alert("There is no text to download.");

        return;
    }

    const blob =
        new Blob([text], {
            type: "text/plain"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "speech-transcript.txt";

    link.click();

    URL.revokeObjectURL(url);
});


uploadBtn.addEventListener("click", async function() {

    const file =
        audioFile.files[0];

    if (!file) {

        alert("Please select an audio file.");

        return;
    }

    const formData =
        new FormData();

    formData.append("audio", file);

    uploadStatus.innerText =
        "⏳ Converting audio...";

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/transcribe",
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if (data.text) {

            transcript.value =
                data.text;

            updateCount();

            uploadStatus.innerText =
                "✅ Audio converted successfully!";

        } else {

            uploadStatus.innerText =
                "❌ Could not recognize speech.";

        }

    } catch (error) {

        uploadStatus.innerText =
            "❌ Backend connection failed.";

        console.error(error);
    }

});