module.exports = function handler(request, response) {
  response.status(200).json({
    service: 'shopify-sync',
    status: 'placeholder',
    message: 'Shopify product catalog and checkout sync endpoint ready for future integration.',
    syncTargets: ['products', 'variants', 'collections', 'checkout_links'],
  });
};
