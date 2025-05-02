'use client';

// This file implements a multimodal interface for Azure AI responses.
// Users can select text, image, or audio input and receive AI responses.

import { useState, useRef, useEffect } from 'react';
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Use environment variables to securely store sensitive information like API keys and endpoints.
const endpoint = process.env.NEXT_PUBLIC_AI_INFERENCE_ENDPOINT; // Azure AI endpoint
const apiKey = process.env.NEXT_PUBLIC_AZURE_API_KEY; // Azure API key
const modelName = process.env.NEXT_PUBLIC_AZURE_MODEL_ID; // Model ID for the AI service
// Add Speech Services endpoint - this should be configured in your environment variables
const speechEndpoint = process.env.NEXT_PUBLIC_SPEECH_ENDPOINT || endpoint;

export default function MultiModal() {
  // State variables for managing user input and AI responses.
  const [inputType, setInputType] = useState(''); // Selected input type (text, image, audio)
  const [prompt, setPrompt] = useState(''); // User prompt
  const [file, setFile] = useState(null); // Uploaded file (image)
  const [output, setOutput] = useState(''); // AI response
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(''); // Error messages
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Stop recording when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Specify audio format explicitly as PCM/WAV
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' // Most browsers support webm
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Create a blob with explicit type
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
        clearInterval(timerRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL('');
      setAudioBlob(null);
      setRecordingTime(0);
      
      // Set up timer to update recording time
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(`Microphone access error: ${err.message || err}`);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Handles form submission and sends the request to Azure AI.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setOutput('');
    setError('');

    try {
      if (!endpoint || !apiKey || !modelName) {
        setError('Environment variables are missing. Please check your configuration.');
        console.error('Missing environment variables:', { 
          endpoint: endpoint ? 'Set' : 'Missing', 
          apiKey: apiKey ? 'Set' : 'Missing',
          modelName: modelName ? 'Set' : 'Missing'
        });
        setLoading(false);
        return;
      }
      
      // Log the actual endpoint and model being used (without revealing the full API key)
      console.log(`Using endpoint: ${endpoint}`);
      console.log(`Using model: ${modelName}`);
      
      // Create client inside the function to ensure it's properly initialized
      const client = new ModelClient(endpoint, new AzureKeyCredential(apiKey));
      
      if (!prompt) {
        setError('Please enter a prompt.');
        setLoading(false);
        return;
      }

      let response;
      if (inputType === 'text') {
        // Handle text input
        console.log("Making text request with prompt:", prompt);
        
        // Use the standard path format for Azure AI inference client
        response = await client.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
              { role: "user", content: prompt }
            ],
            model: modelName
          },
        });
      } else if (inputType === 'image') {
        // Handle image input
        if (!file) {
          setError('Please upload an image.');
          setLoading(false);
          return;
        }
        const imageBase64 = await toBase64(file);
        
        response = await client.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
              { role: "user", content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
              ]}
            ],
            model: modelName
          },
        });
      } else if (inputType === 'audio') {
        // Handle audio input
        if (!audioBlob) {
          setError('Please record audio first.');
          setLoading(false);
          return;
        }

        // Convert audio blob to base64
        const audioBase64 = await blobToBase64(audioBlob);
        console.log("Sending audio request with format:", audioBlob.type);
        
        // Create a data URL for the audio
        const audioDataUrl = `data:${audioBlob.type};base64,${audioBase64}`;
        
        // Use the format matching the Python reference code
        response = await client.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
              { 
                role: "user", 
                content: [
                  { type: "text", text: prompt },
                  { 
                    type: "audio_url",
                    audio_url: { url: audioDataUrl }
                  }
                ]
              }
            ],
            model: modelName,
            max_tokens: 800
          },
        });
        
        // If the first attempt fails, try alternative format
        if (response.status !== "200") {
          console.log("First audio format failed, trying alternative format");
          
          // Try without array structure
          response = await client.path("/chat/completions").post({
            body: {
              messages: [
                { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
                { 
                  role: "user", 
                  content: prompt
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "audio_url",
                      audio_url: { url: audioDataUrl }
                    }
                  ]
                }
              ],
              model: modelName,
              max_tokens: 800
            },
          });
        }

        // If both attempts fail, fall back to text-only
        if (response.status !== "200") {
          console.log("Audio submission failed, falling back to text-only prompt");
          
          response = await client.path("/chat/completions").post({
            body: {
              messages: [
                { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
                { role: "user", content: prompt + " (Note: I attempted to send an audio recording but the format was not supported.)" }
              ],
              model: modelName
            },
          });
          
          // Prepare a helpful error message
          if (response.status === "200") {
            console.log("Text-only fallback succeeded");
            setError("NOTE: Audio processing is not directly supported by this model. Using text prompt only.");
          }
        }
      } else {
        setError('Please select a valid input type.');
        setLoading(false);
        return;
      }

      console.log("Response status:", response.status);
      
      if (response.status === "200") {
        setOutput(response.body.choices[0].message.content);
      } else {
        setError(`Error: ${response.status} - ${JSON.stringify(response.body)}`);
      }
    } catch (err) {
      console.error("Azure AI Error:", err);
      setError(`Failed to get a response from Azure AI: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Converts a file to a Base64 string.
  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Converts a Blob to a Base64 string
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff0f6', borderRadius: '8px' }}>
      <h1 style={{ color: '#eb2f96', marginBottom: '15px' }}>Multimodal AI Interaction</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="inputType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Input Type:</label>
        <select
          id="inputType"
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
        >
          <option value="">-- Select --</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="audio">Audio</option>
        </select>

        <label htmlFor="prompt" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Enter Your Prompt:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          cols={50}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />

        {inputType === 'image' && (
          <>
            <label htmlFor="file" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload Image:</label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginBottom: '10px' }}
            />
          </>
        )}
        
        {inputType === 'audio' && (
          <div style={{ marginBottom: '15px', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '10px', backgroundColor: '#fafafa' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Audio Recording:</label>
            
            <div style={{ marginBottom: '10px' }}>
              {!isRecording && !audioURL && (
                <button 
                  type="button"
                  onClick={startRecording}
                  style={{ backgroundColor: '#52c41a', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', marginRight: '10px' }}
                >
                  Start Recording
                </button>
              )}
              
              {isRecording && (
                <>
                  <button 
                    type="button"
                    onClick={stopRecording}
                    style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', marginRight: '10px' }}
                  >
                    Stop Recording
                  </button>
                  <span style={{ fontFamily: 'monospace' }}>Recording: {formatTime(recordingTime)}</span>
                </>
              )}
            </div>
            
            {audioURL && (
              <div>
                <audio src={audioURL} controls style={{ width: '100%', marginBottom: '10px' }} />
                <button
                  type="button"
                  onClick={startRecording}
                  style={{ backgroundColor: '#1677ff', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px' }}
                >
                  Record Again
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (inputType === 'audio' && !audioBlob)}
          style={{ 
            backgroundColor: '#eb2f96', 
            color: 'white', 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading || (inputType === 'audio' && !audioBlob) ? 'not-allowed' : 'pointer',
            opacity: loading || (inputType === 'audio' && !audioBlob) ? 0.7 : 1,
            fontSize: '16px', 
            transition: 'background-color 0.3s ease' 
          }}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      {error && <p style={{ color: '#ff4d4f', marginTop: '10px' }}>Error: {error}</p>}
      <h2 style={{ marginTop: '20px', color: '#eb2f96' }}>AI Response:</h2>
      <div style={{ whiteSpace: 'pre-wrap', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: '#fff', fontFamily: 'monospace' }}>{output}</div>
    </div>
  );
}