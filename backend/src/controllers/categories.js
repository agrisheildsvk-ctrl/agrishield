const prisma = require('../config/database');

exports.index = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error: ' + error.message });
  }
};
