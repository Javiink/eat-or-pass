
<h1 align="center"><img height="240" src="https://github.com/Javiink/eat-or-pass/assets/43996484/f3c4fb25-9a43-4fcb-98f8-79c8442490da" /><br>🍝 Eat or Pass 🙅</h1>
<p align="center"><i>Your Tinder-like AI-powered food bot</i> 🤤</p>

Eat or Pass is a Telegram Bot application designed to fulfill your culinary curiosity. It will recommend some dishes from all around the world that may be of your liking, using AI to predict your tastes. Let it know you better!

<p align="center"><img height="500" src="https://github.com/Javiink/eat-or-pass/assets/43996484/4fe8ca16-e951-4a6d-974f-702031ca8755" /></p>

## Commands
- **/suggestion**: The bot will reply with a dish trying to meet your tastes.
- **/likes**: It will show a list of the latest dishes you liked.

## To-do
I have developed this bot while learning NestJS so it's very basic. There are some more features that could be implemented in the bot, as the following:

- [ ] User settings: Custom diet (vegetarian, vegan, gluten-free...)
- [ ] User settings: Language selection to translate the content of the messages to the users language
- [ ] Possibility to view a recipe for liked dishes

## Contributions
You are welcome if you want to expand the bot features! I will be very pleased if you want to join the development; PRs are welcome.

To setup the dev environment follow this steps:

### Clone the project

    $ git clone git@github.com:Javiink/eat-or-pass.git

### Fill the secrets
You will need API keys for the third-party services that the bot will use, so copy the `.env.example` file and rename it to `.env.development.local` and fill the secrets
- **Telegram Bot API**: Talk to [@BotFather](https://t.me/BotFather) in Telegram and create a bot. It will return an API key, paste it in the `TG_BOT_API` environment variable.
- **GROQ Cloud**: To put it in a nutshell, this is the AI service that will generate the dishes. At this moment, their API is free to use. Go to [GROQ Cloud](https://console.groq.com/keys), create an account and generate a key. Paste that key in the `GROQ_API_KEY` environment variable.
- **Gooogle Custom Search Engine**: The bot will use this API to search for images for the dishes. We need 2 secrets here:
  - Custom Search JSON API: Go to [Google Custom Search Docs](https://developers.google.com/custom-search/v1/introduction) and follow the steps, the paste the API key in the `GOOGLE_CUSTOMSEARCH_API_KEY` environment variable.
  - Custom Programmable Search Engine CX: Go to [Google Programmable Search engine Control panel](https://programmablesearchengine.google.com/controlpanel/all) and add a new Custom Search. In the "What to search?" section, select "Search the entire web". In the "Search settings" section, make sure to toggle on those two switches. Create the search engine and put the Search engine ID in the `GOOGLE_CUSTOMSEARCH_CX` environment variable.
- **MongoDB URL**: You will need a working MongoDB database to store the users preferences. You can install it in your computer/server, use a docker image or the free plan of MongoDB Atlas. Put the MongoDB URL in the `DB_MONGO_URL` environment variable.

### Run the project
    $ npm run start:dev