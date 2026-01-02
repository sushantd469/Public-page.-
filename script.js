// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Handles the acceptance of the cookie policy.
 */
function acceptCookies() {
    document.getElementById('cookie-banner').style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
}

/**
 * Formats a number into a shorter "K" or "M" format.
 * @param {number} n The number to format.
 * @returns {string} The formatted number string.
 */
function formatNumber(n) {
    if (n >= 1 _000_000) return (n / 1 _000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1 _000) return (n / 1 _000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

/**
 * Blocks the site content and displays an ad blocker message.
 */
function blockSite() {
    document.documentElement.innerHTML = `
    <head>
        <title>Ad Blocker Detected</title>
        <style>
            body { font-family: 'Space Grotesk', sans-serif; background-color: #0c0d0f; color: #fff; text-align: center; padding: 50px; }
            h1 { color: #4a90e2; }
        </style>
    </head>
    <body>
        <h1>Ad Blocker Detected</h1>
        <p style="font-size: 18px;">Please disable your ad blocker to access our free Minecraft hosting service.</p>
    </body>`;
}

// ============================================================================
// Event Listener: Page Fully Loaded (load)
// - Handles tasks that require all resources (images, etc.) to be loaded.
// ============================================================================
window.addEventListener('load', function() {
    // --- 1. Cookie Consent Check ---
    if (!localStorage.getItem('cookiesAccepted')) {
        const cookieBanner = document.getElementById('cookie-banner');
        if (cookieBanner) {
            cookieBanner.style.display = 'block';
        }
    }

    // --- 2. Fetch Server & User Stats ---
    const fetchStats = async () => {
        const serverIdEl = document.getElementById("serverId");
        const userIdEl = document.getElementById("userId");
        if (!serverIdEl || !userIdEl) return;

        const apiUrl = "https://earn.freezehost.pro/latest-server";
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok) {
                serverIdEl.textContent = "Error";
                userIdEl.textContent = "Error";
            } else {
                serverIdEl.textContent = formatNumber(data.server_id);
                userIdEl.textContent = formatNumber(data.user_id);
            }
        } catch (err) {
            console.error("Failed to fetch server stats:", err);
            serverIdEl.textContent = "N/A";
            userIdEl.textContent = "N/A";
        }
    };
    fetchStats();

    // --- 3. Ad Blocker Detection ---
    const detectAdBlocker = () => {
        let bait = document.createElement('div');
        bait.innerHTML = ' ';
        bait.className = 'adsbox pub_300x250';
        bait.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -9999px; top: -9999px;';
        document.body.appendChild(bait);

        setTimeout(function() {
            if (!bait.offsetParent ||
                bait.offsetHeight === 0 ||
                window.getComputedStyle(bait).display === 'none' ||
                window.getComputedStyle(bait).visibility === 'hidden'
            ) {
                blockSite(); // AdBlock is active
            }
            bait.remove();
        }, 100);
    };
    detectAdBlocker();
});


// ============================================================================
// Event Listener: DOM Content Loaded
// - Handles DOM manipulation and event binding as soon as the HTML is parsed.
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Functionality ---
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const openMenuBtn = document.querySelector('.open-menu');
    const closeMenuBtn = document.querySelector('.close-menu');
    const hamburgerIcon = document.querySelector('.hamburger-icon');

    function openMenu() {
        if (mobileMenu) mobileMenu.classList.add('active');
        if (menuOverlay) menuOverlay.classList.add('active');
        if (hamburgerIcon) hamburgerIcon.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        if (hamburgerIcon) hamburgerIcon.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openMenuBtn) openMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // --- Desktop Dropdown Functionality ---
    const dropdownButton = document.getElementById('get-started-dropdown-button');
    const dropdownMenu = document.getElementById('get-started-dropdown-menu');

    if (dropdownButton && dropdownMenu) {
        const dropdownIcon = dropdownButton.querySelector('i');

        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdownMenu.classList.toggle('show');
            if (dropdownIcon) dropdownIcon.classList.toggle('rotate-180', isVisible);
        });

        window.addEventListener('click', () => {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
                if (dropdownIcon) dropdownIcon.classList.remove('rotate-180');
            }
        });
    }

    // --- Intersection Observer for Fade-in Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100');
                entry.target.classList.remove('opacity-0');
                obs.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach((section) => {
        section.classList.add('opacity-0', 'transition-opacity', 'duration-1000');
        observer.observe(section);
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ============================================================================
// Other Global Event Listeners & Logic
// ============================================================================

// --- Parallax Scroll Effect for Background ---
let lastScrollPosition = window.pageYOffset;
let ticking = false;

window.addEventListener('scroll', function() {
    lastScrollPosition = window.pageYOffset;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            // NOTE: This requires a '.slow-scroll-section' class on an element.
            // This was in your original code but not in the HTML. Add the class if needed.
            const slowScrollSection = document.querySelector('.slow-scroll-section');
            if (slowScrollSection) {
                const speed = 0.15;
                const yPos = -(lastScrollPosition * speed);
                slowScrollSection.style.backgroundPosition = `50% ${yPos}px`;
            }
            ticking = false;
        });
        ticking = true;
    }
});


// --- Mobile Touch/Swipe Functionality ---
let touchStartY = 0;
let touchEndY = 0;

function handleSwipe() {
    const swipeDistance = touchEndY - touchStartY;
    // Check for a significant downward swipe to close the menu
    if (swipeDistance > 50) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            const menuOverlay = document.querySelector('.menu-overlay');
            if (menuOverlay) menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

document.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
}, {
    passive: true
});

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
}, {
    passive: true
});