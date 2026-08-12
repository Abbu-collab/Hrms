// server/controllers/salaryController.js

import Salary from '../models/Salary.js';

const populateEmployee = {
  path: 'employeeId',
  select: 'employee_code designation user_id department_id',
  populate: [
    { path: 'user_id', select: 'name email' },
    { path: 'department_id', select: 'departmentId departmentName' },
  ],
};

export const createSalary = async (req, res) => {
  try {
    const { employeeId, basicSalary, hra, allowances, bonus, deductions, effectiveFrom } = req.body;

    const salary = await Salary.create({
      employeeId,
      basicSalary,
      hra,
      allowances,
      bonus,
      deductions,
      effectiveFrom,
      isActive: true,
      createdBy: req.user?._id || null,
    });

    const populatedSalary = await Salary.findById(salary._id).populate(populateEmployee);

    return res.status(201).json({
      success: true,
      message: 'Salary structure created successfully',
      data: populatedSalary,
    });
  } catch (error) {
    console.error('CREATE SALARY ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create salary structure',
      error: error.message,
    });
  }
};

export const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({ isActive: true })
      .populate(populateEmployee)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch salary structures',
      error: error.message,
    });
  }
};

export const getSalaryByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salary = await Salary.findOne({ employeeId, isActive: true }).populate(populateEmployee);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'No active salary structure found for this employee',
      });
    }

    return res.status(200).json({ success: true, data: salary });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch salary structure',
      error: error.message,
    });
  }
};

export const getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id).populate(populateEmployee);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found',
      });
    }

    return res.status(200).json({ success: true, data: salary });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch salary structure',
      error: error.message,
    });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, basicSalary, hra, allowances, bonus, deductions, effectiveFrom } = req.body;

    const existingSalary = await Salary.findById(id);
    if (!existingSalary) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found',
      });
    }

    existingSalary.isActive = false;
    await existingSalary.save();

    const newSalary = await Salary.create({
      employeeId: employeeId || existingSalary.employeeId,
      basicSalary,
      hra,
      allowances,
      bonus,
      deductions,
      effectiveFrom,
      isActive: true,
      createdBy: req.user?._id || null,
    });

    const populatedNewSalary = await Salary.findById(newSalary._id).populate(populateEmployee);

    return res.status(200).json({
      success: true,
      message: 'Salary structure updated successfully',
      data: populatedNewSalary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update salary structure',
      error: error.message,
    });
  }
};

export const deactivateSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found',
      });
    }

    salary.isActive = false;
    await salary.save();

    return res.status(200).json({
      success: true,
      message: 'Salary structure deactivated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate salary structure',
      error: error.message,
    });
  }
};

export default {
  createSalary,
  getAllSalaries,
  getSalaryByEmployee,
  getSalaryById,
  updateSalary,
  deactivateSalary,
};
