const whatsappService = require('../services/whatsappService');

const resendWhatsAppNotification = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const result = await whatsappService.retryOrderNotification(orderId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'WhatsApp notification sent successfully',
        whatsapp_status: result.whatsapp_status,
        details: result.result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend WhatsApp notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in resendWhatsAppNotification:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending WhatsApp notification',
      error: error.message
    });
  }
};

module.exports = {
  resendWhatsAppNotification
};
