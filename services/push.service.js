const push = require("@pushprotocol/restapi");



async function bridged_successfully(signer, receiver, channel) {
    try {
        await push.payloads.sendNotification({
            signer,
            type: 3,
            identityType: 2,
            notification: {
                title: "Foo Protocol Bridge",
                body: "Your Bridged Successfully"
            },
            recipients: `eip155:5:${receiver}`,
            channel,
            env: "staging",
            payload: {
                title: "Foo Bridge Notification",
                body: "Your bridge was Unsuccessful, contact admin.",
                cta: "https://github.com/developeruche",
                img: ""
            }
        });

        console.log("Notification has been sent")
    } catch (err) {
        console.log(err)
    }
}


async function bridged_unsuccessfully(signer, receiver, channel) {
    try {
        await push.payloads.sendNotification({
            signer,
            type: 3,
            identityType: 2,
            notification: {
                title: "Foo Protocol Bridge",
                body: "Your Bridged Unsuccessfully"
            },
            recipients: `eip155:5:${receiver}`,
            channel,
            env: "staging",
            payload: {
                title: "Foo Bridge Notification",
                body: "Your bridge was Unsuccessful, contact admin.",
                cta: "https://github.com/developeruche",
                img: ""
            }
        });

        console.log("Notification has been sent")
    } catch (err) {
        console.log(err)
    }
}



module.exports = {
    bridged_successfully,
    bridged_unsuccessfully
}