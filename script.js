function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function() {
  let index = 0;
  const items = document.querySelectorAll('.carousel-item');
  const totalItems = items.length;

  function showNextItem() {
      items[index].classList.remove('active');
      index = (index + 1) % totalItems;
      items[index].classList.add('active');
  }

  function startCarousel() {
      setInterval(showNextItem, 3000); // Change slide every 3 seconds
  }

  startCarousel();
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navCenter = document.querySelector('.nav-center');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            if (navCenter) {
                navCenter.classList.toggle('mobile-open');
            }
        });
    }

    // Dropdown delay functionality
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    let dropdownTimeout;

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(dropdownTimeout);
            this.classList.add('show-dropdown');
        });

        dropdown.addEventListener('mouseleave', function() {
            const self = this;
            dropdownTimeout = setTimeout(() => {
                self.classList.remove('show-dropdown');
            }, 3000); // 3 second delay
        });
    });

    // Header scroll effect
    const header = document.querySelector('.main-header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animations
    document.querySelectorAll('.section-title, .main-description, .photo-item').forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// Legacy carousel functionality (if needed for other pages)
document.addEventListener("DOMContentLoaded", function() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    if (carouselItems.length > 0) {
        let index = 0;
        const totalItems = carouselItems.length;

        function showNextItem() {
            carouselItems[index].classList.remove('active');
            index = (index + 1) % totalItems;
            carouselItems[index].classList.add('active');
        }

        function startCarousel() {
            setInterval(showNextItem, 3000);
        }

        startCarousel();
    }
});

// Sponsor Carousel Functionality (if needed for sponsor page)
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.sponsor-carousel');
    
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.sponsor-track');
        const slides = carousel.querySelectorAll('.sponsor-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let currentIndex = 0;
        
        if (!track || slides.length === 0) return;
        
        // Set initial position
        updateSlidePosition();
        
        // Add click events to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateSlidePosition();
                updateDots();
            });
        });
        
        // Auto-advance slides every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlidePosition();
            updateDots();
        }, 5000);
        
        function updateSlidePosition() {
            const slideWidth = slides[0].offsetWidth;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
        
        function updateDots() {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
    });
});

// Gallery functionality for subteams
function changeSlide(button, direction) {
    const gallery = button.closest('.subteam-gallery');
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dots = gallery.querySelectorAll('.dot');
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    // Remove active class from current slide and dot
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    // Calculate new index
    currentIndex += direction;
    if (currentIndex >= slides.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = slides.length - 1;
    
    // Add active class to new slide and dot
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
}

function currentSlide(dot, slideIndex) {
    const gallery = dot.closest('.subteam-gallery');
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dots = gallery.querySelectorAll('.dot');
    
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    // Add active class to selected slide and dot
    slides[slideIndex - 1].classList.add('active');
    dots[slideIndex - 1].classList.add('active');
}

// Auto-advance gallery slides
document.addEventListener('DOMContentLoaded', function() {
    const galleries = document.querySelectorAll('.subteam-gallery');
    
    galleries.forEach(gallery => {
        let autoSlideInterval;
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                const nextButton = gallery.querySelector('.gallery-next');
                if (nextButton) {
                    changeSlide(nextButton, 1);
                }
            }, 4000); // Change slide every 4 seconds
        }
        
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        // Start auto-slide
        startAutoSlide();
        
        // Pause auto-slide on hover
        gallery.addEventListener('mouseenter', stopAutoSlide);
        gallery.addEventListener('mouseleave', startAutoSlide);
    });
});

// Main Gallery functionality for subteams page
var mainSlideIndex = 0;
var mainAutoSlideInterval;

// Test function
function testGallery() {
    alert('Gallery function is working!');
}

function changeMainSlide(direction) {
    var slides = document.querySelectorAll('.main-gallery-slide');
    var dots = document.querySelectorAll('.main-dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    slides[mainSlideIndex].classList.remove('active');
    if (dots[mainSlideIndex]) {
        dots[mainSlideIndex].classList.remove('active');
    }
    
    // Calculate new index
    mainSlideIndex += direction;
    if (mainSlideIndex >= slides.length) mainSlideIndex = 0;
    if (mainSlideIndex < 0) mainSlideIndex = slides.length - 1;
    
    // Add active class to new slide and dot
    slides[mainSlideIndex].classList.add('active');
    if (dots[mainSlideIndex]) {
        dots[mainSlideIndex].classList.add('active');
    }
    
    // Reset auto-advance timer
    if (mainAutoSlideInterval) {
        clearInterval(mainAutoSlideInterval);
        startMainAutoSlide();
    }
}

function currentMainSlide(slideIndex) {
    var slides = document.querySelectorAll('.main-gallery-slide');
    var dots = document.querySelectorAll('.main-dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from all slides and dots
    for (var i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }
    
    // Set new index
    mainSlideIndex = slideIndex - 1;
    
    // Add active class to selected slide and dot
    slides[mainSlideIndex].classList.add('active');
    dots[mainSlideIndex].classList.add('active');
    
    // Reset auto-advance timer
    if (mainAutoSlideInterval) {
        clearInterval(mainAutoSlideInterval);
        startMainAutoSlide();
    }
}

function startMainAutoSlide() {
    mainAutoSlideInterval = setInterval(function() {
        changeMainSlide(1);
    }, 6000); // Change slide every 6 seconds
}

function stopMainAutoSlide() {
    if (mainAutoSlideInterval) {
        clearInterval(mainAutoSlideInterval);
    }
}

// Initialize main gallery
document.addEventListener('DOMContentLoaded', function() {
    var mainGallery = document.querySelector('.main-gallery-container');
    
    if (mainGallery) {
        // Start auto-advance
        startMainAutoSlide();
        
        // Pause auto-advance on hover
        mainGallery.addEventListener('mouseenter', function() {
            stopMainAutoSlide();
        });
        
        mainGallery.addEventListener('mouseleave', function() {
            startMainAutoSlide();
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                changeMainSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeMainSlide(1);
            }
        });
    }
});

// Add CSS classes for animations and effects
const style = document.createElement('style');
style.textContent = `
    .main-header {
        transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .main-header.scrolled {
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .main-header.scrolled .nav-link,
    .main-header.scrolled .nav-brand {
        color: var(--waterloo-black);
    }
    
    .main-header.scrolled .nav-link:hover {
        color: var(--waterloo-gold);
    }
    
    .main-header.scrolled .nav-link::after {
        background-color: var(--waterloo-gold);
    }
    
    .main-header.scrolled .contact-btn {
        background: var(--waterloo-black);
        color: var(--waterloo-white);
    }
    
    .main-header.scrolled .contact-btn:hover {
        background: var(--waterloo-gold);
        color: var(--waterloo-black);
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    .nav-center.mobile-open {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 20px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 1000;
    }
    
    .nav-center.mobile-open .nav-link {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    body.loaded {
        overflow-x: hidden;
    }
    
    @media (max-width: 1024px) {
        .nav-center {
            display: none;
        }
    }
`;
document.head.appendChild(style);
