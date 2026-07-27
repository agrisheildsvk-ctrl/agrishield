const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  owner_whatsapp: '9739230638'
};

const getSettings = async (req, res) => {
  try {
    const rows = await prisma.setting.findMany();
    const settings = { ...DEFAULT_SETTINGS };

    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body || {};
    const updated = {};

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== 'undefined' && value !== null) {
        const saved = await prisma.setting.upsert({
          where: { key: String(key) },
          update: { value: String(value) },
          create: { key: String(key), value: String(value) }
        });
        updated[saved.key] = saved.value;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: updated
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
