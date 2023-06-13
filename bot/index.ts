// Import required packages
import * as restify from "restify";

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
  MemoryStorage,
  TurnContext,
} from "botbuilder";

import config from "./config"; 
import { Application, 
  DefaultPromptManager, 
  DefaultTurnState, 
  OpenAIModerator, 
  OpenAIPlanner 
} from "@microsoft/teams-ai";
import { UserState, ConversationState,TempState } from "./BotStates";
import path from "path";

let appInsights = require("applicationinsights");
appInsights.setup(process.env.BOT_APPINSIGHTS_INSTRUMENTATIONKEY);
appInsights.start();
var client = appInsights.defaultClient; 
 
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: config.botId,
  MicrosoftAppPassword: config.botPassword,
  MicrosoftAppType: "MultiTenant",
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  credentialsFactory
);



// DefaultTurnState: Conversation State, UserState, TempState
type ApplicationTurnState = DefaultTurnState<ConversationState, UserState, TempState>;

// New:
// Define storage and application
const storage = new MemoryStorage();

// Create AI components
const planner = new OpenAIPlanner({
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'text-davinci-003',
  logRequests: true
});
const moderator = new OpenAIModerator({
  apiKey: process.env.OPENAI_API_KEY,
  moderate: 'both'
});

const promptManager = new DefaultPromptManager<ApplicationTurnState>(path.join(__dirname, '../src/prompts'));

const app = new Application<ApplicationTurnState>({
    storage,
     ai: {
      planner,
      moderator,
      promptManager,
      prompt: 'chat',
      history: {
          assistantHistoryType: 'text'
      }
  }
});

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context: TurnContext, error: Error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );
 
  client.trackEvent(
    {name: "my custom event", 
    properties: {customProperty: error.message}
   }
  );

  client.trackException({exception: new Error("handled exceptions can be logged with this method")});

  client.flush();
  // Send a message to the user
  await context.sendActivity(`The bot encountered unhandled error:\n ${error.message}`);
  await context.sendActivity("To continue to run this bot, please fix the bot source code.");

  // Clear out state to be done with ApplicationTurnState in teams ai library
  //await conversationState.delete(context);
 
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;
 

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Listen for user to say '/reset' and then delete conversation state
app.message('/reset', async (context: TurnContext, state: ApplicationTurnState) => {
  state.conversation.delete();
  await context.sendActivity(`Ok I've deleted the current conversation state.`);
});


// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await app.run(context);
  });
});
