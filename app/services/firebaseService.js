const { admin } = require("../utils/firebase");
const { PUSH_NOTIFICATION_IMAGE_URL } = require(`../utils/constants`);

let firebaseService = {};

firebaseService.sendPushNotification = async (deviceToken, messageTitle, messageBody, dynamicData = null, route = "/", channelType, queryParams = {}) => {
    let notificationRoute = `${route}?source=notification`
    if (Object.keys(queryParams).length > 0) {
        const queryString = Object.keys(queryParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
            .join('&');
        notificationRoute = `${notificationRoute}&${queryString}`;
    }
    const messageData = {
        notification: {
            title: messageTitle,
            body: messageBody,
        },
        android: {
            notification: {
                imageUrl: "https://www.w3schools.com/html/pic_trulli.jpg",
                sound: 'alert.mp3',
                channel_id: channelType
            }
        },
        apns: {
            payload: {
                aps: {
                    'mutable-content': 1,
                    sound: 'alert.caf',
                    channel_id: channelType
                }
            },
            fcm_options: {
                image: "https://www.w3schools.com/html/pic_trulli.jpg"
            }
        },
        data: {
            data: JSON.stringify(dynamicData),
            path: notificationRoute
        },
        token: deviceToken
    };
    console.log(messageData, "messageData");
    admin.messaging().send(messageData)
        .then((response) => {
            console.log('Successfully sent push notification:', response);
        })
        .catch((error) => {
            console.log('Error sending push notification:', error);
        });
}


firebaseService.sendPushNotificationToMultipleDevice = async (messageTitle, messageBody, dynamicData = null, deviceTokens, route = "/", channelType, queryParams = {}) => {
    let notificationRoute = `${route}?source=notification`

    if (Object.keys(queryParams).length > 0) {
        const queryString = Object.keys(queryParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
            .join('&');
        notificationRoute = `${notificationRoute}&${queryString}`;
    }
    const messageData = {
        notification: {
            title: messageTitle,
            body: messageBody
        },
        //sending an image to specific platform
        android: {
            notification: {
                imageUrl: PUSH_NOTIFICATION_IMAGE_URL.DARK,
                sound: 'alert.mp3',
                channel_id: channelType
            }
        },
        apns: {
            payload: {
                aps: {
                    'mutable-content': 1,
                    sound: 'alert.caf',
                    channel_id: channelType
                }
            },
            fcm_options: {
                image: PUSH_NOTIFICATION_IMAGE_URL
            }
        },
        //   webpush: {
        //     headers: {
        //       image: PUSH_NOTIFICATION_IMAGE_URL
        //     }
        //   },
        data: {
            data: JSON.stringify(dynamicData),
            path: notificationRoute
        },
        tokens: deviceTokens
    };
    admin.messaging().sendEachForMulticast(messageData)
        .then((response) => {
            console.log('Successfully sent push notification to all device:', response);
        })
        .catch((error) => {
            console.log('Error sending push notification:', error);
        });
}


module.exports = firebaseService