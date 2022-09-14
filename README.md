# Twitch EventSub Full Implementation

This project was created for [this video tutorial on fully implementing the Twitch EventSub system](https://youtu.be/JgJvd9nW8Xk). It will explain all of the finer details of how the system works as well as share additional resources. If you have any questions or feedback on how I can make this better or clearer, comment on the video above or [DM me on Twitter](https://twitter.com/SirSilverStar).

If this has helped you, please considering following on the places I make things and say hi!
- [YouTube](https://www.youtube.com/SirSilverStar) (If you'd like to see what I do with Twitch EventSubs, [check out this playlist](https://youtube.com/playlist?list=PLKaXzzk7E_iWKXDe4DQAVx9m-l1yZhEL5)!)
- [Twitch](https://twitch.tv/SirSilverStar)
- [Discord](https://discord.gg/fz5556n)

## How to set up the system for the first time

- Install [NodeJS](https://nodejs.org/en/)
- After pulling this repo, run `npm install`
- If you haven't already, [register your Twitch app](https://dev.twitch.tv/console)
  - Set your app's OAuth Redirect URL to `https://localhost:4000/redirect`
- Fill in config file's attributes found in `src/config.json`
- Install [Chocolatey](https://chocolatey.org/install)
- Install [OpenSSL](https://community.chocolatey.org/packages/openssl) 
  - `choco install openssl`
- Install and authenticate [ngrok](https://ngrok.com/)
- Move into the cert folder
  - `cd .\src\cert`
- Run the next three commands in the command line to create a self-signed certificate for https transfers to Twitch:
  - `openssl genrsa -out key.pem`
  - `openssl req -new -key key.pem -out csr.pem`
    - You will be asked for multiple pieces of information. The only REQUIRED section is Common Name. It should be `localhost:4000`.
  - `openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem`
- Move up one folder
  - `cd ..`
- Run the bot
  - `node bot.js`
  - Don't worry about any EventSub errors you might get for now. The bot needs to be running for the next step.
- Go to the address below, replacing the `<YOUR API KEY>` section with your app's Client ID. Remove the < and >.
  - Your browser will warn you that the page you're trying to view is not safe. This is because you're running a self-signed certificate. Everything is fine. Depending on your browser, there will be a way to accept the risk and continue. Just click around on the page and find a way to push past the warning.
  - `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=<YOUR API KEY>&redirect_uri=https://localhost:4000/redirect&scope=analytics:read:extensions analytics:read:games bits:read channel:edit:commercial channel:manage:broadcast channel:manage:extensions channel:manage:polls channel:manage:predictions channel:manage:redemptions channel:manage:schedule channel:manage:videos channel:read:editors channel:read:goals channel:read:hype_train channel:read:polls channel:read:predictions channel:read:redemptions channel:read:stream_key channel:read:subscriptions clips:edit moderation:read moderator:manage:banned_users moderator:read:blocked_terms moderator:manage:blocked_terms moderator:manage:automod moderator:read:automod_settings moderator:manage:automod_settings moderator:read:chat_settings moderator:manage:chat_settings user:edit user:edit:follows user:manage:blocked_users user:read:blocked_users user:read:broadcast user:read:email user:read:follows user:read:subscriptions channel:moderate chat:edit chat:read whispers:read whispers:edit`
- Give your app the permissions it's asking for to your Twitch account.
- Close the bot.
- Go to line 118 of `bot.js` and implement whatever logic you like to handle incoming events. [Here's a list of events you can work with and the attributes each has.](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types)

## Running the system

- Open two command line or Powershell windows.
- In the first window, run the following command:
  - `ngrok http -bind-tls=true https://localhost:4000`
- Copy the `Forwarding` address and paste it into the ngrokURL variable found on line 18 of `bot.js`.
- In the second window, navigate to the `src` folder of this system and run the following command:
  - `node bot.js`
- You're good to stream!
- At the end of your stream, type !endstream in order to stop the EventSub specific stuff. You NEED to do this, otherwise the system will not work after a few times until you do it.
- After your stream, close both windows.