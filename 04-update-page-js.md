Update `page.js` file with home page information

```js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-page">
      <h1><strong>Welcome to the Technology with Faizal and build AI Foundry App!</strong></h1>
      <p>Explore different ways to interact with the AI:</p>
      <br></br>

      <section style={{ marginBottom: '20px' }}>
        <h2>Single Message</h2>
        <p><strong>Concept:</strong> Sends a single, independent request to the AI and receives a response. The AI has no memory of previous interactions within this mode.</p>
        <p><strong>Use Case:</strong> Simple queries, quick information retrieval, or tasks that don't require context.</p>
        <p><strong>Example Prompt:</strong> "What is the capital of Singapore?"</p>
        <p><strong>Example Prompt:</strong> "When is election?"</p>
      </section>
      </div>
  );
}

```
