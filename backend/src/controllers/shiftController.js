import Shift from '../models/Shift.js';

// @desc    Open a new cash shift
// @route   POST /api/shifts/open
// @access  Private (Staff/Admin)
export const openShift = async (req, res) => {
  try {
    const { initialCash } = req.body;

    // Check if the current user already has an active shift
    const existingShift = await Shift.findOne({
      staffUser: req.user._id,
      status: 'Abierto',
    });

    if (existingShift) {
      return res.status(400).json({
        message: 'Ya tienes un turno de caja abierto.',
      });
    }

    const newShift = new Shift({
      staffUser: req.user._id,
      initialCash: Number(initialCash) || 0,
      status: 'Abierto',
      openedAt: new Date(),
      totalSales: 0,
      sales: [],
    });

    await newShift.save();

    res.status(201).json(newShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close the active cash shift
// @route   POST /api/shifts/close
// @access  Private (Staff/Admin)
export const closeShift = async (req, res) => {
  try {
    const activeShift = await Shift.findOne({
      staffUser: req.user._id,
      status: 'Abierto',
    });

    if (!activeShift) {
      return res.status(400).json({
        message: 'No se encontró ningún turno de caja activo para cerrar.',
      });
    }

    activeShift.status = 'Cerrado';
    activeShift.closedAt = new Date();

    await activeShift.save();

    res.json(activeShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the active cash shift for the current user
// @route   GET /api/shifts/active
// @access  Private (Staff/Admin)
export const getActiveShift = async (req, res) => {
  try {
    const activeShift = await Shift.findOne({
      staffUser: req.user._id,
      status: 'Abierto',
    });

    res.json(activeShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new cash sale in the active shift
// @route   POST /api/shifts/sale
// @access  Private (Staff/Admin)
export const registerSale = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: 'El carrito de compras no puede estar vacío.',
      });
    }

    const activeShift = await Shift.findOne({
      staffUser: req.user._id,
      status: 'Abierto',
    });

    if (!activeShift) {
      return res.status(400).json({
        message: 'Debes abrir un turno de caja antes de registrar ventas.',
      });
    }

    // Calculate total
    const total = products.reduce((sum, item) => {
      return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
    }, 0);

    const sale = {
      products: products.map(item => ({
        name: item.name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      })),
      total,
      timestamp: new Date(),
    };

    activeShift.sales.push(sale);
    activeShift.totalSales += total;

    await activeShift.save();

    res.status(201).json({
      message: 'Venta registrada exitosamente',
      shift: activeShift,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
