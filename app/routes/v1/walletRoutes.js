'use strict';
const { Joi } = require('../../utils/joiUtils');
const { TRANSACTION_TYPE } = require('../../utils/constants');
const walletController = require('../../controllers/walletController');

let routes = [
    {
        method: 'POST',
        path: '/v1/wallet/create',
        joiSchemaForSwagger: {

            body: {
                projectId: Joi.number().required().description('Enter the projectId'),
            },
            group: 'Wallet',
            description: 'Route to create wallet',
            model: 'createWallet',
        },
        auth: false,
        handler: walletController.createWallet
    },
    {
        method: 'POST',
        path: '/v1/wallet/add-money',
        joiSchemaForSwagger: {
            body: {
                walletId: Joi.number().required().description('Enter the walletId to add'),
                amount: Joi.number().required().description('Money to be  to wallet'),
            },
            group: 'Wallet',
            description: 'Route to add money to collector wallet',
            model: 'addMoneyToWallet',
        },
        auth: false,
        handler: walletController.addMoneyToWallet
    },
    {
        method: 'POST',
        path: '/v1/wallet/withdraw-money',
        joiSchemaForSwagger: {
            body: {
                walletId: Joi.number().required().description('Enter the walletI'),
                amount: Joi.number().required().description('Money to be  to withdrawn'),
            },
            group: 'Wallet',
            description: 'Route to withdrawn money',
            model: 'withdrawMoneyFromWallet',
        },
        auth: false,
        handler: walletController.withdrawMoneyFromWallet
    },
    {
        method: 'GET',
        path: '/v1/wallet',
        joiSchemaForSwagger: {
            query: {
                projectId: Joi.number().required().description('Enter the projectId'),
            },
            group: 'Wallet',
            description: 'Route to get wallet details by id',
            model: 'getWalletDetails',
        },
        auth: false,
        handler: walletController.getWalletDetails
    },
    {
        method: 'GET',
        path: '/v1/wallet/list',
        joiSchemaForSwagger: {
            query: {
                walletId: Joi.number().required().description('Enter the walletId'),
                transactionType: Joi.string().valid(...Object.values(TRANSACTION_TYPE)).description('transaction type')
            },
            group: 'Wallet',
            description: 'Route to get transaction history for collector and user ',
            model: 'getWalletDetails',
        },
        auth: false,
        handler: walletController.getTransactionList
    },
    // {
    //     method: 'GET',
    //     path: '/v1/wallet/quick-amounts',
    //     joiSchemaForSwagger: {

    //         group: 'Wallet',
    //         description: 'Route to get quick amount list based on collector country',
    //         model: 'getQuickAmountList',
    //     },
    //     auth: false,
    //     handler: walletController.getQuickAmountList
    // }
]

module.exports = routes;
