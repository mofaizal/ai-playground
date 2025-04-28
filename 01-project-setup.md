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

# Create an Azure AI Foundry project

Let's start by creating an Azure AI Foundry project.

1. In a web browser, open the [Azure AI Foundry portal](https://ai.azure.com) at `https://ai.azure.com` and sign in using your Azure credentials. Close any tips or quick start panes that are opened the first time you sign in, and if necessary use the **Azure AI Foundry** logo at the top left to navigate to the home page, which looks similar to the following image (close the **Help** pane if it's open):

    ![Screenshot of Azure AI Foundry portal.](./media/ai-foundry-home.png)

1. In the home page, select **+ Create project**.
1. In the **Create a project** wizard, enter a valid name for your project and if an existing hub is suggested, choose the option to create a new one. Then review the Azure resources that will be automatically created to support your hub and project.
1. Select **Customize** and specify the following settings for your hub:
    - **Hub name**: *A valid name for your hub*
    - **Subscription**: *Your Azure subscription*
    - **Resource group**: *Create or select a resource group*
    - **Location**: Select **Help me choose** and then select **gpt-4o** in the Location helper window and use the recommended region\*
    - **Connect Azure AI Services or Azure OpenAI**: *Create a new AI Services resource*
    - **Connect Azure AI Search**: Skip connecting

    > \* Azure OpenAI resources are constrained by regional model quotas. In the event of a quota limit being exceeded later in the exercise, there's a possibility you may need to create another resource in a different region.

1. Select **Next** and review your configuration. Then select **Create** and wait for the process to complete.
1. When your project is created, close any tips that are displayed and review the project page in Azure AI Foundry portal, which should look similar to the following image:

    ![Screenshot of a Azure AI project details in Azure AI Foundry portal.](./media/ai-foundry-project.png)

## Deploy a generative AI model

Now you're ready to deploy a generative AI language model to support your chat application. In this example, you'll use the OpenAI gpt-4o model; but the principles are the same for any model.

1. In the toolbar at the top right of your Azure AI Foundry project page, use the **Preview features** (**&#9215;**) icon to ensure that the **Deploy models to Azure AI model inference service** feature is enabled. This feature ensures your model deployment is available to the Azure AI Inference service, which you'll use in your application code.
1. In the pane on the left for your project, in the **My assets** section, select the **Models + endpoints** page.
1. In the **Models + endpoints** page, in the **Model deployments** tab, in the **+ Deploy model** menu, select **Deploy base model**.
1. Search for the **gpt-4o** model in the list, and then select and confirm it.
1. Deploy the model with the following settings by selecting **Customize** in the deployment details:
    - **Deployment name**: *A valid name for your model deployment*
    - **Deployment type**: Global Standard
    - **Automatic version update**: Enabled
    - **Model version**: *Select the most recent available version*
    - **Connected AI resource**: *Select your Azure OpenAI resource connection*
    - **Tokens per Minute Rate Limit (thousands)**: 50K *(or the maximum available in your subscription if less than 50K)*
    - **Content filter**: DefaultV2

    > **Note**: Reducing the TPM helps avoid over-using the quota available in the subscription you are using. 50,000 TPM should be sufficient for the data used in this exercise. If your available quota is lower than this, you will be able to complete the exercise but you may experience errors if the rate limit is exceeded.

