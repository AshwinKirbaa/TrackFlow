const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

const FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => f in body).map((f) => [f, body[f] === '' ? undefined : body[f]]));
const notify = (req, event, payload) => req.app.get('io').to(`user:${req.user._id}`).emit(event, payload);

// Read: only the logged-in user's tasks (authorization by ownership)
router.get('/', async (req, res) => {
  const { status, q } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (q) filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Task.find(filter).sort({ createdAt: -1 }));
});

router.post('/', async (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ message: 'Title is required.' });
  const task = await Task.create({ ...pick(req.body), user: req.user._id });
  notify(req, 'task:created', task);
  res.status(201).json(task);
});

router.put('/:id', async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, pick(req.body), { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  notify(req, 'task:updated', task);
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  notify(req, 'task:deleted', { _id: task._id });
  res.json({ message: 'Task deleted.' });
});

module.exports = router;
