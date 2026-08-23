/**
 * Personal Finance Analytics Dashboard
 * Core Application JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initSidebar();
    initCounters();
    initDropdowns();
    initFlashDismiss();
});

/* ============================================================
   Theme Toggle (Dark/Light)
   ============================================================ */
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle) return;

    // Load saved theme
    const saved = localStorage.getItem('theme') || document.body.getAttribute('data-theme') || 'dark';
    applyTheme(saved);

    toggle.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);

        // Persist theme to server
        fetch('index.php?page=settings&action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'theme=' + next
        }).catch(() => {});
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        if (icon) {
            icon.className = theme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun';
        }
        // Update Chart.js colors if charts exist
        if (typeof updateChartTheme === 'function') {
            updateChartTheme(theme);
        }
    }
}

/* ============================================================
   Sidebar Toggle
   ============================================================ */
function initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    });

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
}

/* ============================================================
   Animated Counters
   ============================================================ */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(function(el) { observer.observe(el); });
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const duration = 1500;
    const startTime = performance.now();

    // Detect currency symbol from existing text
    const text = el.textContent;
    let prefix = '';
    const match = text.match(/^[^\d\-]*/);
    if (match) prefix = match[0];

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        el.textContent = prefix + formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = prefix + formatNumber(target);
        }
    }

    requestAnimationFrame(update);
}

function formatNumber(n) {
    if (Math.abs(n) >= 10000000) {
        return (n / 10000000).toFixed(2) + ' Cr';
    }
    if (Math.abs(n) >= 100000) {
        return (n / 100000).toFixed(2) + ' L';
    }
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ============================================================
   Dropdown Menus
   ============================================================ */
function initDropdowns() {
    // Notification dropdown
    const notifBtn = document.getElementById('notificationBtn');
    if (notifBtn) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            // Close profile dropdown
            const profile = document.getElementById('profileBtn');
            if (profile) profile.classList.remove('active');
        });
    }

    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            // Close notification dropdown
            if (notifBtn) notifBtn.classList.remove('active');
        });
    }

    // Close dropdowns on click outside
    document.addEventListener('click', function() {
        if (notifBtn) notifBtn.classList.remove('active');
        if (profileBtn) profileBtn.classList.remove('active');
    });
}

/* ============================================================
   Flash Message Auto-Dismiss
   ============================================================ */
function initFlashDismiss() {
    const alerts = document.querySelectorAll('.flash-alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(100%)';
            setTimeout(function() { alert.remove(); }, 300);
        }, 5000);
    });
}

/* ============================================================
   Toast Notification
   ============================================================ */
function showToast(message, type) {
    type = type || 'info';
    const container = document.querySelector('.flash-container') || createFlashContainer();
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type + ' alert-dismissible fade show flash-alert';
    alert.innerHTML = '<i class="bi bi-' + (type === 'success' ? 'check-circle' : type === 'danger' ? 'x-circle' : 'info-circle') + '"></i> ' +
        message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    container.appendChild(alert);

    setTimeout(function() {
        alert.style.opacity = '0';
        setTimeout(function() { alert.remove(); }, 300);
    }, 4000);
}

function createFlashContainer() {
    const c = document.createElement('div');
    c.className = 'flash-container with-sidebar';
    document.body.appendChild(c);
    return c;
}

/* ============================================================
   Global Search
   ============================================================ */
const globalSearch = document.getElementById('globalSearch');
if (globalSearch) {
    let debounce;
    globalSearch.addEventListener('keyup', function(e) {
        clearTimeout(debounce);
        if (e.key === 'Enter' && this.value.trim()) {
            window.location.href = 'index.php?page=transactions&search=' + encodeURIComponent(this.value.trim());
        }
    });
}
