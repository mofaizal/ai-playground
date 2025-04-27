# Setup NETX.JS AI Project Setup

## **Step 1: Set Up Your Next.js Project**

First, create a new Next.js project. Open your terminal and run the following commands:

- [ ] Task 1 Crete Next.JS Project

```bash
npx create-next-app@latest ai-foundry-nextjs-app
cd ai-foundry-nextjs-app
```

- [ ] Task 2 Copy the following lines of text and save them as a file `package.json` inside your folder. This script include inside `dependencies`
  
```js
    "@azure-rest/ai-inference": "latest",
    "@azure/core-auth": "latest",
    "@azure/core-sse": "latest"
```

- [ ] Task 3 Run following command to install ai foundry inference sdk dependencies packages

```
npm install @azure-rest/ai-inference @azure/core-auth @azure/core-sse
```

### **Explanation:**
- `npx create-next-app@latest`: Creates a new Next.js application.
- `npm install`: Installs the required Azure libraries for interacting with AI services.

---

## **Step 2: Configure Your `.env.local` File**

- [ ] Task 4 Create a `.env.local` file in the root of your Next.js project and add the following environment variables:

```env
NEXT_PUBLIC_AI_INFERENCE_ENDPOINT="Your Azure AI endpoint"
NEXT_PUBLIC_AZURE_API_KEY="Your Azure API key"
NEXT_PUBLIC_AZURE_MODEL_ID="Your Azure model ID"
```

### **Important Notes:**
- **Environment Variables**: These variables store sensitive information securely. Never commit this file to version control.
- **Azure Endpoint**: You can find this in your Azure portal under the AI service you created.
- **API Key**: This is the key to authenticate your requests.
- **Model ID**: Specify the model you want to use (e.g., `gpt-4`).
- **.gitignore**: Include .env.local file
---

## **Step 3: Test your defaut nextjs applications**

Open your terminal in the project root directory (ai-foundry-nextjs-app) and run:

```
npm run dev
```