const { S3Client } = require("@aws-sdk/client-s3")

// Set the AWS Region and config
const REGION = process.env.AWS_REGION;
const config = {
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
}

// Create an Amazon S3 service client object.
const s3Client = new S3Client(config);

module.exports = { s3Client };