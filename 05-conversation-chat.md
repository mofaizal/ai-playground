# AI Conversation vs Single Message Chat

This document explains the differences between two AI chat implementations: one that remembers the conversation history and one that processes only single messages. It also provides guidance on how to implement these features.

---

## **1. Conversation Mode**
In this mode, the AI remembers the entire conversation history. Each user message and AI response is stored and sent to the AI service.

### Key Features:
- Maintains a `messages` state to store the full conversation history.
- Sends the entire conversation history to the AI service.
- Appends the AI's response to the conversation history.

### Code Example:

- [ ] Task to update 
- [ ] Now, let's create the main chat interface for conversation. Add the following code to `app/conversation/page.js`.
- [ ] Copy exiting code from `app/single-message/page.js`. to `app/conversation/page.js`.
- [ ] Understand the key difference and update following code to `app/conversation/page.js`. file

Mainly the line commented `Full conversation history` and  `Append the AI's response to the chat history` 

```javascript
    // Send the chat history to the Azure AI service
    const response = await client.path("/chat/completions").post({
      body: {
        messages: updatedChatHistory, // Full conversation history
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
        // Append the AI's response to the chat history
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
```
---

## **Comparison Table**

| Feature                  | Conversation Mode                     | Single Message Mode               |
|--------------------------|---------------------------------------|-----------------------------------|
| **State Variable**       | `messages`                           | `chatHistory`                    |
| **History Management**   | Maintains full conversation history  | Only stores the current message  |
| **API Request Payload**  | Sends full history (`updatedMessages`) | Sends only current message       |
| **Use Case**             | Multi-turn conversations             | Single-turn interactions         |

---

## **When to Use Each Mode**
- **Conversation Mode**: Use this when the AI needs context from previous messages to provide accurate responses.
- **Single Message Mode**: Use this for simple interactions where context is not required.

By understanding these differences, you can build AI chat interfaces tailored to your application's needs.
```

## **Update Layout.js**

```js

          <li style={{ marginBottom: '10px' }}>
            <Link href="/conversation" style={{ color: '#ecf0f1', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '5px', backgroundColor: '#34495e', transition: 'background-color 0.3s ease' }}>
              Conversation Chat
            </Link>
          </li>

```