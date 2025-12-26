import express from 'express';
import { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask 
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for logged in user
// @access  Private
router.get('/', getTasks);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', createTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', deleteTask);

export default router;