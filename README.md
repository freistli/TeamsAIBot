# Teams AI Bot with Azure OpenAI ChatGPT

This simple Bot is developed using Teams Toolkit (TypeScript). As a sample project, it is integrated Azure OpenAI ChatGPT service through an Azure Function.

<img width="835" alt="image" src="https://user-images.githubusercontent.com/8623897/234754687-9b29d2d9-b366-494f-9c7f-a1d90c0d99aa.png">


# How to build 

1. git clone the project
2. Open it in VS Code, the VS Code should install [Teams Toolkit extension](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/install-teams-toolkit?tabs=vscode&pivots=visual-studio-code).
3. Provision the project to Azure
4. Publish the Azure Fucntion in VS Code from below link:

https://github.com/freistli/chatgpt-api/tree/main/demos/demo-azure-chatgpt-function

After publishing it,  configure below two keys in Application Settings:

```
AZURE_OPENAI_API_KEY
AZURE_OPENAI_API_BASE
CHATGPT_DEPLOY_NAME
```

Copy the Azure Function URL for step 5.

5. Add below varaibles in the .env.teamsfx.local:

```
# Following variables can be customized or you can add your owns.
# FOO=BAR
Azure_ChatGPT_Function_Url=https://<azure chatgpt function url got from step 4>
BOT_APPINSIGHTS_INSTRUMENTATIONKEY=xxxxxxxxx
BOT_APPINSIGHTS_CONNECTIONSTRING=xxxxxxxxxx
```

6. Now you can local test the Bot in Teams or publish it to Azure. 

After published to Azure, please explicitly add below varaibles in Application Settings of the bot web app service:

```
Azure_ChatGPT_Function_Url
BOT_APPINSIGHTS_INSTRUMENTATIONKEY
BOT_APPINSIGHTS_CONNECTIONSTRING
```

# More Info

For express deployment Teams AI ChatGPT Bot, and Teams specific features with ChatGPT, LLMs integration, can check:

https://github.com/freistli/rootbot
