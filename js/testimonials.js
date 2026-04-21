/**
 * Testimonials Carousel with Smooth Scrolling
 * Handles navigation, auto-scroll, and dot indicators
 */

(function() {
  const scrollContainer = document.querySelector('.testimonials-scroll');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.querySelector('.testimonial-dots');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');

  if (!scrollContainer || !cards.length) return;

  let currentIndex = 0;
  let isScrolling = false;
  let autoScrollInterval;

  // Create dot indicators
  function createDots() {
    cards.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('testimonial-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => scrollToCard(index));
      dotsContainer.appendChild(dot);
    });
  }

  // Update active dot
  function updateDots() {
    const dots = document.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Scroll to specific card
  function scrollToCard(index, smooth = true) {
    if (isScrolling || index < 0 || index >= cards.length) return;
    
    isScrolling = true;
    currentIndex = index;
    
    const card = cards[index];
    const scrollLeft = card.offsetLeft - (scrollContainer.offsetWidth / 2) + (card.offsetWidth / 2);
    
    scrollContainer.scrollTo({
      left: scrollLeft,
      behavior: smooth ? 'smooth' : 'auto'
    });

    updateDots();
    
    setTimeout(() => {
      isScrolling = false;
    }, 600);
  }

  // Navigate to previous card
  function scrollPrev() {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
    scrollToCard(newIndex);
    resetAutoScroll();
  }

  // Navigate to next card
  function scrollNext() {
    const newIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
    scrollToCard(newIndex);
    resetAutoScroll();
  }

  // Detect scroll position and update current index
  function handleScroll() {
    if (isScrolling) return;

    const scrollLeft = scrollContainer.scrollLeft;
    const cardWidth = cards[0].offsetWidth;
    const gap = 40; // Match CSS gap
    
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const containerCenter = scrollLeft + (scrollContainer.offsetWidth / 2);
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== currentIndex) {
      currentIndex = closestIndex;
      updateDots();
    }
  }

  // Auto-scroll functionality
  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      scrollNext();
    }, 5000); // Change card every 5 seconds
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  // Keyboard navigation
  function handleKeyboard(e) {
    if (e.key === 'ArrowLeft') {
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      scrollNext();
    }
  }

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    stopAutoScroll();
  }

  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
    resetAutoScroll();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        scrollNext();
      } else {
        scrollPrev();
      }
    }
  }

  // Intersection Observer for animations
  function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, {
      threshold: 0.2
    });

    cards.forEach(card => {
      observer.observe(card);
    });
  }

  // Mouse wheel horizontal scroll
  function handleWheel(e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
      stopAutoScroll();
      
      // Restart auto-scroll after user stops scrolling
      clearTimeout(scrollContainer.wheelTimeout);
      scrollContainer.wheelTimeout = setTimeout(() => {
        startAutoScroll();
      }, 2000);
    }
  }

  // Initialize
  function init() {
    createDots();
    setupIntersectionObserver();
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', scrollPrev);
    if (nextBtn) nextBtn.addEventListener('click', scrollNext);
    
    scrollContainer.addEventListener('scroll', handleScroll);
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    document.addEventListener('keydown', handleKeyboard);

    // Pause auto-scroll on hover
    scrollContainer.addEventListener('mouseenter', stopAutoScroll);
    scrollContainer.addEventListener('mouseleave', startAutoScroll);

    // Start auto-scroll
    startAutoScroll();

    // Initial scroll to center first card
    setTimeout(() => {
      scrollToCard(0, false);
    }, 100);
  }

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopAutoScroll();
  });

})();
