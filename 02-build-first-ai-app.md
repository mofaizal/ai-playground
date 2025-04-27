

## **Step 1: Update Configuration `.env.local` File**

- [ ] Task 1 Go to ai-foundry project `ai.azure.com` look for Your Azure AI endpoint, Key and model id to update

```env
NEXT_PUBLIC_AI_INFERENCE_ENDPOINT="Your Azure AI endpoint"
NEXT_PUBLIC_AZURE_API_KEY="Your Azure API key"
NEXT_PUBLIC_AZURE_MODEL_ID="Your Azure model ID"
```

## **Step 2: Create the Chat Interface Component**

- [ ] Taks 2 Now, let's create the main chat interface. Add the following code to `app/single-message/page.js`.

### **Code Walkthrough:**

### **Part 1: Basic Setup and State** 

- [ ] Step 1: Import Required Libraries
```js
// These libraries are essential for interacting with Azure AI services and managing state in React.
import { useState } from 'react';
```
- [ ] Step 2 : Define the Chat Interface Component

```js
// This is the main React component for the chat interface.
export default function ChatInterface() {

}
```
- [ ] Step 2: Define the Chat Interface Component, Set Up State Variables and Handle User Input Changes

> [!IMPORTANT]  
> all your script must be place export default function ChatInterface() { <Insert your script here> }

```js 
  // Set Up State Variables
  // These state variables manage user input and chat history.
  const [userInput, setUserInput] = useState(''); // Tracks the user's input
  const [chatHistory, setChatHistory] = useState([{ role: 'system', content: 'You are a helpful assistant.' }]); // Stores the chat messages

  // Handle User Input Changes
  // This function updates the `userInput` state whenever the user types in the input field.
  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

 ``` 

 - [ ] Step 4: Render the Chat Interface
  
  ```js
  // This section defines the UI for the chat interface, including the chat history and input field.
  return (
    <div>
      <h1>Chat with AI</h1>
      <div style={{ marginBottom: '10px' }}>
        {/* Display the chat history */}
        {chatHistory.slice(1).map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '8px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: msg.role === 'user' ? '#d1e7dd' : '#f8d7da', // Green for user, red for AI
            }}
          >
            <strong>{msg.role === 'user' ? 'You:' : 'AI:'}</strong>{' '}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
      </div>
      <div>
        {/* Input field for user messages */}
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{ width: '70%', padding: '8px' }}
        />
      </div>
    </div>
  );

```

---

### **Step 4 : Test your applications**

Open your terminal in the project root directory (ai-foundry-nextjs-app) and run:

```
npm run dev
```

in your browser `http://localhost:3000/single-message` to test the application

### **Part 2: Basic Setup and State** 

- [ ] Task 1 after line `3` insert below import commands

```js
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

```

- [ ] Task 2 Set Up Environment Variables

end of `import` script around line `6` insert below script block

```js
// Use environment variables to securely store sensitive information like API keys and endpoints.
const endpoint = process.env.NEXT_PUBLIC_AI_INFERENCE_ENDPOINT; // Azure AI endpoint
const apiKey = process.env.NEXT_PUBLIC_AZURE_API_KEY; // Azure API key
const modelName = process.env.NEXT_PUBLIC_AZURE_MODEL_ID; // Model ID for the AI service

```


- [ ] Task 3: Initialize the Azure AI
  
```js
// The `ModelClient` is used to interact with Azure AI services. It requires the endpoint and credentials.
const client = new ModelClient(endpoint, new AzureKeyCredential(apiKey));
```

- [ ] Task 4: Add Advanced State Variables
  
> [!IMPORTANT]  
> all your script must be place after `You are a helpful assistant` statement as newline 

```js
// These state variables manage loading state and error messages.
const [loading, setLoading] = useState(false); // Indicates whether a request is in progress
const [error, setError] = useState(''); // Stores any error messages
```

- [ ] Task 5: Handle Sending Messages

> [!IMPORTANT]  
> Add below script after `const handleInputChange = (event) => {setUserInput(event.target.value);};` lines with following code 

```js
// This function sends the user's message to the Azure AI service and updates the chat history.
const handleSendMessage = async () => {
  if (!userInput.trim()) return; // Prevent sending empty messages

  // Add the user's message to the chat history
  const newUserMessage = { role: 'user', content: userInput };
  const updatedChatHistory = [...chatHistory, newUserMessage];
  setChatHistory(updatedChatHistory);
  setUserInput(''); // Clear the input field
  setLoading(true); // Show the loading indicator
  setError(''); // Clear any previous errors

  try {
    // Send the chat history to the Azure AI service
    const response = await client.path("/chat/completions").post({
      body: {
        messages: updatedChatHistory, // Include the full chat history
        max_tokens: 4096, // Maximum tokens for the response
        temperature: 1, // Controls randomness in the response
        top_p: 1, // Controls diversity via nucleus sampling
        model: modelName, // Specify the model to use
      },
    });

    // Handle the AI's response
    if (response.status === "200") {
      const aiResponseMessage = response.body.choices[0].message;
      if (aiResponseMessage?.content) {
        // Add the AI's response to the chat history
        setChatHistory([...updatedChatHistory, aiResponseMessage]);
      } else {
        setError('No response received.');
      }
    } else {
      setError(`Error in chat: ${response.status}`);
      console.error("Chat completion error:", response);
    }
  } catch (err) {
    console.error("The sample encountered an error:", err);
    setError("Failed to send message.");
  } finally {
    setLoading(false); // Hide the loading indicator
  }
};
```

### **Part 3: Styling and Enhancements**

- [ ] Task 1: Update the Chat History Styling

```js
// Add distinct colors for user and AI messages.
const chatMessageStyle = (role) => ({
  marginBottom: '8px',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: role === 'user' ? '#d1e7dd' : '#f8d7da', // Green for user, red for AI
});
```


- [ ] Task 2: Add Error and Loading Indicators
  
```js
return (
  <div>
    <h1>Chat with AI</h1>
    <div style={{ marginBottom: '10px' }}>
      {/* Display the chat history */}
      {chatHistory.slice(1).map((msg, index) => (
        <div key={index} style={chatMessageStyle(msg.role)}>
          <strong>{msg.role === 'user' ? 'You:' : 'AI:'}</strong>{' '}
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        </div>
      ))}
      {/* Display error messages */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {/* Display loading indicator */}
      {loading && <p>Loading...</p>}
    </div>
    <div>
      {/* Input field for user messages */}
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Type your message..."
        style={{ width: '70%', padding: '8px' }}
      />
      {/* Send button */}
      <button
        onClick={handleSendMessage}
        disabled={loading}
        style={{ padding: '8px', marginLeft: '10px' }}
      >
        Send
      </button>
    </div>
  </div>
);
```

### **Final : Test your applications**

Open your terminal in the project root directory (ai-foundry-nextjs-app) and run:

```
npm run dev
```

in your browser `http://localhost:3000/single-message` to test the application