from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
import speech_recognition as sr
import io
import os
import tempfile

app = FastAPI(title="Simple Speech to Text API")

@app.get("/")
def read_root():
    return {"message": "Simple Speech to Text API", "library": "speech_recognition"}

@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("ru-RU")  # Default to Russian
):
    """
    Transcribe audio file to text using speech_recognition library.
    
    Parameters:
    - audio: Audio file (wav, mp3, flac, etc.) - required
    - language: Language code (e.g., 'en-US', 'ru-RU') - optional, defaults to Russian
    
    Returns the transcribed text.
    """
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Save to temporary file (speech_recognition works better with files)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(audio_bytes)
            temp_filename = temp_file.name
        
        # Use speech_recognition to transcribe
        recognizer = sr.Recognizer()
        
        with sr.AudioFile(temp_filename) as source:
            # Read the entire audio file
            audio_data = recognizer.record(source)
            
        # Perform transcription
        try:
            text = recognizer.recognize_google(audio_data, language=language)
            result = f"{text}"
        except sr.UnknownValueError:
            result = "Could not understand audio"
        except sr.RequestError as e:
            result = f"Could not request results; {e}"
        
        # Clean up temporary file
        os.unlink(temp_filename)
        
        response = {
            "transcription": result,
            "filename": audio.filename,
            "language": language
        }
        
        return JSONResponse(content=response)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)