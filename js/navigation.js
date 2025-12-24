/**
 * ============================================
 * HEALTHY SMILE DENTISTRY - NAVIGATION
 * Version: 1.0.0
 * ============================================
 */

(function() {
    'use strict';

    // DOM Elements
    const header = document.getElementById('header');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

    // State
    let lastScrollTop = 0;
    let isMenuOpen = false;

    /**
     * Initialize Navigation
     */
    function init() {
        if (!header) return;

        setupScrollBehavior();
        setupMobileMenu();
        setupDropdowns();
        setupSmoothScroll();
        setupActiveLinks();
    }

    /**
     * Header Scroll Behavior
     * Adds shadow on scroll and handles hide/show on scroll direction
     */
    function setupScrollBehavior() {
        let ticking = false;

        function updateHeader() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Add shadow when scrolled
            if (scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Optional: Hide header on scroll down, show on scroll up
            // Uncomment the following code if you want this behavior:
            /*
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            */

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        updateHeader();
    }

    /**
     * Mobile Menu Toggle
     */
    function setupMobileMenu() {
        if (!mobileMenuToggle || !mobileMenu) return;

        // Toggle button click
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });

        // Close button click
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function(e) {
                e.preventDefault();
                closeMobileMenu();
            });
        }

        // Overlay click
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', function() {
                closeMobileMenu();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMobileMenu();
            }
        });

        // Close menu on window resize (if switching to desktop view)
        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth > 991 && isMenuOpen) {
                closeMobileMenu();
            }
        }, 250));

        // Close menu when clicking on a link
        const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });
    }

    /**
     * Toggle Mobile Menu
     */
    function toggleMobileMenu() {
        if (isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    /**
     * Open Mobile Menu
     */
    function openMobileMenu() {
        isMenuOpen = true;
        mobileMenu.classList.add('open');
        mobileMenuToggle.classList.add('active');
        mobileMenuOverlay.classList.add('visible');
        document.body.classList.add('menu-open');

        // Focus trap
        trapFocus(mobileMenu);

        // Announce to screen readers
        mobileMenu.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close Mobile Menu
     */
    function closeMobileMenu() {
        isMenuOpen = false;
        mobileMenu.classList.remove('open');
        mobileMenuToggle.classList.remove('active');
        mobileMenuOverlay.classList.remove('visible');
        document.body.classList.remove('menu-open');

        // Return focus to toggle button
        mobileMenuToggle.focus();

        // Announce to screen readers
        mobileMenu.setAttribute('aria-hidden', 'true');
    }

    /**
     * Setup Dropdown Menus (Desktop)
     */
    function setupDropdowns() {
        if (!dropdownItems.length) return;

        dropdownItems.forEach(function(item) {
            const link = item.querySelector('.nav-link');
            const menu = item.querySelector('.dropdown-menu');

            if (!link || !menu) return;

            // Keyboard navigation
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDropdown(item);
                }

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    openDropdown(item);
                    const firstLink = menu.querySelector('a');
                    if (firstLink) firstLink.focus();
                }
            });

            // Arrow key navigation within dropdown
            menu.addEventListener('keydown', function(e) {
                const links = menu.querySelectorAll('a');
                const currentIndex = Array.from(links).indexOf(document.activeElement);

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % links.length;
                    links[nextIndex].focus();
                }

                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + links.length) % links.length;
                    links[prevIndex].focus();
                }

                if (e.key === 'Escape') {
                    closeDropdown(item);
                    link.focus();
                }
            });

            // Touch device support
            if ('ontouchstart' in window) {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 991) return;

                    e.preventDefault();
                    toggleDropdown(item);
                });

                // Close dropdown when clicking outside
                document.addEventListener('touchstart', function(e) {
                    if (!item.contains(e.target)) {
                        closeDropdown(item);
                    }
                });
            }
        });

        // Close all dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item.dropdown')) {
                closeAllDropdowns();
            }
        });
    }

    /**
     * Toggle Dropdown
     */
    function toggleDropdown(item) {
        const isOpen = item.classList.contains('active');
        closeAllDropdowns();

        if (!isOpen) {
            openDropdown(item);
        }
    }

    /**
     * Open Dropdown
     */
    function openDropdown(item) {
        item.classList.add('active');
        const menu = item.querySelector('.dropdown-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Close Dropdown
     */
    function closeDropdown(item) {
        item.classList.remove('active');
        const menu = item.querySelector('.dropdown-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Close All Dropdowns
     */
    function closeAllDropdowns() {
        dropdownItems.forEach(function(item) {
            closeDropdown(item);
        });
    }

    /**
     * Smooth Scroll for Anchor Links
     */
    function setupSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, href);

                    // Set focus on target for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    }

    /**
     * Highlight Active Navigation Links
     */
    function setupActiveLinks() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!sections.length || !navLinks.length) return;

        function highlightActiveLink() {
            const scrollPosition = window.pageYOffset + header.offsetHeight + 100;

            sections.forEach(function(section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');

                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', throttle(highlightActiveLink, 100), { passive: true });
    }

    /**
     * Focus Trap for Modals/Menus
     */
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        function handleTabKey(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }

        element.addEventListener('keydown', handleTabKey);

        // Focus first element
        if (firstFocusable) {
            firstFocusable.focus();
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public methods if needed
    window.Navigation = {
        openMobileMenu: openMobileMenu,
        closeMobileMenu: closeMobileMenu,
        toggleMobileMenu: toggleMobileMenu
    };

})();
