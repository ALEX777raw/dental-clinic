/**
 * ============================================
 * HEALTHY SMILE DENTISTRY - TESTIMONIALS SLIDER
 * Version: 1.0.0
 * ============================================
 */

(function() {
    'use strict';

    /**
     * Testimonials Slider Class
     */
    class TestimonialsSlider {
        constructor(options = {}) {
            // Default options
            this.options = {
                containerSelector: '#testimonialsSlider',
                trackSelector: '.testimonials-track',
                cardSelector: '.testimonial-card',
                prevBtnSelector: '#sliderPrev',
                nextBtnSelector: '#sliderNext',
                dotsContainerSelector: '#sliderDots',
                autoplay: true,
                autoplayInterval: 5000,
                slidesToShow: 3,
                slidesToScroll: 1,
                responsive: [
                    {
                        breakpoint: 991,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 767,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ],
                ...options
            };

            // DOM Elements
            this.container = document.querySelector(this.options.containerSelector);
            if (!this.container) return;

            this.track = this.container.querySelector(this.options.trackSelector);
            this.cards = this.container.querySelectorAll(this.options.cardSelector);
            this.prevBtn = document.querySelector(this.options.prevBtnSelector);
            this.nextBtn = document.querySelector(this.options.nextBtnSelector);
            this.dotsContainer = document.querySelector(this.options.dotsContainerSelector);

            // State
            this.currentIndex = 0;
            this.slidesToShow = this.options.slidesToShow;
            this.slidesToScroll = this.options.slidesToScroll;
            this.totalSlides = this.cards.length;
            this.autoplayTimer = null;
            this.isAnimating = false;
            this.touchStartX = 0;
            this.touchEndX = 0;

            // Initialize
            this.init();
        }

        /**
         * Initialize Slider
         */
        init() {
            if (!this.track || !this.cards.length) return;

            this.setupResponsive();
            this.setupSlider();
            this.createDots();
            this.setupEventListeners();
            this.updateSlider();

            if (this.options.autoplay) {
                this.startAutoplay();
            }
        }

        /**
         * Setup Responsive Breakpoints
         */
        setupResponsive() {
            const windowWidth = window.innerWidth;

            // Reset to default
            this.slidesToShow = this.options.slidesToShow;
            this.slidesToScroll = this.options.slidesToScroll;

            // Apply responsive settings
            if (this.options.responsive) {
                this.options.responsive.forEach(item => {
                    if (windowWidth <= item.breakpoint) {
                        this.slidesToShow = item.settings.slidesToShow;
                        this.slidesToScroll = item.settings.slidesToScroll;
                    }
                });
            }

            // Ensure current index is valid
            const maxIndex = Math.max(0, this.totalSlides - this.slidesToShow);
            if (this.currentIndex > maxIndex) {
                this.currentIndex = maxIndex;
            }
        }

        /**
         * Setup Slider Dimensions
         */
        setupSlider() {
            const cardWidth = 100 / this.slidesToShow;

            this.cards.forEach(card => {
                card.style.flex = `0 0 calc(${cardWidth}% - 1.5rem)`;
                card.style.marginLeft = '0.75rem';
                card.style.marginRight = '0.75rem';
            });
        }

        /**
         * Create Navigation Dots
         */
        createDots() {
            if (!this.dotsContainer) return;

            this.dotsContainer.innerHTML = '';
            const totalDots = Math.ceil((this.totalSlides - this.slidesToShow + 1) / this.slidesToScroll);

            for (let i = 0; i < Math.max(1, totalDots); i++) {
                const dot = document.createElement('button');
                dot.className = 'slider-dot';
                dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
                dot.setAttribute('data-index', i * this.slidesToScroll);

                dot.addEventListener('click', () => {
                    this.goToSlide(i * this.slidesToScroll);
                });

                this.dotsContainer.appendChild(dot);
            }

            this.dots = this.dotsContainer.querySelectorAll('.slider-dot');
        }

        /**
         * Setup Event Listeners
         */
        setupEventListeners() {
            // Previous button
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                });
            }

            // Next button
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                });
            }

            // Touch events
            this.container.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.stopAutoplay();
            }, { passive: true });

            this.container.addEventListener('touchmove', (e) => {
                this.touchEndX = e.touches[0].clientX;
            }, { passive: true });

            this.container.addEventListener('touchend', () => {
                this.handleSwipe();
                if (this.options.autoplay) {
                    this.startAutoplay();
                }
            });

            // Mouse drag events
            let isDragging = false;
            let startX = 0;

            this.container.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                this.stopAutoplay();
                this.container.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
            });

            document.addEventListener('mouseup', (e) => {
                if (!isDragging) return;

                isDragging = false;
                this.container.style.cursor = 'grab';
                const diff = startX - e.clientX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }

                if (this.options.autoplay) {
                    this.startAutoplay();
                }
            });

            // Pause autoplay on hover
            this.container.addEventListener('mouseenter', () => {
                this.stopAutoplay();
            });

            this.container.addEventListener('mouseleave', () => {
                if (this.options.autoplay) {
                    this.startAutoplay();
                }
            });

            // Keyboard navigation
            this.container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            });

            // Window resize
            window.addEventListener('resize', this.debounce(() => {
                this.setupResponsive();
                this.setupSlider();
                this.createDots();
                this.updateSlider();
            }, 250));

            // Visibility change (pause autoplay when tab is hidden)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAutoplay();
                } else if (this.options.autoplay) {
                    this.startAutoplay();
                }
            });
        }

        /**
         * Handle Touch Swipe
         */
        handleSwipe() {
            const diff = this.touchStartX - this.touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }

        /**
         * Go to Specific Slide
         */
        goToSlide(index) {
            if (this.isAnimating) return;

            const maxIndex = Math.max(0, this.totalSlides - this.slidesToShow);
            this.currentIndex = Math.max(0, Math.min(index, maxIndex));

            this.updateSlider();
        }

        /**
         * Go to Next Slide
         */
        nextSlide() {
            if (this.isAnimating) return;

            const maxIndex = this.totalSlides - this.slidesToShow;

            if (this.currentIndex >= maxIndex) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = Math.min(this.currentIndex + this.slidesToScroll, maxIndex);
            }

            this.updateSlider();
        }

        /**
         * Go to Previous Slide
         */
        prevSlide() {
            if (this.isAnimating) return;

            const maxIndex = this.totalSlides - this.slidesToShow;

            if (this.currentIndex <= 0) {
                this.currentIndex = maxIndex;
            } else {
                this.currentIndex = Math.max(this.currentIndex - this.slidesToScroll, 0);
            }

            this.updateSlider();
        }

        /**
         * Update Slider Position
         */
        updateSlider() {
            this.isAnimating = true;

            const cardWidth = 100 / this.slidesToShow;
            const translateX = -(this.currentIndex * cardWidth);

            this.track.style.transform = `translateX(${translateX}%)`;

            // Update dots
            this.updateDots();

            // Update button states
            this.updateButtons();

            // Animation complete
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }

        /**
         * Update Navigation Dots
         */
        updateDots() {
            if (!this.dots) return;

            const activeDotIndex = Math.floor(this.currentIndex / this.slidesToScroll);

            this.dots.forEach((dot, index) => {
                if (index === activeDotIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.removeAttribute('aria-current');
                }
            });
        }

        /**
         * Update Button States
         */
        updateButtons() {
            const maxIndex = this.totalSlides - this.slidesToShow;

            if (this.prevBtn) {
                // Always enable for infinite loop feel
                this.prevBtn.disabled = false;
            }

            if (this.nextBtn) {
                // Always enable for infinite loop feel
                this.nextBtn.disabled = false;
            }
        }

        /**
         * Start Autoplay
         */
        startAutoplay() {
            this.stopAutoplay();

            this.autoplayTimer = setInterval(() => {
                this.nextSlide();
            }, this.options.autoplayInterval);
        }

        /**
         * Stop Autoplay
         */
        stopAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        }

        /**
         * Utility: Debounce
         */
        debounce(func, wait) {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        /**
         * Destroy Slider
         */
        destroy() {
            this.stopAutoplay();

            // Reset styles
            this.track.style.transform = '';
            this.cards.forEach(card => {
                card.style.flex = '';
                card.style.margin = '';
            });

            // Clear dots
            if (this.dotsContainer) {
                this.dotsContainer.innerHTML = '';
            }
        }
    }

    /**
     * Initialize Testimonials Slider
     */
    function initTestimonialsSlider() {
        const slider = new TestimonialsSlider({
            containerSelector: '#testimonialsSlider',
            autoplay: true,
            autoplayInterval: 6000
        });

        // Expose to window for debugging
        window.testimonialsSlider = slider;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTestimonialsSlider);
    } else {
        initTestimonialsSlider();
    }

    // Export class for potential reuse
    window.TestimonialsSlider = TestimonialsSlider;

})();
