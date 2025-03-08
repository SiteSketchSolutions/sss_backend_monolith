const { SESClient } = require("@aws-sdk/client-ses");

// Set the AWS Region and config
const REGION = process.env.AWS_REGION;
const config = {
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
}

// Create an Amazon SES service client object.
const sesClient = new SESClient(config);

module.exports = { sesClient };