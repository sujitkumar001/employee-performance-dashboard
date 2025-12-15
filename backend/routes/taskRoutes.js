const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const path = require('path');

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  addTaskAttachment
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');


const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });


router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.post('/:id/comment', protect, addTaskComment);


router.post('/:id/attachment', protect, upload.single('file'), addTaskAttachment);

module.exports = router;