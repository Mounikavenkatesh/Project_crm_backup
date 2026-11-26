import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

const taskValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Title must be 2-150 characters'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid task priority'),
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Due date must be a valid ISO date'),
];

const statusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid task status'),
];

router.route('/')
  .get(getTasks)
  .post(validate(taskValidationRules), createTask);

router.route('/:id')
  .put(validate(taskValidationRules), updateTask)
  .delete(deleteTask);

router.patch('/:id/status', validate(statusValidation), updateTaskStatus);

export default router;
