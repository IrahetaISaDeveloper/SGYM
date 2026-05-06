import Machine from '../models/Machine.js';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
export const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find({});
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a machine
// @route   POST /api/machines
// @access  Private/Admin/Staff
export const createMachine = async (req, res) => {
  try {
    const { internalCode, name, category, status } = req.body;

    const machineExists = await Machine.findOne({ internalCode });
    if (machineExists) {
      return res.status(400).json({ message: 'Máquina con este código ya existe' });
    }

    const machine = await Machine.create({
      internalCode,
      name,
      category,
      status: status || 'Operativa',
    });

    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a machine as damaged
// @route   PUT /api/machines/:id/report
// @access  Private
export const reportMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (machine) {
      machine.status = 'Dañada';
      await machine.save();
      res.json({ message: 'Máquina reportada como dañada', machine });
    } else {
      res.status(404).json({ message: 'Máquina no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
