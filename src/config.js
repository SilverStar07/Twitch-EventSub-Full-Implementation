const config = {
    identity: {
        username: "Your bot's Twitch username",
        password: "Your bot's oauth key from https://twitchapps.com/tmi/"
    },
    channels: ["Your Twitch channel name in all lowercase (NOT your bot's name)"],
    API_KEY: "Your Client ID given when you created your Twitch app on https://dev.twitch.tv/console",
    API_SECRET: "Your API secret given when you created your Twitch app on https://dev.twitch.tv/console",
    TWITCH_SIGNING_SECRET: "A really long password with numbers, letters, capital letters, and symbols (NO SPACES)",
    broadcaster_id: "Make a call to https://api.twitch.tv/helix/streams?user_login=yourusername " +
        "and copy in the user_id from JSON.parse(body).data[0]"
};

module.exports = config;