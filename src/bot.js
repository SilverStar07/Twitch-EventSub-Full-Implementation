const tmi = require('tmi.js');
const configuration = require('./config');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const httpsApp = express();
const httpsServer = require('https').createServer({
    key: fs.readFileSync("cert/key.pem"),
    cert: fs.readFileSync("cert/cert.pem")
}, httpsApp);
const crypto = require('crypto');
const https = require('https');

const chatbot = new tmi.client(configuration);
chatbot.on("message", chatMessageHandler);
chatbot.connect();

const ngrokURL = "https://9ffb-2601-3c3-c200-2200-1-4d52-7193-ef59.ngrok.io";
let access_token = "";

const eventTypes = ["channel.update",
    "channel.follow",
    "channel.subscribe",
    "channel.subscription.end",
    "channel.subscription.gift",
    "channel.subscription.message",
    "channel.cheer",
    "channel.raid",
    "channel.ban",
    "channel.unban",
    "channel.moderator.add",
    "channel.moderator.remove",
    "channel.channel_points_custom_reward.add",
    "channel.channel_points_custom_reward.update",
    "channel.channel_points_custom_reward.remove",
    "channel.channel_points_custom_reward_redemption.add",
    "channel.channel_points_custom_reward_redemption.update",
    "channel.poll.begin",
    "channel.poll.progress",
    "channel.poll.end",
    "channel.prediction.begin",
    "channel.prediction.progress",
    "channel.prediction.lock",
    "channel.prediction.end",
    "drop.entitlement.grant",
    "extension.bits_transaction.create",
    "channel.goal.begin",
    "channel.goal.progress",
    "channel.goal.end",
    "channel.hype_train.begin",
    "channel.hype_train.progress",
    "channel.hype_train.end",
    "stream.online",
    "stream.offline",
    "user.authorization.grant",
    "user.authorization.revoke",
    "user.update"];

axios.post("https://id.twitch.tv/oauth2/token" +
    "?client_id=" + configuration.API_KEY +
    "&client_secret=" + configuration.API_SECRET +
    "&grant_type=client_credentials" +
    "&scope=analytics:read:extensions analytics:read:games bits:read channel:edit:commercial " +
    "channel:manage:broadcast channel:manage:extensions channel:manage:polls channel:manage:predictions " +
    "channel:manage:redemptions channel:manage:schedule channel:manage:videos channel:read:editors " +
    "channel:read:goals channel:read:hype_train channel:read:polls channel:read:predictions " +
    "channel:read:redemptions channel:read:stream_key channel:read:subscriptions clips:edit moderation:read " +
    "moderator:manage:banned_users moderator:read:blocked_terms moderator:manage:blocked_terms " +
    "moderator:manage:automod moderator:read:automod_settings moderator:manage:automod_settings " +
    "moderator:read:chat_settings moderator:manage:chat_settings user:edit user:edit:follows " +
    "user:manage:blocked_users user:read:blocked_users user:read:broadcast user:read:email user:read:follows " +
    "user:read:subscriptions channel:moderate chat:edit chat:read whispers:read whispers:edit")
    .then(response => {
        const responseData = response.data;
        access_token = responseData.access_token;

        for (let i = 0; i < eventTypes.length; i++) {
            axios.post(ngrokURL + "/createWebhook?eventType=" + eventTypes[i])
                .then(() => {
                    console.log("Webhook successfully established");
                })
                .catch(webhookError => {
                    console.log("Webhook creation error: " + webhookError);
                });
        }
    })
    .catch(error => {
        console.log(error);
    });

