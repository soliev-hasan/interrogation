import requests

# Test 1: Basic transcription without max_length
print("Testing basic transcription...")
url = "http://localhost:8000/transcribe"
files = {"audio": open("backend/backend-py/audio-test.mp3", "rb")}
response = requests.post(url, files=files)
print("Status code:", response.status_code)
print("Response:", response.text)

print("\n" + "="*50 + "\n")

# Test 2: Transcription with max_length
print("Testing transcription with max_length...")
url = "http://localhost:8000/transcribe"
files = {"audio": open("backend/backend-py/audio-test.mp3", "rb")}
data = {"max_length": 100}
response = requests.post(url, files=files, data=data)
print("Status code:", response.status_code)
print("Response:", response.text)