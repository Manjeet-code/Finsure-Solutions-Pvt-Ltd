import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, manager } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, manager, getAuditLogs);

export default router;