const verifyTwitchWebhookSignature = (request, response, buffer, encoding) => {
    const twitchMessageID = request.header("Twitch-Eventsub-Message-Id");
    const twitchTimeStamp = request.header("Twitch-Eventsub-Message-Timestamp");
    const twitchMessageSignature = request.header("Twitch-Eventsub-Message-Signature");
    const currentTimeStamp = Math.floor(new Date().getTime() / 1000);

    if (Math.abs(currentTimeStamp - twitchTimeStamp) > 600) {
        throw new Error("Signature is older than 10 minutes. Ignore this request.");
    }
    if (!configuration.TWITCH_SIGNING_SECRET) {
        throw new Error("The Twitch signing secret is missing.");
    }

    const ourMessageSignature = "sha256=" +
        crypto.createHmac("sha256", configuration.TWITCH_SIGNING_SECRET)
            .update(twitchMessageID + twitchTimeStamp + buffer)
            .digest("hex");

    if (twitchMessageSignature !== ourMessageSignature) {
        throw new Error("Invalid signature");
    }
    else {
        console.log("Signature verified");
    }
};

const twitchWebhookEventHandler = (webhookEvent) => {
    // Do whatever crazy stuff you want to do with events here!
    // For information on individual event attributes go to
    // https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types
};

function chatMessageHandler(channel, userState, message, self) {
    const wordArray = message.split(" ");

    if (wordArray[0].toLowerCase() === "!endstream") {
        axios.get("https://api.twitch.tv/helix/eventsub/subscriptions",
            {
                headers: {
                    "Client-Id": configuration.API_KEY,
                    Authorization: "Bearer " + access_token
                }
            })
            .then(response => {
                if (response.status === 200) {
                    const subscribedEvents = response.data;

                    for (let i = 0; i < subscribedEvents.data.length; i++) {
                        axios.delete("https://api.twitch.tv/helix/eventsub/subscriptions?id=" +
                            subscribedEvents.data[i].id,
                            {
                                headers: {
                                    "Client-ID": configuration.API_KEY,
                                    Authorization: "Bearer " + access_token
                                }
                            })
                            .then(() => {
                                console.log(subscribedEvents.data[i].type + " unsubscribed");
                            })
                            .catch(webhookError => {
                                console.log("Webhook unsubscribe error: " + webhookError);
                            });
                    }
                }
                else {
                    console.log(response.status, response.data);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}

httpsApp.use(express.static(__dirname + "/html"));
httpsApp.use(express.json({verify: verifyTwitchWebhookSignature}));

httpsServer.listen(4000, function () {
    console.log("HTTPS Server is started! Have fun!");
});

httpsApp.get('/redirect', function (request, response) {
    response.sendFile(__dirname + "/html/appAccessRedirect.html");
});

httpsApp.post('/twitchwebhooks/callback',
    async (request, response) => {
    // Handle the Twitch webhook challenge
    if (request.header("Twitch-EventSub-Message-Type") === "webhook_callback_verification") {
        console.log("Verifying the Webhook is from Twitch");
        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.write(request.body.challenge);

        return response.end();
    }

    // Handle the Twitch event
    const eventBody = request.body;
    console.log("Recieving " +
        eventBody.subscription.type + " request for " +
        eventBody.event.broadcaster_user_name, eventBody);
    twitchWebhookEventHandler(eventBody);
    response.status(200).end();
});

httpsApp.post('/createWebhook', (request, response) => {
    let createWebhookParameters = {
        host: "api.twitch.tv",
        path: "helix/eventsub/subscriptions",
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Client-ID": configuration.API_KEY,
            "Authorization": "Bearer " + access_token
        }
    };

    let createWebhookBody = {
        "type": request.query.eventType,
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id,
        },
        "transport": {
            "method": "webhook",
            "callback": ngrokURL + "/twitchwebhooks/callback",
            "secret": configuration.TWITCH_SIGNING_SECRET
        }
    };

    let responseData = "";
    let webhookRequest = https.request(createWebhookParameters, (result) => {
        result.setEncoding('utf8');
        result.on('data', function (data) {
            responseData = responseData + data;
        }).on('end', function (result) {
            let responseBody = JSON.parse(responseData);
            response.send(responseBody);
        })
    });

    webhookRequest.on('error', (error) => {
        console.log(error);
    });
    webhookRequest.write(JSON.stringify(createWebhookBody));
    webhookRequest.end();
});