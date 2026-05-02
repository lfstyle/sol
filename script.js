document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('main-header');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('section[id]');

    // --- Sticky Header + Active Link (single scroll listener) ---
    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY;

        // Sticky header
        header.classList.toggle('scrolled', scrollY > 60);

        // Active nav link
        let currentId = '';
        sections.forEach(section => {
            if (scrollY >= section.offsetTop - 250) {
                currentId = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    // --- Mobile Menu ---
    menuBtn.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        const icon = menuBtn.querySelector('i');
        icon.classList.toggle('fa-bars', !isOpen);
        icon.classList.toggle('fa-times', isOpen);
        menuBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            menuBtn.querySelector('i').className = 'fas fa-bars';
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // --- Menu Tabs ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const target = document.getElementById(`tab-${btn.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });

    // --- Scroll Animations (IntersectionObserver) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));

    // --- Live Opening Hours Status ---
    function updateOpeningStatus() {
        const headerBadge = document.getElementById('live-status-header');
        const contactText = document.getElementById('live-status-contact');
        
        if (!headerBadge || !contactText) return;

        // Aktuelle Zeit in Berlin holen
        const nowString = new Date().toLocaleString("en-US", {timeZone: "Europe/Berlin"});
        const now = new Date(nowString);
        
        const day = now.getDay(); // 0 = Sonntag, 1 = Montag, ..., 6 = Samstag
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours + minutes / 60;

        let isOpen = false;
        let closesAt = "";
        let opensNext = "";

        // Öffnungszeiten-Regeln
        if (day === 0) {
            // Sonntag: 12:00 - 21:00
            if (currentTime >= 12 && currentTime < 21) {
                isOpen = true;
                closesAt = "21:00";
            } else {
                opensNext = "Mittwoch um 17:00";
            }
        } else if (day >= 3 && day <= 6) {
            // Mittwoch - Samstag: 17:00 - 22:00
            if (currentTime >= 17 && currentTime < 22) {
                isOpen = true;
                closesAt = "22:00";
            } else {
                if (day === 6 && currentTime >= 22) {
                    opensNext = "Sonntag um 12:00";
                } else if (currentTime < 17) {
                    opensNext = "heute um 17:00";
                } else {
                    opensNext = "morgen um 17:00";
                }
            }
        } else {
            // Montag (1) und Dienstag (2): Ruhetag
            if (day === 1) opensNext = "Mittwoch um 17:00";
            if (day === 2) opensNext = "morgen um 17:00";
        }

        // HTML Update
        if (isOpen) {
            headerBadge.innerHTML = `<span class="status-dot is-open pulse"></span> Geöffnet`;
            contactText.innerHTML = `<span class="status-dot is-open pulse"></span> <span class="is-open">Jetzt geöffnet</span> &nbsp;– Schließt um ${closesAt} Uhr`;
        } else {
            headerBadge.innerHTML = `<span class="status-dot is-closed"></span> Geschlossen`;
            contactText.innerHTML = `<span class="status-dot is-closed"></span> <span class="is-closed">Aktuell geschlossen</span> &nbsp;– Öffnet ${opensNext} Uhr`;
        }
    }

    // Sofort initialisieren und dann jede Minute updaten
    updateOpeningStatus();
    setInterval(updateOpeningStatus, 60000);

    // Fire initial scroll to set correct state
    onScroll();
});
