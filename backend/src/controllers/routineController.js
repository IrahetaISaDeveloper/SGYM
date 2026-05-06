import Routine from '../models/Routine.js';

// @desc    Get my routine
// @route   GET /api/routines/me
// @access  Private
export const getMyRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOne({ user: req.user._id });
    if (!routine) {
      return res.status(404).json({ message: 'No tienes una rutina configurada' });
    }
    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save or update my routine
// @route   PUT /api/routines/me
// @access  Private
export const saveMyRoutine = async (req, res) => {
  try {
    const { weeklySchedule } = req.body;

    const routine = await Routine.findOneAndUpdate(
      { user: req.user._id },
      { weeklySchedule },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
