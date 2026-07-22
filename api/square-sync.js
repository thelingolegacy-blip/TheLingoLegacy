module.exports = function handler(request, response) {
  response.status(200).json({
    service: 'square-sync',
    status: 'placeholder',
    message: 'Square POS and inventory sync endpoint ready for future integration.',
    syncTargets: ['inventory_counts', 'locations', 'orders', 'sku_mapping'],
  });
};
