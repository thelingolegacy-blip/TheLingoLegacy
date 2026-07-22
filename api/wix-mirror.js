module.exports = function handler(request, response) {
  response.status(200).json({
    service: 'wix-mirror',
    status: 'placeholder',
    message: 'Wix legacy storefront mirror endpoint ready for future integration.',
    syncTargets: ['pages', 'product_mirror', 'legacy_redirects', 'content_blocks'],
  });
};
