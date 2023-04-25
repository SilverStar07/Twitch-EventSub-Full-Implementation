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

const ngrokURL = "";
let access_token = "";

const eventTypes = [
    "channel.update",
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
    "user.update",
    "channel.charity_campaign.donate",
    "channel.charity_campaign.start",
    "channel.charity_campaign.progress",
    "channel.charity_campaign.stop",
    "channel.shield_mode.begin",
    "channel.shield_mode.end",
    "channel.shoutout.create",
    "channel.shoutout.receive"
];
const eventTypesConfig = {
    "channel.update": {
        "type": "channel.update",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.follow": {
        "type": "channel.follow",
        "version": "2",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id,
            "moderator_user_id": configuration.broadcaster_id
        }
    },
    "channel.subscribe": {
        "type": "channel.subscribe",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.subscription.end": {
        "type": "channel.subscription.end",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.subscription.gift": {
        "type": "channel.subscription.gift",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.subscription.message": {
        "type": "channel.subscription.message",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.cheer": {
        "type": "channel.cheer",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.raid": {
        "type": "channel.raid",
        "version": "1",
        "condition": {
            "to_broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.ban": {
        "type": "channel.ban",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.unban": {
        "type": "channel.unban",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.moderator.add": {
        "type": "channel.moderator.add",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.moderator.remove": {
        "type": "channel.moderator.remove",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.channel_points_custom_reward.add": {
        "type": "channel.channel_points_custom_reward.add",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.channel_points_custom_reward.update": {
        "type": "channel.channel_points_custom_reward.update",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.channel_points_custom_reward.remove": {
        "type": "channel.channel_points_custom_reward.remove",
        "version": "1",
        "condition":
            {
                "broadcaster_user_id": configuration.broadcaster_id
            }
    },
    "channel.channel_points_custom_reward_redemption.add": {
        "type": "channel.channel_points_custom_reward_redemption.add",
        "version": "1",
        "condition":
            {
                "broadcaster_user_id": configuration.broadcaster_id
            }
    },
    "channel.channel_points_custom_reward_redemption.update": {
        "type": "channel.channel_points_custom_reward_redemption.update",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.poll.begin": {
        "type": "channel.poll.begin",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.poll.progress": {
        "type": "channel.poll.progress",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.poll.end": {
        "type": "channel.poll.end",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.prediction.begin": {
        "type": "channel.prediction.begin",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.prediction.progress": {
        "type": "channel.prediction.progress",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.prediction.lock": {
        "type": "channel.prediction.lock",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.prediction.end": {
        "type": "channel.prediction.end",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "drop.entitlement.grant": {
        "type": "drop.entitlement.grant",
        "version": "1",
        "condition": {
            "organization_id": configuration.broadcaster_id // Not sure if value is correct
        },
        "is_batching_enabled": true
    },
    "extension.bits_transaction.create": {
        "type": "extension.bits_transaction.create",
        "version": "1",
        "condition": {
            "extension_client_id": configuration.broadcaster_id // Not sure if value is correct
        }
    },
    "channel.goal.begin": {
        "type": "channel.goal.begin",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.goal.progress": {
        "type": "channel.goal.progress",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.goal.end": {
        "type": "channel.goal.end",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.hype_train.begin": {
        "type": "channel.hype_train.begin",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.hype_train.progress": {
        "type": "channel.hype_train.progress",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.hype_train.end": {
        "type": "channel.hype_train.end",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "stream.online": {
        "type": "stream.online",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "stream.offline": {
        "type": "stream.offline",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "user.authorization.grant": {
        "type": "user.authorization.grant",
        "version": "1",
        "condition": {
            "client_id": configuration.broadcaster_id // Not sure if value is correct
        }
    },
    "user.authorization.revoke": {
        "type": "user.authorization.revoke",
        "version": "1",
        "condition": {
            "client_id": configuration.broadcaster_id // Not sure if value is correct
        }
    },
    "user.update": {
        "type": "user.update",
        "version": "1",
        "condition": {
            "user_id": configuration.broadcaster_id
        }
    },
    "channel.charity_campaign.donate": {
        "type": "channel.charity_campaign.donate",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.charity_campaign.start": {
        "type": "channel.charity_campaign.start",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.charity_campaign.progress": {
        "type": "channel.charity_campaign.progress",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.charity_campaign.stop": {
        "type": "channel.charity_campaign.stop",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id
        }
    },
    "channel.shield_mode.begin": {
        "type": "channel.shield_mode.begin",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id,
            "moderator_user_id": configuration.broadcaster_id
        }
    },
    "channel.shield_mode.end": {
        "type": "channel.shield_mode.end",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id,
            "moderator_user_id": configuration.broadcaster_id
        }
    },
    "channel.shoutout.create": {
        "type": "channel.shoutout.create",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id,
            "moderator_user_id": configuration.broadcaster_id
        }
    },
    "channel.shoutout.receive": {
        "type": "channel.shoutout.receive",
        "version": "1",
        "condition": {
            "broadcaster_user_id": configuration.broadcaster_id,
            "moderator_user_id": configuration.broadcaster_id
        }
    }
};
console.log("Number of events to subscribe to: " + eventTypes.length);

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
    "user:read:subscriptions channel:moderate chat:edit chat:read whispers:read whispers:edit " +
    "channel:read:charity moderator:read:shield_mode moderator:manage:shield_mode moderator:read:shoutouts " +
    "moderator:manage:shoutouts moderator:read:followers")
    .then(response => {
        const responseData = response.data;
        access_token = responseData.access_token;

        for (let i = 0; i < eventTypes.length; i++) {
            axios.post(ngrokURL + "/createWebhook?eventType=" + eventTypes[i])
                .then(() => {
                    console.log(i, "Webhook successfully established: " + eventTypes[i]);
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
    const webhookSubscriptionType = webhookEvent.subscription.type;
    let eventUsername = webhookEvent.event.user_name ? webhookEvent.event.user_name : '';

    if (webhookSubscriptionType === "stream.online" || webhookSubscriptionType === "channel.update") {
        setTimeout(() => {
            // Put your code here to do something 30 seconds after the stream goes live,
            // or you change the stream title or game.

        }, 30000);
    }
    else if (webhookSubscriptionType === "channel.follow") {

    }
    else if (webhookSubscriptionType === "channel.subscribe") {

    }
    else if (webhookSubscriptionType === "channel.subscription.message") {
        // This is the event for resubs
    }
    else if (webhookSubscriptionType === "channel.subscription.gift") {
        const gifterName = webhookEvent.event.is_anonymous === true ? "Anonymous" : eventUsername;

    }
    else if (webhookSubscriptionType === "channel.cheer") {
        const cheererName = webhookEvent.event.is_anonymous === true ? "Anonymous" : eventUsername;

    }
    else if (webhookSubscriptionType === "channel.raid") {

    }
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
                    console.log("Number of events to unsubscribe: " + subscribedEvents.data.length);

                    for (let i = 0; i < subscribedEvents.data.length; i++) {
                        axios.delete("https://api.twitch.tv/helix/eventsub/subscriptions?id=" +
                            subscribedEvents.data[i].id,
                            {
                                headers: {
                                    "Client-ID": configuration.API_KEY,
                                    Authorization: "Bearer " + access_token
                                }
                            }).then(() => {
                            console.log(i, subscribedEvents.data[i].type + " unsubscribed");
                        }).catch(webhookError => {
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
        ...eventTypesConfig[request.query.eventType],
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