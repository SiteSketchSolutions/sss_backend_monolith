const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const budgetAllocationModel = require("../models/budgetAllocationModel");
const projectModel = require("../models/projectModel");
const vendorModel = require("../models/vendorModel");
const { getPaginationResponse } = require("../utils/utils");

/**************************************************
 *********** Budget Allocation Controller *********
 **************************************************/
let budgetAllocationController = {};

/**
 * Function to create a budget allocation
 * @param {*} payload
 * @returns
 */
budgetAllocationController.createBudgetAllocation = async (payload) => {
    try {
        const { projectId, vendorId, amount, note, allocatedBy } = payload;

        // Check if the project exists
        const project = await projectModel.findOne({
            where: {
                id: projectId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!project) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Check if the vendor exists
        const vendor = await vendorModel.findOne({
            where: {
                id: vendorId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!vendor) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.VENDOR_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Get sum of already allocated budget for this project
        const allocatedBudgetSum = await budgetAllocationModel.sum('amount', {
            where: {
                projectId,
                isDeleted: { [Op.ne]: true }
            }
        }) || 0;

        // Check if the new allocation would exceed the project budget
        if (parseFloat(allocatedBudgetSum) + parseFloat(amount) > parseFloat(project.price)) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BUDGET_ALLOCATION_EXCEEDS_PROJECT_BUDGET,
                ERROR_TYPES.BAD_REQUEST
            );
        }

        // Create new budget allocation
        const budgetAllocation = await budgetAllocationModel.create({
            projectId,
            vendorId,
            amount,
            note,
            allocatedBy
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BUDGET_ALLOCATION_CREATED_SUCCESSFULLY
            ),
            {
                data: {
                    id: budgetAllocation.id
                }
            }
        );
    } catch (error) {
        console.error("Error in createBudgetAllocation:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update a budget allocation
 * @param {*} payload
 * @returns
 */
budgetAllocationController.updateBudgetAllocation = async (payload) => {
    try {
        const { budgetAllocationId, vendorId, amount, note } = payload;

        // Check if the budget allocation exists
        const budgetAllocation = await budgetAllocationModel.findOne({
            where: {
                id: budgetAllocationId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!budgetAllocation) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BUDGET_ALLOCATION_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // If changing vendor, check if the vendor exists
        if (vendorId && vendorId !== budgetAllocation.vendorId) {
            const vendor = await vendorModel.findOne({
                where: {
                    id: vendorId,
                    isDeleted: { [Op.ne]: true }
                }
            });

            if (!vendor) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.VENDOR_NOT_FOUND,
                    ERROR_TYPES.DATA_NOT_FOUND
                );
            }
        }

        // If changing amount, check if the new allocation would exceed the project budget
        if (amount && parseFloat(amount) !== parseFloat(budgetAllocation.amount)) {
            const project = await projectModel.findOne({
                where: {
                    id: budgetAllocation.projectId,
                    isDeleted: { [Op.ne]: true }
                }
            });

            // Get sum of already allocated budget for this project, excluding the current allocation
            const allocatedBudgetSum = await budgetAllocationModel.sum('amount', {
                where: {
                    projectId: budgetAllocation.projectId,
                    id: { [Op.ne]: budgetAllocationId },
                    isDeleted: { [Op.ne]: true }
                }
            }) || 0;

            if (parseFloat(allocatedBudgetSum) + parseFloat(amount) > parseFloat(project.price)) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.BUDGET_ALLOCATION_EXCEEDS_PROJECT_BUDGET,
                    ERROR_TYPES.BAD_REQUEST
                );
            }
        }

        // Prepare update payload
        const updatePayload = {};
        if (vendorId) updatePayload.vendorId = vendorId;
        if (amount) updatePayload.amount = amount;
        if (note !== undefined) updatePayload.note = note;

        // Update the budget allocation
        await budgetAllocationModel.update(updatePayload, {
            where: { id: budgetAllocationId }
        });

        // Get the updated allocation
        const updatedAllocation = await budgetAllocationModel.findOne({
            where: { id: budgetAllocationId },
            include: [
                {
                    model: projectModel,
                    attributes: ['id', 'name', 'price']
                }
            ]
        });

        // Calculate remaining budget
        const allocatedBudgetSum = await budgetAllocationModel.sum('amount', {
            where: {
                projectId: updatedAllocation.projectId,
                isDeleted: { [Op.ne]: true }
            }
        }) || 0;

        const remainingBudget = parseFloat(updatedAllocation.project.price) - parseFloat(allocatedBudgetSum);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BUDGET_ALLOCATION_UPDATED_SUCCESSFULLY
            ),
            {
                data: {
                    id: updatedAllocation.id
                }
            }
        );
    } catch (error) {
        console.error("Error in updateBudgetAllocation:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get budget allocation by ID
 * @param {*} payload
 * @returns
 */
budgetAllocationController.getBudgetAllocationById = async (payload) => {
    try {
        const { budgetAllocationId } = payload;

        const budgetAllocation = await budgetAllocationModel.findOne({
            where: {
                id: budgetAllocationId,
                isDeleted: { [Op.ne]: true }
            },
            include: [
                {
                    model: projectModel,
                    attributes: ['id', 'name', 'price'],
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        if (!budgetAllocation) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BUDGET_ALLOCATION_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Calculate remaining budget
        const allocatedBudgetSum = await budgetAllocationModel.sum('amount', {
            where: {
                projectId: budgetAllocation.projectId,
                isDeleted: { [Op.ne]: true }
            }
        }) || 0;

        const remainingBudget = parseFloat(budgetAllocation.project.price) - parseFloat(allocatedBudgetSum);

        // Get vendor details
        const vendor = await vendorModel.findOne({
            where: { id: budgetAllocation.vendorId },
            attributes: ['id', 'name']
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BUDGET_ALLOCATION_FETCHED_SUCCESSFULLY
            ),
            {
                data: {
                    id: budgetAllocation.id,
                    projectId: budgetAllocation.projectId,
                    projectName: budgetAllocation.project.name,
                    projectBudget: budgetAllocation.project.price,
                    vendorId: budgetAllocation.vendorId,
                    vendorName: vendor ? vendor.name : null,
                    amount: budgetAllocation.amount,
                    note: budgetAllocation.note,
                    allocatedBy: budgetAllocation.allocatedBy,
                    remainingBudget: remainingBudget
                }
            }
        );
    } catch (error) {
        console.error("Error in getBudgetAllocationById:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to list budget allocations by project ID
 * @param {*} payload
 * @returns
 */
budgetAllocationController.getBudgetAllocationsList = async (payload) => {
    try {
        const { projectId, page, size } = payload;

        // Check if the project exists
        if (projectId) {
            const project = await projectModel.findOne({
                where: {
                    id: projectId,
                    isDeleted: { [Op.ne]: true }
                }
            });

            if (!project) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.PROJECT_NOT_FOUND,
                    ERROR_TYPES.DATA_NOT_FOUND
                );
            }
        }

        const pageNo = page || PAGINATION.DEFAULT_PAGE;
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

        // Build where clause
        let whereClause = {
            isDeleted: { [Op.ne]: true }
        };

        if (projectId) {
            whereClause.projectId = projectId;
        }

        // Find budget allocations
        const { count, rows } = await budgetAllocationModel.findAndCountAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
            limit: pageLimit,
            offset: (pageNo - 1) * pageLimit,
            include: [
                {
                    model: projectModel,
                    attributes: ['id', 'name', 'price'],
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        // Get vendor details for each allocation
        const vendorIds = rows.map(allocation => allocation.vendorId);
        const vendors = await vendorModel.findAll({
            where: {
                id: { [Op.in]: vendorIds },
                isDeleted: { [Op.ne]: true }
            },
            attributes: ['id', 'name']
        });

        const vendorMap = vendors.reduce((map, vendor) => {
            map[vendor.id] = vendor;
            return map;
        }, {});

        // Calculate total allocated and remaining budget for each project
        const projectIds = [...new Set(rows.map(allocation => allocation.projectId))];
        const projectAllocations = {};

        for (const id of projectIds) {
            const totalAllocated = await budgetAllocationModel.sum('amount', {
                where: {
                    projectId: id,
                    isDeleted: { [Op.ne]: true }
                }
            }) || 0;

            const project = await projectModel.findOne({
                where: { id },
                attributes: ['price']
            });

            projectAllocations[id] = {
                totalAllocated,
                remainingBudget: parseFloat(project.price) - parseFloat(totalAllocated)
            };
        }

        // Format the response
        const formattedRows = rows.map(allocation => ({
            id: allocation.id,
            projectId: allocation.projectId,
            projectName: allocation.project.name,
            projectBudget: allocation.project.price,
            vendorId: allocation.vendorId,
            vendorName: vendorMap[allocation.vendorId] ? vendorMap[allocation.vendorId].name : null,
            amount: allocation.amount,
            note: allocation.note,
            allocatedBy: allocation.allocatedBy
        }));

        // Add project summary to the response
        const projectSummary = projectIds.map(id => {
            const projectData = rows.find(r => r.projectId === id).project;
            return {
                projectId: id,
                projectName: projectData.name,
                totalBudget: projectData.price,
                totalAllocated: projectAllocations[id].totalAllocated,
                remainingBudget: projectAllocations[id].remainingBudget
            };
        });

        const paginationData = { count, pageNo, pageLimit, rows: formattedRows };
        const formattedResponse = getPaginationResponse(paginationData);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BUDGET_ALLOCATION_LIST_FETCHED_SUCCESSFULLY
            ),
            formattedResponse
        );
    } catch (error) {
        console.error("Error in getBudgetAllocationsList:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete a budget allocation
 * @param {*} payload
 * @returns
 */
budgetAllocationController.deleteBudgetAllocation = async (payload) => {
    try {
        const { budgetAllocationId } = payload;

        // Check if the budget allocation exists
        const budgetAllocation = await budgetAllocationModel.findOne({
            where: {
                id: budgetAllocationId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!budgetAllocation) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BUDGET_ALLOCATION_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Delete the budget allocation (soft delete)
        await budgetAllocationModel.update(
            { isDeleted: true },
            { where: { id: budgetAllocationId } }
        );

        return HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.BUDGET_ALLOCATION_DELETED_SUCCESSFULLY
        );
    } catch (error) {
        console.error("Error in deleteBudgetAllocation:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get project budget summary
 * @param {*} payload
 * @returns
 */
budgetAllocationController.getProjectBudgetSummary = async (payload) => {
    try {
        const { projectId } = payload;

        // Check if the project exists
        const project = await projectModel.findOne({
            where: {
                id: projectId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!project) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Get all allocations for this project
        const allocations = await budgetAllocationModel.findAll({
            where: {
                projectId,
                isDeleted: { [Op.ne]: true }
            },
            include: [
                {
                    model: projectModel,
                    attributes: ['id', 'name', 'price']
                }
            ]
        });

        // Get vendor details for each allocation
        const vendorIds = allocations.map(allocation => allocation.vendorId);
        const vendors = await vendorModel.findAll({
            where: {
                id: { [Op.in]: vendorIds },
                isDeleted: { [Op.ne]: true }
            },
            attributes: ['id', 'name']
        });

        const vendorMap = vendors.reduce((map, vendor) => {
            map[vendor.id] = vendor;
            return map;
        }, {});

        // Calculate total allocated budget
        const totalAllocatedBudget = allocations.reduce((sum, allocation) => {
            return sum + parseFloat(allocation.amount);
        }, 0);

        // Format allocations
        const formattedAllocations = allocations.map(allocation => ({
            id: allocation.id,
            vendorId: allocation.vendorId,
            vendorName: vendorMap[allocation.vendorId] ? vendorMap[allocation.vendorId].name : null,
            amount: allocation.amount,
            note: allocation.note,
            allocatedBy: allocation.allocatedBy,
            createdAt: allocation.createdAt,
            updatedAt: allocation.updatedAt
        }));

        // Group allocations by vendor
        const vendorAllocations = {};
        formattedAllocations.forEach(allocation => {
            const vendorId = allocation.vendorId;
            if (!vendorAllocations[vendorId]) {
                vendorAllocations[vendorId] = {
                    vendorId,
                    vendorName: allocation.vendorName,
                    totalAmount: 0,
                    allocations: []
                };
            }
            vendorAllocations[vendorId].totalAmount += parseFloat(allocation.amount);
            vendorAllocations[vendorId].allocations.push(allocation);
        });

        // Prepare summary
        const summary = {
            projectId: project.id,
            projectName: project.name,
            totalBudget: parseFloat(project.price),
            totalAllocated: totalAllocatedBudget,
            remainingBudget: parseFloat(project.price) - totalAllocatedBudget,
            allocations: Object.values(vendorAllocations),
            allocationPercentage: ((totalAllocatedBudget / parseFloat(project.price)) * 100).toFixed(2)
        };

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_BUDGET_SUMMARY_FETCHED_SUCCESSFULLY
            ),
            { data: summary }
        );
    } catch (error) {
        console.error("Error in getProjectBudgetSummary:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = budgetAllocationController; 
