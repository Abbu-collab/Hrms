import Department from "../models/Department.js";

// Create Department
export const createDepartmentService = async (departmentData) => {

    // Check if departmentId or departmentName already exists
    const existingDepartment = await Department.findOne({
        $or: [
            { departmentId: departmentData.departmentId },
            { departmentName: departmentData.departmentName }
        ]
    });

    if (existingDepartment) {
        throw new Error("Department already exists");
    }

    return await Department.create(departmentData);
};

// Get All Departments
export const getAllDepartmentsService = async () => {
    return await Department.find().sort({ createdAt: -1 });
};

// Get Active Departments (public, minimal fields - used by Register page dropdown)
export const getPublicDepartmentsService = async () => {
    return await Department.find({ status: "Active" })
        .select("departmentId departmentName")
        .sort({ departmentName: 1 });
};

// Get Department By ID
export const getDepartmentByIdService = async (id) => {
    return await Department.findById(id);
};

// Update Department
export const updateDepartmentService = async (id, departmentData) => {
    return await Department.findByIdAndUpdate(
        id,
        departmentData,
        {
            returnDocument:"after",
            runValidators: true,
        }
    );
};

// Delete Department
export const deleteDepartmentService = async (id) => {
    return await Department.findByIdAndDelete(id);
};