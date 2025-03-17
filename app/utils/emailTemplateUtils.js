const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

/**
 * Utility functions for generating email templates
 */
const emailTemplateUtils = {};

/**
 * Generate payment acknowledgement email template with dynamic data
 * @param {Object} data - Data to populate the template with
 * @returns {String} - HTML content of the email
 */
emailTemplateUtils.generatePaymentAcknowledgementTemplate = (data) => {
    try {
        // Read the template file
        const templatePath = path.join(__dirname, '../templates/email/paymentAcknowledgement.html');
        const templateSource = fs.readFileSync(templatePath, 'utf-8');

        // Compile the template with Handlebars
        const template = handlebars.compile(templateSource);

        // Default values for optional fields
        const defaultData = {
            contactName: 'Hemanth H',
            contactRole: 'Project Coordinator',
            contactPhone: '+91 94821 50598',
            contactEmail: 'info@sssconstructions.in',
            companyAddress: '#123, Premium Towers, Bengaluru - 560001',
            paymentStatus: 'Completed',
            projectName: 'SSS Project',
            invoiceNo: `INV-${Date.now()}`
        };

        // Merge provided data with defaults
        const mergedData = { ...defaultData, ...data };

        // Return the compiled HTML
        return template(mergedData);
    } catch (error) {
        console.error('Error generating payment acknowledgement template:', error);
        throw error;
    }
};

module.exports = emailTemplateUtils; 