/**
 * ACCESSIBILITY WIDGET - Complete Implementation
 * Manages all accessibility features including font size, contrast, fonts, etc.
 */

(function() {
    'use strict';

    // DOM Elements
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    const accessibilityPanel = document.getElementById('accessibilityPanel');
    const accessibilityClose = document.getElementById('accessibilityClose');
    const resetBtn = document.getElementById('accessibilityReset');

    // Toggle controls
    const highContrastToggle = document.getElementById('highContrastToggle');
    const dyslexiaFontToggle = document.getElementById('dyslexiaFontToggle');
    const highlightLinksToggle = document.getElementById('highlightLinksToggle');
    const readableFontToggle = document.getElementById('readableFontToggle');
    const reduceMotionToggle = document.getElementById('reduceMotionToggle');

    // Font size buttons
    const fontButtons = document.querySelectorAll('.accessibility-control-btn');

    // State
    let currentFontLevel = 0; // 0 = normal, 1 = large, 2 = larger, 3 = largest

    /**
     * Initialize Accessibility Widget
     */
    function init() {
        // Load saved preferences
        loadPreferences();

        // Event listeners
        accessibilityBtn.addEventListener('click', togglePanel);
        accessibilityClose.addEventListener('click', closePanel);

        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.accessibility-widget')) {
                closePanel();
            }
        });

        // Font size controls
        fontButtons.forEach(function(btn) {
            btn.addEventListener('click', handleFontSize);
        });

        // Toggle switches
        highContrastToggle.addEventListener('change', toggleHighContrast);
        dyslexiaFontToggle.addEventListener('change', toggleDyslexiaFont);
        highlightLinksToggle.addEventListener('change', toggleHighlightLinks);
        readableFontToggle.addEventListener('change', toggleReadableFont);
        reduceMotionToggle.addEventListener('change', toggleReduceMotion);

        // Reset button
        resetBtn.addEventListener('click', resetAllSettings);

        // Keyboard accessibility
        accessibilityBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePanel();
            }
        });
    }

    /**
     * Toggle Panel Visibility
     */
    function togglePanel() {
        accessibilityPanel.classList.toggle('active');

        // Update aria-expanded
        const isExpanded = accessibilityPanel.classList.contains('active');
        accessibilityBtn.setAttribute('aria-expanded', isExpanded);

        if (isExpanded) {
            // Focus first interactive element
            setTimeout(function() {
                const firstButton = accessibilityPanel.querySelector('button, input');
                if (firstButton) firstButton.focus();
            }, 100);
        }
    }

    /**
     * Close Panel
     */
    function closePanel() {
        accessibilityPanel.classList.remove('active');
        accessibilityBtn.setAttribute('aria-expanded', 'false');
    }

    /**
     * Handle Font Size Changes
     */
    function handleFontSize(e) {
        const action = e.target.getAttribute('data-action');

        // Remove all font size classes
        document.body.classList.remove('font-size-large', 'font-size-larger', 'font-size-largest');

        if (action === 'font-increase') {
            currentFontLevel = Math.min(currentFontLevel + 1, 3);
        } else if (action === 'font-decrease') {
            currentFontLevel = Math.max(currentFontLevel - 1, 0);
        } else if (action === 'font-reset') {
            currentFontLevel = 0;
        }

        // Apply font size class
        switch (currentFontLevel) {
            case 1:
                document.body.classList.add('font-size-large');
                break;
            case 2:
                document.body.classList.add('font-size-larger');
                break;
            case 3:
                document.body.classList.add('font-size-largest');
                break;
        }

        savePreference('fontLevel', currentFontLevel);
        announceChange('Font size changed to level ' + currentFontLevel);
    }

    /**
     * Toggle High Contrast Mode
     */
    function toggleHighContrast() {
        const isEnabled = highContrastToggle.checked;
        document.body.classList.toggle('high-contrast', isEnabled);
        savePreference('highContrast', isEnabled);
        announceChange('High contrast mode ' + (isEnabled ? 'enabled' : 'disabled'));
    }

    /**
     * Toggle Dyslexia Friendly Font
     */
    function toggleDyslexiaFont() {
        const isEnabled = dyslexiaFontToggle.checked;
        document.body.classList.toggle('dyslexia-font', isEnabled);
        savePreference('dyslexiaFont', isEnabled);
        announceChange('Dyslexia friendly font ' + (isEnabled ? 'enabled' : 'disabled'));
    }

    /**
     * Toggle Link Highlighting
     */
    function toggleHighlightLinks() {
        const isEnabled = highlightLinksToggle.checked;
        document.body.classList.toggle('highlight-links', isEnabled);
        savePreference('highlightLinks', isEnabled);
        announceChange('Link highlighting ' + (isEnabled ? 'enabled' : 'disabled'));
    }

    /**
     * Toggle Readable Font
     */
    function toggleReadableFont() {
        const isEnabled = readableFontToggle.checked;
        document.body.classList.toggle('readable-font', isEnabled);
        savePreference('readableFont', isEnabled);
        announceChange('Readable font ' + (isEnabled ? 'enabled' : 'disabled'));
    }

    /**
     * Toggle Reduce Motion
     */
    function toggleReduceMotion() {
        const isEnabled = reduceMotionToggle.checked;
        document.body.classList.toggle('reduce-motion', isEnabled);
        savePreference('reduceMotion', isEnabled);
        announceChange('Reduced motion ' + (isEnabled ? 'enabled' : 'disabled'));
    }

    /**
     * Reset All Settings
     */
    function resetAllSettings() {
        // Confirm reset
        if (!confirm('Are you sure you want to reset all accessibility settings?')) {
            return;
        }

        // Reset font level
        currentFontLevel = 0;
        document.body.classList.remove('font-size-large', 'font-size-larger', 'font-size-largest');

        // Reset all toggles
        highContrastToggle.checked = false;
        dyslexiaFontToggle.checked = false;
        highlightLinksToggle.checked = false;
        readableFontToggle.checked = false;
        reduceMotionToggle.checked = false;

        // Remove all body classes
        document.body.classList.remove(
            'high-contrast',
            'dyslexia-font',
            'highlight-links',
            'readable-font',
            'reduce-motion'
        );

        // Clear localStorage
        localStorage.removeItem('accessibility-preferences');

        announceChange('All accessibility settings have been reset');
    }

    /**
     * Save Preference to LocalStorage
     */
    function savePreference(key, value) {
        try {
            let preferences = JSON.parse(localStorage.getItem('accessibility-preferences') || '{}');
            preferences[key] = value;
            localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
        } catch (e) {
            console.warn('Could not save accessibility preference:', e);
        }
    }

    /**
     * Load Saved Preferences
     */
    function loadPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('accessibility-preferences') || '{}');

            // Load font level
            if (preferences.fontLevel !== undefined) {
                currentFontLevel = preferences.fontLevel;
                switch (currentFontLevel) {
                    case 1:
                        document.body.classList.add('font-size-large');
                        break;
                    case 2:
                        document.body.classList.add('font-size-larger');
                        break;
                    case 3:
                        document.body.classList.add('font-size-largest');
                        break;
                }
            }

            // Load toggle states
            if (preferences.highContrast) {
                highContrastToggle.checked = true;
                document.body.classList.add('high-contrast');
            }

            if (preferences.dyslexiaFont) {
                dyslexiaFontToggle.checked = true;
                document.body.classList.add('dyslexia-font');
            }

            if (preferences.highlightLinks) {
                highlightLinksToggle.checked = true;
                document.body.classList.add('highlight-links');
            }

            if (preferences.readableFont) {
                readableFontToggle.checked = true;
                document.body.classList.add('readable-font');
            }

            if (preferences.reduceMotion) {
                reduceMotionToggle.checked = true;
                document.body.classList.add('reduce-motion');
            }
        } catch (e) {
            console.warn('Could not load accessibility preferences:', e);
        }
    }

    /**
     * Announce Change to Screen Readers
     */
    function announceChange(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(function() {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Detect System Preferences
     */
    function detectSystemPreferences() {
        // Detect prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            if (!reduceMotionToggle.checked) {
                reduceMotionToggle.checked = true;
                document.body.classList.add('reduce-motion');
                savePreference('reduceMotion', true);
            }
        }

        // Detect prefers-contrast
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            if (!highContrastToggle.checked) {
                highContrastToggle.checked = true;
                document.body.classList.add('high-contrast');
                savePreference('highContrast', true);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            detectSystemPreferences();
        });
    } else {
        init();
        detectSystemPreferences();
    }

    // Export for external use
    window.AccessibilityWidget = {
        reset: resetAllSettings,
        setFontSize: function(level) {
            currentFontLevel = level;
            handleFontSize({ target: { getAttribute: function() { return 'font-reset'; } } });
        }
    };

})();
