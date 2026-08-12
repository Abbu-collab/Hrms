// server/routes/payrollRoutes.js

import express from 'express';
import {
  generatePayroll,
  getAllPayrolls,
  getPayrollsByEmployee,
  getPayrollById,
  markPayrollAsPaid,
  downloadPayrollPDF,
} from '../controllers/payrollController.js';
import { validateGeneratePayroll } from '../validations/payrollValidation.js';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Admin-only write operations ─────────────────────────────────────────────
router.post('/generate',
  verifyToken,
  authorizeRoles('Admin'),
  validateGeneratePayroll,
  generatePayroll
);

router.patch('/:id/mark-paid',
  verifyToken,
  authorizeRoles('Admin'),
  markPayrollAsPaid
);

// ── Admin + HR Manager read operations ──────────────────────────────────────
router.get('/',
  verifyToken,
  authorizeRoles('Admin', 'HR'),
  getAllPayrolls
);

router.get('/employee/:employeeId',
  verifyToken,
  authorizeRoles('Admin', 'HR'),
  getPayrollsByEmployee
);

router.get('/:id/download',
  verifyToken,
  authorizeRoles('Admin', 'HR'),
  downloadPayrollPDF
);

router.get('/:id',
  verifyToken,
  authorizeRoles('Admin', 'HR'),
  getPayrollById
);

export default router;