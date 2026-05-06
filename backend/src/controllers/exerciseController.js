import Exercise from '../models/Exercise.js';

// @desc    Get all exercises, optionally filtered by muscleGroup
// @route   GET /api/exercises?muscleGroup=Pecho
// @access  Private
export const getExercises = async (req, res) => {
  try {
    const filter = {};
    if (req.query.muscleGroup) {
      filter.muscleGroup = req.query.muscleGroup;
    }
    const exercises = await Exercise.find(filter).sort({ muscleGroup: 1, name: 1 });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
