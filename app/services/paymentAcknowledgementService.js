const { Op } = require("sequelize");
const paymentStageModel = require("../models/paymentStageModel");
const partPaymentStage = require("../models/partPaymentStageModel");
const walletModel = require("../models/walletModel");
const projectModel = require("../models/projectModel");
const userModel = require("../models/userModel");
const emailTemplateUtils = require("../utils/emailTemplateUtils");
const sesEmailService = require("./emailService");
const { formatDate } = require("../utils/utils");

/**
 * Service for handling payment acknowledgement emails
 */
const paymentAcknowledgementService = {};

/**
 * Get payment stage details with related data
 * @param {Number} paymentStageId - ID of the payment stage
 * @returns {Object} - Payment stage details with related data
 */
paymentAcknowledgementService.getPaymentStageDetails = async (paymentStageId) => {
    try {
        // Get payment stage details
        const paymentStage = await paymentStageModel.findOne({
            where: { id: paymentStageId, isDeleted: { [Op.ne]: true } },
            include: [
                {
                    model: partPaymentStage,
                    attributes: ['id', 'referenceId', 'method', 'invoiceNo', 'amount'],
                    where: { isDeleted: { [Op.ne]: true } },
                    required: false
                }
            ]
        });

        if (!paymentStage) {
            throw new Error("Payment stage not found");
        }

        // Get wallet details
        const wallet = await walletModel.findOne({
            where: { id: paymentStage.walletId, isDeleted: { [Op.ne]: true } }
        });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        // Get project details
        const project = await projectModel.findOne({
            where: { id: wallet.projectId, isDeleted: { [Op.ne]: true } }
        });

        if (!project) {
            throw new Error("Project not found");
        }

        // Get user details
        const user = await userModel.findOne({
            where: { id: project.userId, isDeleted: { [Op.ne]: true } }
        });

        if (!user) {
            throw new Error("User not found");
        }

        return {
            paymentStage,
            wallet,
            project,
            user
        };
    } catch (error) {
        console.error("Error getting payment stage details:", error);
        throw error;
    }
};

/**
 * Get part payment details
 * @param {Number} partPaymentId - ID of the part payment
 * @returns {Object} - Part payment details with related data
 */
paymentAcknowledgementService.getPartPaymentDetails = async (partPaymentId) => {
    try {
        // Get part payment details
        const partPayment = await partPaymentStage.findOne({
            where: { id: partPaymentId, isDeleted: { [Op.ne]: true } }
        });

        if (!partPayment) {
            throw new Error("Part payment not found");
        }

        // Get payment stage details
        const paymentStage = await paymentStageModel.findOne({
            where: { id: partPayment.stageId, isDeleted: { [Op.ne]: true } }
        });

        if (!paymentStage) {
            throw new Error("Payment stage not found");
        }

        // Get wallet details
        const wallet = await walletModel.findOne({
            where: { id: paymentStage.walletId, isDeleted: { [Op.ne]: true } }
        });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        // Get project details
        const project = await projectModel.findOne({
            where: { id: wallet.projectId, isDeleted: { [Op.ne]: true } }
        });

        if (!project) {
            throw new Error("Project not found");
        }

        // Get user details
        const user = await userModel.findOne({
            where: { id: project.userId, isDeleted: { [Op.ne]: true } }
        });

        if (!user) {
            throw new Error("User not found");
        }

        return {
            partPayment,
            paymentStage,
            wallet,
            project,
            user
        };
    } catch (error) {
        console.error("Error getting part payment details:", error);
        throw error;
    }
};

/**
 * Send payment acknowledgement email
 * @param {Object} options - Options for sending the email
 * @param {Number} options.paymentStageId - ID of the payment stage (optional if partPaymentId is provided)
 * @param {Number} options.partPaymentId - ID of the part payment (optional if paymentStageId is provided)
 * @returns {Object} - Response from the email service
 */
paymentAcknowledgementService.sendPaymentAcknowledgementEmail = async (options) => {
    try {
        const { partPaymentId, comment } = options;

        if (!partPaymentId) {
            throw new Error("Either paymentStageId or partPaymentId must be provided");
        }

        let data;
        let paymentAmount;
        let paymentMethod;
        let transactionDate;
        let referenceId;

        // Get data based on whether we're dealing with a full payment stage or a part payment
        // if (paymentStageId) {
        //     data = await paymentAcknowledgementService.getPaymentStageDetails(paymentStageId);
        //     paymentAmount = data.paymentStage.paidAmount;
        //     paymentMethod = "Full Payment";
        //     transactionDate = formatDate(data.paymentStage.updatedAt);
        //     referenceId = `STAGE-${data.paymentStage.id}`;
        // } else {
        data = await paymentAcknowledgementService.getPartPaymentDetails(partPaymentId);
        paymentAmount = data.partPayment.amount;
        paymentMethod = data.partPayment.method || '-';
        if (data.partPayment.referenceId) {
            paymentMethod += ` (${data.partPayment.referenceId})`;
        }
        transactionDate = formatDate(data.partPayment.transactionDate);
        referenceId = data.partPayment.invoiceNo;
        // }

        // Calculate balance amount
        const balanceAmount = data.paymentStage.totalAmount - data.paymentStage.paidAmount;

        // Calculate total amount received for the stage
        const totalAmountReceived = data.paymentStage.paidAmount;

        // Generate project code
        const projectCode = data.user.uniqueId;

        // Prepare template data
        const templateData = {
            userName: data.user.name,
            stageName: data.paymentStage.name,
            paidAmount: paymentAmount.toLocaleString('en-IN'),
            totalAmountReceived: totalAmountReceived.toLocaleString('en-IN'),
            balanceAmount: balanceAmount.toLocaleString('en-IN'),
            paymentMethod: paymentMethod,
            transactionDate: transactionDate,
            projectCode: projectCode,
            projectName: data.project.name,
            projectLocation: data.project.location || 'N/A',
            paymentStatus: balanceAmount <= 0 ? 'Completed' : 'Partially Paid',
            comment: comment,
            invoiceNo: referenceId
        };

        // Generate email HTML
        const emailHtml = emailTemplateUtils.generatePaymentAcknowledgementTemplate(templateData);
        // Send email
        const emailSubject = `Payment Acknowledgement - ${data.project.name} - ${referenceId}`;
        const response = await sesEmailService.sendEmail(data.user.email, emailSubject, emailHtml);

        return response;
    } catch (error) {
        console.error("Error sending payment acknowledgement email:", error);
        throw error;
    }
};

module.exports = paymentAcknowledgementService; 