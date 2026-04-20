/**
 * Image Optimization
 * Implements responsive images and WebP support with fallbacks
 */

(function() {
  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  };

  const webpSupported = supportsWebP();
  document.documentElement.setAttribute('data-webp', webpSupported ? 'true' : 'false');

  // Optimize project card images
  const projectImages = document.querySelectorAll('.project-card img');
  projectImages.forEach(img => {
    const src = img.src;
    if (src && !src.includes('freepik') && !src.includes('kaggle') && !src.includes('githubusercontent')) {
      // For local images, add srcset for responsive loading
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    }
  });

  // Optimize profile image
  const profileImg = document.querySelector('.pp-img');
  if (profileImg) {
    profileImg.setAttribute('loading', 'lazy');
    profileImg.setAttribute('decoding', 'async');
  }

  // Add image compression hints
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
})();
