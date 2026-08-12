/**
 * Payroll and Salary domain constants.
 * Note: Status values MUST strictly match the MongoDB enum ('Generated', 'Paid').
 */

export const PAYROLL_STATUS = {
  GENERATED: 'Generated',
  PAID: 'Paid',
};

export const MONTH_NAMES = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const getMonthName = (monthNumber) => {
  const monthObj = MONTH_NAMES.find((m) => m.value === Number(monthNumber));
  return monthObj ? monthObj.label : `Month ${monthNumber}`;
};

export const YEARS_LIST = Array.from({ length: 11 }, (_, i) => 2020 + i);

/**
 * Converts a populated employeeId object (from Salary/Payroll API) into
 * display-friendly pieces: code, name, department, designation, label.
 *
 * Handles both:
 *  - Populated: { _id, employee_code, designation, user_id: { name }, department_id: { departmentName } }
 *  - Raw string ObjectId (fallback)
 *
 * @param {object|string} emp - The employeeId field from a salary/payroll document
 * @returns {{ code: string, name: string, dept: string, desig: string, label: string, rawId: string }}
 */
export const getEmployeeDisplay = (emp, snapshot = null) => {
  // If first argument is a payroll record object containing employeeSnapshot & employeeId
  if (emp && typeof emp === 'object' && (emp.employeeSnapshot || emp.employeeId !== undefined)) {
    if (emp.employeeSnapshot && (!emp.employeeId || typeof emp.employeeId === 'string' || !emp.employeeId?.employee_code)) {
      snapshot = emp.employeeSnapshot;
    }
    if (emp.employeeId !== undefined) {
      emp = emp.employeeId;
    }
  }

  let rawId = '';
  let code = '';
  let name = '';
  let dept = '';
  let desig = '';

  if (typeof emp === 'object' && emp !== null) {
    rawId = emp._id ? String(emp._id) : '';
    code = emp.employee_code || '';
    name = (emp.user_id && emp.user_id.name) ? emp.user_id.name : '';
    dept = (emp.department_id && emp.department_id.departmentName) ? emp.department_id.departmentName : '';
    desig = emp.designation || '';
  } else if (typeof emp === 'string') {
    rawId = emp;
  }

  // Fallback to snapshot if code or name is missing (e.g. employee deleted)
  if (snapshot && typeof snapshot === 'object') {
    if (!code && snapshot.employeeCode) code = snapshot.employeeCode;
    if (!name && snapshot.fullName) name = snapshot.fullName;
    if (!dept && snapshot.department) dept = snapshot.department;
    if (!desig && snapshot.designation) desig = snapshot.designation;
  }

  let label = '';
  if (code && name) {
    label = `${code} - ${name}`;
  } else if (code) {
    label = code;
  } else if (name) {
    label = name;
  } else {
    label = rawId || '-';
  }

  return { code, name, dept, desig, label, rawId };
};

/**
 * Build a dropdown label from an employee object (for select options).
 * E.g.: "EMP1003 - KANCHI SATHWIKA"
 *
 * @param {object} emp - Employee object from /api/employees response
 * @returns {string}
 */
export const getEmployeeOptionLabel = (emp) => {
  if (!emp) return '';
  const code = emp.employee_code || '';
  const name = (emp.user_id && emp.user_id.name) ? emp.user_id.name : (emp.name || '');
  if (code && name) return `${code} - ${name}`;
  if (code) return code;
  if (name) return name;
  return String(emp._id || '');
};
