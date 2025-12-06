from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import Optional
import torch
import torchaudio
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import io
import soundfile as sf
import numpy as np

app = FastAPI(title="Speech to Text API")

# Load model and processor
MODEL_ID = "re-skill/whisper-large-v3-turbo-tj"

print("Loading Whisper model...")
processor = WhisperProcessor.from_pretrained(MODEL_ID)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_ID)
model.eval()

# Clear forced_decoder_ids from generation config to avoid conflicts
if hasattr(model.generation_config, 'forced_decoder_ids'):
    model.generation_config.forced_decoder_ids = None

print("Model loaded successfully!")


@app.get("/")
def read_root():
    return {"message": "Speech to Text API with Auto Language Detection", "model": MODEL_ID}


@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    max_length: Optional[int] = Form(None)
):
    """
    Transcribe audio file to text using Whisper model with automatic language detection.
    
    Parameters:
    - audio: Audio file (wav, mp3, flac, etc.) - required
    - max_length: Maximum length for transcription in tokens (optional, default: no limit)
    
    Returns the transcribed text with detected language and metadata.
    """
    try:
        print("max_length:", max_length)
        
        # Read audio file
        audio_bytes = await audio.read()
        audio_file = io.BytesIO(audio_bytes)
        
        # Load audio using soundfile
        audio_data, samplerate = sf.read(audio_file)
        original_samplerate = samplerate
        
        # Convert to mono if stereo
        if len(audio_data.shape) > 1:
            audio_data = audio_data.mean(axis=1)
        
        # Resample to 16000 Hz if needed (Whisper requires 16kHz)
        target_sr = 16000
        if samplerate != target_sr:
            # Convert numpy array to torch tensor
            audio_tensor = torch.from_numpy(audio_data).float()
            # Add channel dimension if mono (torchaudio expects [channels, samples])
            if len(audio_tensor.shape) == 1:
                audio_tensor = audio_tensor.unsqueeze(0)
            
            # Create resampler
            resampler = torchaudio.transforms.Resample(orig_freq=samplerate, new_freq=target_sr)
            audio_tensor = resampler(audio_tensor)
            
            # Convert back to numpy and remove channel dimension
            audio_data = audio_tensor.squeeze().numpy()
            samplerate = target_sr
        
        # Process audio
        inputs = processor(
            audio_data, 
            sampling_rate=samplerate, 
            return_tensors="pt"
        )
        
        # Chunk long audio into segments (Whisper works best with 30-second chunks)
        # For audio longer than 30 seconds, we'll process in chunks
        chunk_length_s = 30  # seconds
        samplerate_16k = 16000
        chunk_samples = chunk_length_s * samplerate_16k
        
        transcriptions = []
        
        # Process audio in chunks if it's longer than chunk_length_s
        audio_duration = len(audio_data) / samplerate_16k
        
        if audio_duration > chunk_length_s:
            # Split audio into chunks
            num_chunks = int(np.ceil(len(audio_data) / chunk_samples))
            
            for i in range(num_chunks):
                start_idx = i * chunk_samples
                end_idx = min((i + 1) * chunk_samples, len(audio_data))
                chunk_audio = audio_data[start_idx:end_idx]
                
                # Process each chunk
                chunk_inputs = processor(
                    chunk_audio,
                    sampling_rate=samplerate_16k,
                    return_tensors="pt"
                )
                
                # Generate transcription for this chunk
                with torch.no_grad():
                    chunk_generated_ids = model.generate(
                        chunk_inputs["input_features"],
                        max_length=448 if max_length is None else min(max_length, 448)
                    )
                
                # Decode chunk transcription
                chunk_transcription = processor.batch_decode(
                    chunk_generated_ids,
                    skip_special_tokens=True
                )[0]
                
                if chunk_transcription.strip():
                    transcriptions.append(chunk_transcription.strip())
        else:
            # Audio is short enough, process normally
            with torch.no_grad():
                generate_kwargs = {
                    "inputs": inputs["input_features"],
                }
                
                # Set max_length if provided, otherwise use max safe limit
                if max_length:
                    if max_length > 448:
                        max_length = 448
                    generate_kwargs["max_length"] = max_length
                else:
                    generate_kwargs["max_length"] = 448
                
                generated_ids = model.generate(**generate_kwargs)
                
                # Decode transcription
                transcription = processor.batch_decode(
                    generated_ids,
                    skip_special_tokens=True
                )[0]
                transcriptions = [transcription]
        
        # Combine all chunk transcriptions
        full_transcription = " ".join(transcriptions)
        
        # Extract language from first chunk (all chunks should be same language)
        if audio_duration > chunk_length_s:
            # Use first chunk for language detection
            first_chunk_audio = audio_data[:chunk_samples]
            first_chunk_inputs = processor(
                first_chunk_audio,
                sampling_rate=samplerate_16k,
                return_tensors="pt"
            )
            with torch.no_grad():
                first_chunk_ids = model.generate(
                    first_chunk_inputs["input_features"],
                    max_length=448
                )
            generated_ids_for_lang = first_chunk_ids
        else:
            generated_ids_for_lang = generated_ids
        
        # Extract detected language from the generated tokens
        # Whisper includes language information in the token sequence
        detected_language = "unknown"
        try:
            tokenizer = processor.tokenizer
            # Get the first few tokens which typically contain language info
            if len(generated_ids_for_lang.shape) > 1:
                sequence = generated_ids_for_lang[0]
            else:
                sequence = generated_ids_for_lang
            
            # Decode first few tokens to check for language markers
            # Whisper language tokens are typically near the beginning
            first_tokens = sequence[:5]  # First 5 tokens
            decoded_tokens = tokenizer.decode(first_tokens, skip_special_tokens=False)
            
            # Map of Whisper language token IDs to language codes
            # These are the tokenizer's language token mappings
            lang_token_map = {
                50258: "en", 50259: "zh", 50260: "de", 50261: "es", 50262: "ru", 
                50263: "ko", 50264: "fr", 50265: "ja", 50266: "pt", 50267: "tr",
                50268: "pl", 50269: "ca", 50270: "nl", 50271: "ar", 50272: "sv",
                50273: "it", 50274: "id", 50275: "hi", 50276: "fi", 50277: "vi",
                50278: "he", 50279: "uk", 50280: "el", 50281: "ms", 50282: "cs",
                50283: "ro", 50284: "da", 50285: "hu", 50286: "ta", 50287: "no",
                50288: "th", 50289: "ur", 50290: "hr", 50291: "bg", 50292: "lt",
                50293: "la", 50294: "mi", 50295: "ml", 50296: "cy", 50297: "sk",
                50298: "te", 50299: "fa", 50300: "lv", 50301: "bn", 50302: "sr",
                50303: "az", 50304: "sl", 50305: "kn", 50306: "et", 50307: "mk",
                50308: "br", 50309: "eu", 50310: "is", 50311: "hy", 50312: "ne",
                50313: "mn", 50314: "bs", 50315: "kk", 50316: "sq", 50317: "sw",
                50318: "gl", 50319: "mr", 50320: "pa", 50321: "si", 50322: "km",
                50323: "sn", 50324: "yo", 50325: "so", 50326: "af", 50327: "oc",
                50328: "ka", 50329: "be", 50330: "tg", 50331: "sd", 50332: "gu",
                50333: "am", 50334: "yi", 50335: "lo", 50336: "uz", 50337: "fo",
                50338: "ht", 50339: "ps", 50340: "tk", 50341: "nn", 50342: "mt",
                50343: "sa", 50344: "lb", 50345: "my", 50346: "bo", 50347: "tl",
                50348: "mg", 50349: "as", 50350: "tt", 50351: "haw", 50352: "ln",
                50353: "ha", 50354: "ba", 50355: "jw", 50356: "su", 50357: "yue"
            }
            
            # Check each token in the sequence for a language token
            for token_id in sequence.tolist()[:10]:  # Check first 10 tokens
                if token_id in lang_token_map:
                    detected_language = lang_token_map[token_id]
                    break
        except Exception as e:
            # If language detection fails, default to "auto-detected"
            detected_language = "auto-detected"
        
        response = {
            "transcription": full_transcription,
            "filename": audio.filename,
            "original_samplerate": int(original_samplerate),
            "processed_samplerate": int(samplerate),
            "language": detected_language,
            "audio_duration": round(len(audio_data) / samplerate, 2),
        }
        
        return JSONResponse(content=response)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

