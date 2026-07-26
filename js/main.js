document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header scroll listener
    const header = document.querySelector('.navbar');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon animation
            const spans = menuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 3. Highlight Current Page in Menu
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. University Filter & Search
    const searchInput = document.getElementById('university-search');
    const tagButtons = document.querySelectorAll('.tag-btn');
    const universityCards = document.querySelectorAll('.uni-grid-item');
    const noResults = document.getElementById('no-results');

    if (searchInput || tagButtons.length > 0) {
        let activeTag = 'all';
        let searchQuery = '';

        const filterUniversities = () => {
            let visibleCount = 0;

            universityCards.forEach(card => {
                const title = card.querySelector('.uni-title').textContent.toLowerCase();
                const location = card.querySelector('.uni-location').textContent.toLowerCase();
                const courses = card.getAttribute('data-courses') ? card.getAttribute('data-courses').toLowerCase() : '';
                const tags = card.getAttribute('data-tags').toLowerCase().split(' ');
                
                const matchesSearch = title.includes(searchQuery) || location.includes(searchQuery) || courses.includes(searchQuery);
                const matchesTag = activeTag === 'all' || tags.includes(activeTag);

                if (matchesSearch && matchesTag) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (noResults) {
                if (visibleCount === 0) {
                    noResults.style.display = 'block';
                } else {
                    noResults.style.display = 'none';
                }
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                filterUniversities();
            });
        }

        tagButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tagButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTag = btn.getAttribute('data-filter').toLowerCase();
                filterUniversities();
            });
        });
    }

    // 5. Syllabus Tab Switcher
    const tabButtons = document.querySelectorAll('.syllabus-tab-btn');
    const tabPanels = document.querySelectorAll('.syllabus-panel');

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-tab');
                
                tabButtons.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetPanel = document.getElementById(target);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // 6. Accordion Toggle (FAQs)
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                accItem.querySelector('.accordion-body').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // 7. Contact Form Handler
    const contactForm = document.getElementById('consultation-form');
    const formMessage = document.getElementById('form-response');

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const course = document.getElementById('course').value;
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !phone || !course) {
                formMessage.textContent = 'Please fill out all required fields.';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                return;
            }

            // Simulate form submission
            formMessage.textContent = 'Submitting your inquiry...';
            formMessage.className = 'form-message';
            formMessage.style.display = 'block';

            setTimeout(() => {
                formMessage.innerHTML = '<strong>Success!</strong> Thank you for contacting JB Siksha Institute. Our admissions counselor will call you within 24 hours.';
                formMessage.className = 'form-message success';
                
                // Clear the form
                contactForm.reset();
            }, 1200);
        });
    }

    // 8. Global Form Submission Rate Limiter & XSS Sanitizer (Capture Phase)
    document.addEventListener('submit', (e) => {
        const form = e.target;
        
        // Skip validation check if form is not standard
        if (form.checkValidity && !form.checkValidity()) {
            return;
        }

        // Client-side Rate Limiting (max 3 submissions per minute)
        const now = Date.now();
        const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
        const recentSubmissions = submissions.filter(time => now - time < 60000);
        
        if (recentSubmissions.length >= 3) {
            e.preventDefault();
            e.stopPropagation();
            alert("Too many requests. Please wait a minute before submitting another inquiry.");
            return;
        }
        
        recentSubmissions.push(now);
        localStorage.setItem('form_submissions', JSON.stringify(recentSubmissions));

        // Input Sanitization (Strip HTML tags to prevent XSS)
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.tagName === 'TEXTAREA') {
                input.value = input.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
            }
        });
    }, true);
});
