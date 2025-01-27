const path = require('path');

var development = require('./env/development');
var production = require('./env/production');
var staging = require('./env/staging');
var PLATFORM = process.env.PLATFORM || 'Backend Service';

var defaults = {
    PLATFORM: PLATFORM,
    ADMIN: {
        EMAIL: process.env.ADMIN_EMAIL || `admin.test@yopmail.com`,
        PASSWORD: process.env.ADMIN_PASSWORD || `Admin@123`,
        FIRST_NAME: 'ADMIN',
        LAST_NAME: 'ADMIN'
    },
    root: path.normalize(__dirname + '/../app'),
    environment: process.env.NODE_ENV || 'production',
    show: function () {
        console.log('environment: ' + this.environment);
    },
    ENV_STAGING: "staging",
    ENV_DEVELOPMENT: "development",
    ENV_PRODUCTION: "production",
    environment: process.env.NODE_ENV || 'development',

    DATABASE: {
        username: process.env.DB_USERNAME || "root",
        password:process.env.DB_PASSWORD || "akash123",
        database:process.env.DB_NAME || "backendDevDB",
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DIALECT || 'postgres',
        get URL() { return `${this.HOST}:${this.PORT}/${this.DB_NAME}` }
    },
    server: {
        PROTOCOL: process.env.SERVER_PROTOCOL || 'http',
        HOST: process.env.SERVER_HOST || '0.0.0.0',
        PORT: process.env.PORT || '4000',
        get URL() { return `${this.PROTOCOL}://${this.HOST}:${this.PORT}` }
    },

    SERVER_URL: process.env.SERVER_URL || 'http://localhost:4000',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',

    swagger: require('./swagger'),

    S3_BUCKET: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'access-key-id',
        secretAccessKey: process.env.AWS_SECRET_ACESS_KEY || 'secret-access-key',
        bucketName: process.env.S3_BUCKET_NAME || 'bucket-name'
    },
    AWS_CONFIG: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || `aws_access_key`,
        secretAccessKey: process.env.AWS_SECRET_ACESS_KEY || 'aws_secret_key',
        awsRegion: process.env.AWS_REGION || 'ohio',
        smsSender: process.env.SMS_SENDER || 'youcan'
    },
    PATH_TO_UPLOAD_FILES_ON_LOCAL: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL || '/uploads/files'
};

let currentEnvironment = process.env.NODE_ENV || 'production';

function myConfig(envConfig) {
    return { ...defaults, ...envConfig };
};

module.exports = {
    development: myConfig(development),
    production: myConfig(production),
    staging: myConfig(staging)
}[currentEnvironment];

