/**
 * ============================================
 * HEALTHY SMILE DENTISTRY - MAIN JAVASCRIPT
 * Version: 1.0.0
 * ============================================
 */

(function() {
    'use strict';

    /**
     * Application State
     */
    const App = {
        isLoaded: false,
        isMobile: window.innerWidth <= 991,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    /**
     * Initialize Application
     */
    function init() {
        App.isLoaded = true;

        initChatWidget();
        initContactTabs();
        initScrollToTop();
        initLazyLoading();
        initAnimations();
        initAccessibility();
        initFormValidation();
        initParallax();
        initCounterAnimation();

        // Update mobile state on resize
        window.addEventListener('resize', debounce(function() {
            App.isMobile = window.innerWidth <= 991;
        }, 250));

        console.log('Healthy Smile Dentistry - Website Loaded');
    }

    /**
     * Parallax Effect for Backgrounds
     */
    function initParallax() {
        if (App.reducedMotion || App.isMobile) return;

        const parallaxElements = document.querySelectorAll('.hero-bg-image, .services-bg-image, .cta-bg-image');

        if (!parallaxElements.length) return;

        let ticking = false;

        function updateParallax() {
            const scrollTop = window.pageYOffset;

            parallaxElements.forEach(function(el) {
                const parent = el.closest('section');
                if (!parent) return;

                const rect = parent.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;

                if (inView) {
                    const speed = 0.3;
                    const yPos = (rect.top * speed);
                    // Preserve rotation for hero image
                    if (el.classList.contains('hero-bg-image')) {
                        el.style.transform = 'translate3d(0, ' + yPos + 'px, 0) rotate(-1.5deg) scale(1.05)';
                    } else {
                        el.style.transform = 'translate3d(0, ' + yPos + 'px, 0) scale(1.1)';
                    }
                }
            });

            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateParallax();
    }

    /**
     * Counter Animation for Statistics
     */
    function initCounterAnimation() {
        if (App.reducedMotion) return;

        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            counterObserver.observe(counter);
        });
    }

    /**
     * Animate a single counter
     */
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-counter'), 10);
        const duration = 2000;
        const step = (target / duration) * 16;
        let current = 0;

        function update() {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }

        update();
    }

    /**
     * Chat Widget Functionality
     */
    function initChatWidget() {
        const chatWidget = document.getElementById('chatWidget');
        const chatButton = document.getElementById('chatButton');
        const chatPopup = document.getElementById('chatPopup');
        const chatPopupClose = document.getElementById('chatPopupClose');

        if (!chatWidget || !chatButton || !chatPopup) return;

        let isPopupVisible = false;
        let popupTimeout = null;

        // Show popup after 3 seconds
        setTimeout(function() {
            if (!isPopupVisible) {
                showChatPopup();
            }
        }, 3000);

        // Toggle popup on button click
        chatButton.addEventListener('click', function() {
            if (isPopupVisible) {
                hideChatPopup();
            } else {
                showChatPopup();
            }
        });

        // Close popup
        if (chatPopupClose) {
            chatPopupClose.addEventListener('click', function(e) {
                e.stopPropagation();
                hideChatPopup();
            });
        }

        function showChatPopup() {
            chatPopup.classList.add('visible');
            isPopupVisible = true;

            // Auto-hide after 10 seconds
            clearTimeout(popupTimeout);
            popupTimeout = setTimeout(function() {
                hideChatPopup();
            }, 10000);
        }

        function hideChatPopup() {
            chatPopup.classList.remove('visible');
            isPopupVisible = false;
            clearTimeout(popupTimeout);
        }
    }

    /**
     * Contact Section Tabs
     */
    function initContactTabs() {
        const tabs = document.querySelectorAll('.contact-tab');

        if (!tabs.length) return;

        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(function(t) {
                    t.classList.remove('active');
                });

                // Add active class to clicked tab
                this.classList.add('active');

                // Get tab content (if implemented)
                const tabName = this.getAttribute('data-tab');

                // Here you would show/hide tab content
                // For now, just visual feedback
                console.log('Tab switched to:', tabName);
            });
        });
    }

    /**
     * Scroll to Top Button
     */
    function initScrollToTop() {
        // Create scroll to top button
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Наверх');
        scrollBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"/>
            </svg>
        `;
        document.body.appendChild(scrollBtn);

        // Show/hide based on scroll position
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.pageYOffset > 500) {
                        scrollBtn.classList.add('visible');
                    } else {
                        scrollBtn.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Scroll to top on click
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: App.reducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    /**
     * Lazy Loading Images
     */
    function initLazyLoading() {
        // Use native lazy loading if available
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(function(img) {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
            return;
        }

        // Fallback: Intersection Observer
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px'
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Scroll Animations
     */
    function initAnimations() {
        if (App.reducedMotion) return;

        // Auto-add animation attributes to elements
        addAnimationAttributes();

        // Get all elements with data-animate attribute
        const animatedElements = document.querySelectorAll('[data-animate]');

        if (!animatedElements.length) return;

        // Intersection Observer for scroll animations
        const animationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        });

        animatedElements.forEach(function(el) {
            animationObserver.observe(el);
        });

        // Animate elements already in view on page load
        setTimeout(function() {
            animatedElements.forEach(function(el) {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('animated');
                }
            });
        }, 100);
    }

    /**
     * Auto-add animation attributes to common elements
     */
    function addAnimationAttributes() {
        // Provider section
        const providerTitle = document.querySelector('.provider-title');
        if (providerTitle) {
            providerTitle.setAttribute('data-animate', 'fade-up');
        }

        const providerDesc = document.querySelector('.provider-description');
        if (providerDesc) {
            providerDesc.setAttribute('data-animate', 'fade-up');
            providerDesc.setAttribute('data-delay', '200');
        }

        // Section titles
        document.querySelectorAll('.section-title').forEach(function(el, i) {
            if (!el.hasAttribute('data-animate')) {
                el.setAttribute('data-animate', 'fade-up');
            }
        });

        document.querySelectorAll('.section-subtitle').forEach(function(el) {
            if (!el.hasAttribute('data-animate')) {
                el.setAttribute('data-animate', 'fade-up');
            }
        });

        document.querySelectorAll('.title-underline').forEach(function(el) {
            if (!el.hasAttribute('data-animate')) {
                el.setAttribute('data-animate', 'fade-up');
                el.setAttribute('data-delay', '100');
            }
        });

        // About section
        document.querySelectorAll('.about-text').forEach(function(el) {
            el.setAttribute('data-animate', 'fade-up');
            el.setAttribute('data-delay', '200');
        });

        document.querySelectorAll('.about-image-wrapper').forEach(function(el, i) {
            el.setAttribute('data-animate', i % 2 === 0 ? 'fade-right' : 'fade-left');
            el.setAttribute('data-delay', String((i + 1) * 200));
        });

        // Service cards
        document.querySelectorAll('.service-card').forEach(function(el, i) {
            el.setAttribute('data-animate', 'fade-up');
            el.setAttribute('data-delay', String(i * 150));
        });

        // Testimonial cards
        document.querySelectorAll('.testimonial-card').forEach(function(el, i) {
            el.setAttribute('data-animate', 'zoom-in');
            el.setAttribute('data-delay', String(i * 100));
        });

        // Special cards
        document.querySelectorAll('.special-card').forEach(function(el, i) {
            el.setAttribute('data-animate', 'fade-up');
            el.setAttribute('data-delay', String(i * 150));
        });

        // Feature cards
        document.querySelectorAll('.feature-card').forEach(function(el, i) {
            el.setAttribute('data-animate', 'pop');
            el.setAttribute('data-delay', String(i * 100));
        });

        // Contact section
        const contactInfo = document.querySelector('.contact-info-wrapper');
        if (contactInfo) {
            contactInfo.setAttribute('data-animate', 'fade-right');
        }

        const contactMap = document.querySelector('.contact-map-wrapper');
        if (contactMap) {
            contactMap.setAttribute('data-animate', 'fade-left');
            contactMap.setAttribute('data-delay', '200');
        }

        // Insurance section
        const insuranceImage = document.querySelector('.insurance-image');
        if (insuranceImage) {
            insuranceImage.setAttribute('data-animate', 'fade-right');
        }

        const insuranceText = document.querySelector('.insurance-text');
        if (insuranceText) {
            insuranceText.setAttribute('data-animate', 'fade-left');
            insuranceText.setAttribute('data-delay', '200');
        }

        // CTA section
        const ctaContent = document.querySelector('.cta-content');
        if (ctaContent) {
            ctaContent.setAttribute('data-animate', 'zoom-in');
        }

        // Info cards
        document.querySelectorAll('.info-card').forEach(function(el, i) {
            el.setAttribute('data-animate', 'fade-up');
            el.setAttribute('data-delay', String(i * 100));
        });

        // Footer columns
        document.querySelectorAll('.footer-column').forEach(function(el, i) {
            el.setAttribute('data-animate', 'fade-up');
            el.setAttribute('data-delay', String(i * 100));
        });

        // Cards in general
        document.querySelectorAll('.card:not([data-animate])').forEach(function(el, i) {
            el.setAttribute('data-animate', 'fade-up');
            el.setAttribute('data-delay', String((i % 3) * 100));
        });
    }

    /**
     * Accessibility Enhancements
     */
    function initAccessibility() {
        const accessibilityBtn = document.getElementById('accessibilityBtn');

        if (accessibilityBtn) {
            accessibilityBtn.addEventListener('click', function() {
                // Toggle high contrast mode or open accessibility menu
                document.body.classList.toggle('high-contrast');

                // Announce change to screen readers
                const announcement = document.body.classList.contains('high-contrast')
                    ? 'Режим высокой контрастности включен'
                    : 'Режим высокой контрастности выключен';

                announceToScreenReader(announcement);
            });
        }

        // Skip to main content link
        createSkipLink();

        // Focus visible polyfill behavior
        setupFocusVisible();
    }

    /**
     * Create Skip to Main Content Link
     */
    function createSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Перейти к основному содержимому';
        skipLink.style.cssText = `
            position: fixed;
            top: -100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 1rem 2rem;
            background: var(--color-primary, #1B3A5D);
            color: white;
            text-decoration: none;
            z-index: 10000;
            border-radius: 0 0 8px 8px;
            transition: top 0.3s ease;
        `;

        skipLink.addEventListener('focus', function() {
            this.style.top = '0';
        });

        skipLink.addEventListener('blur', function() {
            this.style.top = '-100%';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add id to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('tabindex', '-1');
        }
    }

    /**
     * Setup Focus Visible Behavior
     */
    function setupFocusVisible() {
        let hadKeyboardEvent = false;

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                hadKeyboardEvent = true;
            }
        });

        document.addEventListener('mousedown', function() {
            hadKeyboardEvent = false;
        });

        document.addEventListener('focusin', function(e) {
            if (hadKeyboardEvent) {
                e.target.classList.add('focus-visible');
            }
        });

        document.addEventListener('focusout', function(e) {
            e.target.classList.remove('focus-visible');
        });
    }

    /**
     * Announce to Screen Readers
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(function() {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Form Validation
     */
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');

        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                let isValid = true;
                const requiredFields = form.querySelectorAll('[required]');

                requiredFields.forEach(function(field) {
                    if (!validateField(field)) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.addEventListener('blur', function() {
                    validateField(this);
                });

                input.addEventListener('input', function() {
                    if (this.classList.contains('error')) {
                        validateField(this);
                    }
                });
            });
        });
    }

    /**
     * Validate Single Field
     */
    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        removeFieldError(field);

        // Required check
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }

        // Email validation
        if (isValid && type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введите корректный email адрес';
            }
        }

        // Phone validation
        if (isValid && type === 'tel' && value) {
            const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,6}[-\s\.]?[0-9]{2,6}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введите корректный номер телефона';
            }
        }

        // Min length
        if (isValid && field.minLength && value.length < field.minLength) {
            isValid = false;
            errorMessage = `Минимальная длина: ${field.minLength} символов`;
        }

        // Show error if invalid
        if (!isValid) {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Show Field Error
     */
    function showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');

        const errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        errorEl.id = field.id + '-error';
        errorEl.textContent = message;

        field.setAttribute('aria-describedby', errorEl.id);
        field.parentNode.appendChild(errorEl);
    }

    /**
     * Remove Field Error
     */
    function removeFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');

        const errorEl = field.parentNode.querySelector('.form-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    /**
     * Utility: Debounce
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utility: Throttle
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * Utility: Format Phone Number
     */
    function formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');

        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                // Russian format
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.substring(1, 4);
                }
                if (value.length > 4) {
                    formatted += ') ' + value.substring(4, 7);
                }
                if (value.length > 7) {
                    formatted += '-' + value.substring(7, 9);
                }
                if (value.length > 9) {
                    formatted += '-' + value.substring(9, 11);
                }
                input.value = formatted;
            }
        }
    }

    /**
     * Smooth Scroll Polyfill Detection
     */
    function supportsNativeSmoothScroll() {
        return 'scrollBehavior' in document.documentElement.style;
    }

    /**
     * Check if Element is in Viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Get Cookie
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    /**
     * Set Cookie
     */
    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utilities globally if needed
    window.HealthySmile = {
        App: App,
        debounce: debounce,
        throttle: throttle,
        formatPhoneNumber: formatPhoneNumber,
        isInViewport: isInViewport,
        announceToScreenReader: announceToScreenReader
    };

})();
