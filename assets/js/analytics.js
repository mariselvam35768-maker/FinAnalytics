/**
 * Personal Finance Analytics Dashboard
 * Analytics Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    animateHealthScore();
    animateProgressBars();
});

/**
 * Animate the financial health score circle
 */
function animateHealthScore() {
    const circle = document.querySelector('.score-circle');
    if (!circle) return;

    const scoreEl = circle.querySelector('.score-value');
    if (!scoreEl) return;

    const target = parseInt(scoreEl.textContent) || 0;
    let current = 0;
    const duration = 2000;
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        current = Math.round(target * eased);
        scoreEl.textContent = current;

        // Update the conic gradient
        const degrees = current * 3.6;
        const color = current >= 60 ? 'var(--accent-success)' : (current >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)');
        circle.style.background = `conic-gradient(${color} ${degrees}deg, var(--border-color) ${degrees}deg)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    // Start with 0 and animate to target
    scoreEl.textContent = '0';
    circle.style.background = 'conic-gradient(var(--border-color) 0deg, var(--border-color) 360deg)';

    // Trigger animation when visible
    const observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
            requestAnimationFrame(animate);
            observer.disconnect();
        }
    }, { threshold: 0.5 });

    observer.observe(circle);
}

/**
 * Animate progress bars
 */
function animateProgressBars() {
    const bars = document.querySelectorAll('[style*="transition:width"]');
    bars.forEach(function(bar) {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        setTimeout(function() {
            bar.style.width = targetWidth;
        }, 500);
    });
}
