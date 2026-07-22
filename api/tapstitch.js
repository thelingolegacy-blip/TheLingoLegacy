module.exports = function handler(request, response) {
  response.status(200).json({
    service: 'tapstitch',
    status: 'placeholder',
    message: 'TapStitch customization intake endpoint ready for future integration.',
    accepts: ['custom_text', 'patch_id', 'garment_sku', 'thread_color'],
  });
};
