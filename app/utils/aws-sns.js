const AWS = require("aws-sdk");
const { AWS_CONFIG } = require("../../config/index");

// Configure AWS with your credentials and preferred region
AWS.config.update({
  accessKeyId: AWS_CONFIG.accessKeyId,
  secretAccessKey: AWS_CONFIG.secretAccessKey,
  region: AWS_CONFIG.awsRegion,
});

// Create a new SNS object
const sns = new AWS.SNS();

/**
 * function to sent sms via AWS-SNS
 * @param {receiver} phoneNumber
 * @param {content} SMS
 */
module.exports = async function sendSms(receiver, content) {
  try {
    let params = {
      Message: content,
      PhoneNumber: receiver,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
           DataType: 'String',
           StringValue: 'Transactional'
        }
      }
    };
    // Publish the message
    sns.publish(params, (err, msg) => {
      if (err) {
        console.error("Error sending a message", err);
      } else {
        console.log("Message sent successfully !!", msg);
      }
    });
  } catch (err) {
    console.log("ERROR", err.message);
    return "failed";
  }
  return "success";
};
