// import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses"; // ES Modules import
const { sesClient } = require("../../config/aws/ses/sesClientConfig");
const { SendTemplatedEmailCommand, SendEmailCommand, SendBulkTemplatedEmailCommand, CreateTemplateCommand, DeleteTemplateCommand } = require("@aws-sdk/client-ses")

const SOURCE_EMAIL = process.env.SES_SOURCE_EMAIL

let sesEmailService = {};


const generateBulkEmailParams = (users, defaultTemplateData, templateName) => {
    const params = {
        Source: "SSS <" + SOURCE_EMAIL + ">",
        Destinations: users.map((user) => ({
            Destination: { ToAddresses: [user.emailAddress] },
            ReplacementTemplateData: JSON.stringify({ name: user.firstName }),
        })),
        DefaultTemplateData: JSON.stringify(defaultTemplateData),
        Template: templateName
    };
    return params
}

/**
 * Function to send an Normal Email with subject and html/text body
 * @param {*} toEmail - Recipient Email
 * @param {*} subject - Email Subject
 * @param {*} htmlBody - Email body in html format
 * @param {*} textBody - Email body in text formal
 * @returns 
 */
sesEmailService.sendEmail = async (toAddress, subject, htmlBody, textBody = "") => {
    try {
        let params = {
            Destination: {
                //Enable this for sending cc address
                // CcAddresses: [
                //     /* more items */
                //   ],
                ToAddresses: [toAddress]
            },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: subject,
                },
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlBody,
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: textBody,
                    },
                }
            },
            Source: SOURCE_EMAIL,
            //Enable this for replay to address
            //   ReplyToAddresses: [
            //     /* more items */
            //   ],
        };

        const sendEmailCommand = new SendEmailCommand(params);
        const response = await sesClient.send(sendEmailCommand);
        return response
    } catch (error) {
        throw error
    }
}

sesEmailService.createEmailTemplate = async (templateName, subject, htmlBody, textBody) => {
    try {
        const params = {
            Template: {
                TemplateName: templateName,
                SubjectPart: subject,
                HtmlPart: htmlBody,
                TextPart: textBody,
            }
        }
        const createTemplateCommand = new CreateTemplateCommand(params)
        const response = await sesClient.send(createTemplateCommand);
        return response
    } catch (error) {
        throw error
    }
}

sesEmailService.deleteEmailTemplate = async (templateName) => {
    try {
        const params = {
            TemplateName: templateName
        }
        const command = new DeleteTemplateCommand(params);
        const response = await sesClient.send(command);
        return response
    } catch (error) {
        throw error
    }
}

/**
 * Function to send templated email configured from SES Template
 * @param {*} destinationAddressList - List of destination email address
 * @param {*} templateName - Name of the Template to send an email
 * @param {*} TemplateData - Template exchange variable data
 * @returns 
 */
sesEmailService.sendTemplatedEmail = async (destinationAddressList = [], templateName, TemplateData, Subject) => {
    try {
        let destinationAddress = {
            ToAddresses: destinationAddressList,
            //   CcAddresses: [   //Enable this for CC and BCC Address
            //     "STRING_VALUE",
            //   ],
            //   BccAddresses: [
            //     "STRING_VALUE",
            //   ],
        }
        let params = {
            Source: "SSS<" + SOURCE_EMAIL + ">",
            Destination: destinationAddress,
            ConfigurationSetName: "my-first-configuration-set",
            Template: templateName,
            TemplateData: TemplateData,
        };
        if (Subject) {
            params.Subject = Subject;
        }
        const command = new SendTemplatedEmailCommand(params);
        const response = await sesClient.send(command);
        return response;
    } catch (error) {
        throw error
    }
}

sesEmailService.sendBulkTemplatedEmail = async (users, templateName, TemplateData) => {
    try {
        const bulkEmailParams = generateBulkEmailParams(users, TemplateData, templateName)
        const command = new SendBulkTemplatedEmailCommand(bulkEmailParams);
        const response = await sesClient.send(command);
        return response;
    } catch (error) {
        throw error
    }
}


module.exports = sesEmailService