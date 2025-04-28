
1. **Conversation History Management**:
   - **`conversation/page.js`**:
     - Maintains the entire conversation history in a state variable (e.g., `messages`).
     - Sends the full conversation history to the AI service.
     - Appends both the user's input and the AI's response to the conversation history.
  
   - **`stream/page.js`**:
     - Does not maintain the full conversation history.
     - Sends only the current user input to the AI service.
     - Replaces the state with only the current interaction (user input and AI response).

2. **State Variables**:
   - **`conversation/page.js`**:
     - Uses a state variable (e.g., `messages`) to store the full conversation history.
  
   - **`stream/page.js`**:
     - Uses a state variable (e.g., `chatHistory`) to store only the current interaction.

3. **API Request Payload**:
   - **`conversation/page.js`**:
     - Sends the full conversation history in the `messages` field of the API request body.
  
   - **`stream/page.js`**:
     - Sends only the current user message in the `messages` field of the API request body.

# AI Conversation vs Streaming Chat

This guide explains the differences between two AI chat implementations:
1. **Conversation Mode**: The AI remembers the entire conversation history.
2. **Streaming Mode**: The AI streams its response in real-time without maintaining conversation history.

---

## **2. Streaming Mode**
In this mode, the AI streams its response in real-time. The conversation history is not maintained.

### Key Features:
- Does not store the full conversation history.
- Sends only the current user message to the AI service.
- Streams the AI's response incrementally and updates the `output` state in real-time.

### Code Example:

- [ ] Task to update 
- [ ] Now, let's create the main chat interface for conversation. Add the following code to `app/stream/page.js`.
  
- [ ] Copy exiting code from `app/conversation/page.js`. to `app/stream/page.js`.

### Streaming Mode Code Example

Below is the implementation for the **Streaming Mode**. This mode streams the AI's response in real-time without maintaining the conversation history.

```js
'use client';

// This file implements a streaming interface for Azure AI responses.
// Streaming allows the user to see the AI's response in real-time.

import { useState, useRef, useEffect } from 'react';
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { createSseStream } from "@azure/core-sse";

// Environment variables are used for sensitive information like API keys.
const endpoint = process.env.NEXT_PUBLIC_AI_INFERENCE_ENDPOINT;
const apiKey = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const modelName = process.env.NEXT_PUBLIC_AZURE_MODEL_ID;

const client = new ModelClient(endpoint, new AzureKeyCredential(apiKey));

// Converts a string into a ReadableStream for streaming processing.
function stringToReadableStream(str) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str));
      controller.close();
    },
  });
}

export default function Stream() {
  // State variables for managing the streaming process.
  const [prompt, setPrompt] = useState(''); // User input
  const [output, setOutput] = useState(''); // AI's streamed output
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(''); // Error messages
  const [isStreaming, setIsStreaming] = useState(false); // Streaming status
  const streamReader = useRef(null); // Reference to the stream reader

  // Handles form submission and starts the streaming process.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isStreaming) return; // Prevent multiple streams

    setLoading(true);
    setIsStreaming(true);
    setOutput('');
    setError('');
    streamReader.current = null;

    try {
      // Sends a request to Azure AI with streaming enabled.
      const streamResponse = await client.path("/chat/completions").post({
        body: {
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 1,
          top_p: 1,
          model: modelName,
          stream: true, // Enables streaming
        },
      });

      if (streamResponse.status === "200" && streamResponse.body) {
        const readableStream = stringToReadableStream(streamResponse.body);
        const sseStream = createSseStream(readableStream);
        streamReader.current = sseStream.getReader();

        let accumulatedOutput = '';
        while (true) {
          const { done, value } = await streamReader.current.read();
          if (done) break; // End of stream
          if (value?.data) {
            if (value.data === '[DONE]') break; // End signal
            try {
              const parsedData = JSON.parse(value.data);
              const text = parsedData?.choices?.[0]?.delta?.content || '';
              accumulatedOutput += text;
              setOutput(accumulatedOutput); // Update output in real-time
            } catch (e) {
              setError('Error parsing streamed data.');
            }
          }
        }
      } else {
        setError(`Error during streaming: ${streamResponse.status}`);
      }
    } catch (err) {
      setError('Failed to start streaming.');
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  // Cleans up the stream on component unmount.
  useEffect(() => {
    return () => {
      if (streamReader.current) {
        try {
          if (!streamReader.current.locked) {
            streamReader.current.cancel();
          }
        } catch (cancelError) {
          console.error("Error cancelling stream on unmount:", cancelError);
        }
      }
    };
  }, []);

  return (
       <div style={{ padding: '20px', backgroundColor: '#fff0f6', borderRadius: '8px' }}>
      <h1 style={{ color: '#eb2f96', marginBottom: '15px' }}>Streaming Output</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Enter your prompt:</label><br />
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          cols={50}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '16px' }}
        />
        <br />
        <button
          type="submit"
          disabled={loading || isStreaming}
          style={{ backgroundColor: '#eb2f96', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }}
        >
          {loading ? 'Loading...' : isStreaming ? 'Streaming...' : 'Submit'}
        </button>
      </form>
      {error && <p style={{ color: '#ff4d4f', marginTop: '10px' }}>Error: {error}</p>}
      <h2 style={{ marginTop: '20px', color: '#eb2f96' }}>Streamed Output:</h2>
      <div style={{ whiteSpace: 'pre-wrap', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: '#fff', fontFamily: 'monospace' }}>{output}</div>
    </div>
  );
}
```

---

## **Comparison Table**

| Feature                  | Conversation Mode                     | Streaming Mode                    |
|--------------------------|---------------------------------------|-----------------------------------|
| **State Variable**       | `messages`                           | `prompt`, `output`               |
| **History Management**   | Maintains full conversation history  | Does not maintain history         |
| **API Request Payload**  | Sends full history (`messages`)       | Sends only current message        |
| **Response Handling**    | Handles response as a single message | Streams response incrementally    |
| **Use Case**             | Multi-turn conversations             | Real-time response streaming      |

---

## **When to Use Each Mode**
- **Conversation Mode**: Use this when the AI needs context from previous messages to provide accurate responses.
- **Streaming Mode**: Use this for real-time applications where immediate feedback is required.



Update `layout.js` file

- [ ] open `layout.js` file update following script

```js
          <li style={{ marginBottom: '10px' }}>
            <Link href="/stream" style={{ color: '#ecf0f1', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '5px', backgroundColor: '#34495e', transition: 'background-color 0.3s ease' }}>
              Stream
            </Link>
          </li>
```