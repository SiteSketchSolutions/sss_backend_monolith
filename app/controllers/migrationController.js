const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const siteUpdateModel = require("../models/siteUpdateModel");
const projectModel = require("../models/projectModel");

/**************************************************
 ************ Migration Controller ***************
 **************************************************/
let migrationController = {};

/**
 * Function to migrate image to images array
 * @param {*} payload 
 * @returns 
 */
migrationController.migrateImageToImages = async (payload) => {
    try {
        const { secret, modelType } = payload;

        // Check secret key
        if (secret !== 'sss_migration_secret') {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.MIGRATION_UNAUTHORIZED,
                ERROR_TYPES.UNAUTHORIZED
            );
        }

        let migrationResults = {
            success: true,
            totalRecords: 0,
            migratedRecords: 0,
            skippedRecords: 0,
            errors: [],
            details: []
        };

        // Function to handle migration for a specific model
        const migrateModel = async (model, modelName) => {
            try {
                // Find all records with an image field value
                const records = await model.findAll({
                    where: {
                        // isDeleted: { [Op.ne]: true },
                        image: { [Op.ne]: null }
                    }
                });

                migrationResults.totalRecords += records.length;

                console.log(migrationResults, "migrationResults==>");
                // Process each record
                for (const record of records) {
                    try {
                        // Get current image and images values
                        const currentImage = record.image;
                        let currentImages = record.images || [];

                        // Ignore if image is empty/null or already an array
                        if (!currentImage || Array.isArray(currentImage)) {
                            migrationResults.skippedRecords++;
                            migrationResults.details.push({
                                modelName,
                                recordId: record.id,
                                status: 'skipped',
                                reason: !currentImage ? 'No image field' : 'Image is already an array'
                            });
                            continue;
                        }

                        // If images field exists but isn't an array, make it one
                        if (!Array.isArray(currentImages)) {
                            currentImages = [];
                        }

                        // Check if the image is already in the images array
                        if (!currentImages.includes(currentImage)) {
                            // Add image to images array
                            currentImages.push(currentImage);

                            // Update the record
                            await model.update(
                                { images: currentImages },
                                { where: { id: record.id } }
                            );

                            migrationResults.migratedRecords++;
                            migrationResults.details.push({
                                modelName,
                                recordId: record.id,
                                status: 'migrated',
                                from: currentImage,
                                to: currentImages
                            });
                        } else {
                            migrationResults.skippedRecords++;
                            migrationResults.details.push({
                                modelName,
                                recordId: record.id,
                                status: 'skipped',
                                reason: 'Image already in images array'
                            });
                        }
                    } catch (recordError) {
                        migrationResults.errors.push({
                            modelName,
                            recordId: record.id,
                            error: recordError.message
                        });
                    }
                }
            } catch (modelError) {
                migrationResults.errors.push({
                    modelName,
                    error: modelError.message
                });
            }
        };

        // Determine which models to migrate based on modelType
        if (!modelType || modelType === 'all' || modelType === 'siteUpdate') {
            await migrateModel(siteUpdateModel, 'SiteUpdate');
        }

        if (!modelType || modelType === 'all' || modelType === 'project') {
            await migrateModel(projectModel, 'Project');
        }

        // Set success flag to false if there were errors
        if (migrationResults.errors.length > 0) {
            migrationResults.success = false;
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.MIGRATION_COMPLETED_SUCCESSFULLY
            ),
            { data: migrationResults }
        );
    } catch (error) {
        console.error("Error in migrateImageToImages:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || MESSAGES.MIGRATION_FAILED,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = migrationController; 
