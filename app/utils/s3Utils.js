const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../../config/aws/s3/s3ClientConfig");

let s3Utils = {}

s3Utils.generatePresignedUrl = async (bucketName, objectKey, fileType, expirationTimeInSeconds = 3600) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            ContentType: fileType
        });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationTimeInSeconds });
        return signedUrl;
    } catch (error) {
        throw error
    }

}
module.exports = s3Utils
