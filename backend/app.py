from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import os

app = Flask(__name__)

CORS(app)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/")
def home():

    return jsonify({
        "message": "Automatic Speech Recognition Backend Running"
    })


@app.route("/transcribe", methods=["POST"])
def transcribe():

    if "audio" not in request.files:

        return jsonify({
            "error": "No audio file received"
        }), 400

    audio_file = request.files["audio"]

    file_path = os.path.join(
        UPLOAD_FOLDER,
        audio_file.filename
    )

    audio_file.save(file_path)

    recognizer = sr.Recognizer()

    try:

        with sr.AudioFile(file_path) as source:

            audio = recognizer.record(source)

        text = recognizer.recognize_google(
            audio
        )

        return jsonify({
            "text": text
        })

    except sr.UnknownValueError:

        return jsonify({
            "error": "Speech could not be understood"
        }), 400

    except sr.RequestError:

        return jsonify({
            "error": "Speech recognition service unavailable"
        }), 500

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if os.path.exists(file_path):

            os.remove(file_path)


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )