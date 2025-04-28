'use client';

// This file implements a multimodal interface for Azure AI responses.
// Users can select text, image, or audio input and receive AI responses.

import { useState } from 'react';
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Environment variables for sensitive information like API keys.
const endpoint = process.env.NEXT_PUBLIC_AI_PROJECT_ENDPOINT;
const apiKey = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const modelDeployment = process.env.NEXT_PUBLIC_MODEL_DEPLOYMENT;

const client = new ModelClient(endpoint, new AzureKeyCredential(apiKey));

export default function MultiModal() {
  // State variables for managing user input and AI responses.
  const [inputType, setInputType] = useState(''); // Selected input type (text, image, audio)
  const [prompt, setPrompt] = useState(''); // User prompt
  const [file, setFile] = useState(null); // Uploaded file (image/audio)
  const [output, setOutput] = useState(''); // AI response
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(''); // Error messages

  // Handles form submission and sends the request to Azure AI.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setOutput('');
    setError('');

    try {
      if (!prompt) {
        setError('Please enter a prompt.');
        setLoading(false);
        return;
      }

      let response;
      if (inputType === 'text') {
        // Handle text input
        response = await client.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
              { role: "user", content: prompt }
            ],
            model: modelDeployment,
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
              { role: "user", content: prompt },
              { role: "user", content: { image: imageBase64 } }
            ],
            model: modelDeployment,
          },
        });
      } else if (inputType === 'audio') {
        // Handle audio input
        if (!file) {
          setError('Please upload an audio file.');
          setLoading(false);
          return;
        }
        const audioBase64 = await toBase64(file);
        response = await client.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: "You are an AI assistant in a grocery store that sells fruit." },
              { role: "user", content: prompt },
              { role: "user", content: { audio: audioBase64 } }
            ],
            model: modelDeployment,
          },
        });
      } else {
        setError('Please select a valid input type.');
        setLoading(false);
        return;
      }

      if (response.status === "200") {
        setOutput(response.body.choices[0].message.content);
      } else {
        setError(`Error: ${response.status}`);
      }
    } catch (err) {
      setError('Failed to get a response from Azure AI.');
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

        {inputType === 'image' || inputType === 'audio' ? (
          <>
            <label htmlFor="file" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload File:</label>
            <input
              type="file"
              id="file"
              accept={inputType === 'image' ? 'image/*' : 'audio/*'}
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginBottom: '10px' }}
            />
          </>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#eb2f96', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }}
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