import WorkoutLog from '../models/WorkoutLog.js';

// @desc    Log a workout (weight/reps per set for an exercise)
// @route   POST /api/workout-logs
// @access  Private
export const createWorkoutLog = async (req, res) => {
  try {
    const { exerciseId, sets, notes } = req.body;

    if (!exerciseId || !sets || !Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({ message: 'Debes enviar exerciseId y al menos una serie (sets)' });
    }

    const log = await WorkoutLog.create({
      user: req.user._id,
      exercise: exerciseId,
      sets,
      notes,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the last workout log for a specific exercise (for the logged-in user)
// @route   GET /api/workout-logs/last/:exerciseId
// @access  Private
export const getLastLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({
      user: req.user._id,
      exercise: req.params.exerciseId,
    }).sort({ date: -1 });

    if (!log) {
      return res.status(404).json({ message: 'Sin registros previos' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workout history for an exercise (paginated)
// @route   GET /api/workout-logs/history/:exerciseId
// @access  Private
export const getExerciseHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = parseInt(req.query.page) || 1;

    const logs = await WorkoutLog.find({
      user: req.user._id,
      exercise: req.params.exerciseId,
    })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await WorkoutLog.countDocuments({
      user: req.user._id,
      exercise: req.params.exerciseId,
    });

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
