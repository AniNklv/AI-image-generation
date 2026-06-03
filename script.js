document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on initial load

    // Smooth scroll offset for fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Parallax effect on hero background
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            let scrollPosition = window.pageYOffset;
            heroBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        });
    }

    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        const closeMobileMenu = () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        };

        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', event => {
            const clickedInsideNav = navLinks.contains(event.target);
            const clickedHamburger = hamburger.contains(event.target);

            if (!clickedInsideNav && !clickedHamburger) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    // AI image generator demo
    const nanoForm = document.getElementById('nano-form');
    const nanoPrompt = document.getElementById('nano-prompt');
    const nanoResult = document.getElementById('nano-result');
    const nanoStatus = document.getElementById('nano-status');

    const escapeSvgText = text => text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');

    const hashPrompt = prompt => {
        let hash = 0;
        for (let index = 0; index < prompt.length; index++) {
            hash = (hash << 5) - hash + prompt.charCodeAt(index);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const createDemoImage = prompt => {
        const hash = hashPrompt(prompt);
        const hueA = hash % 360;
        const hueB = (hueA + 90) % 360;
        const hueC = (hueA + 190) % 360;
        const words = prompt.trim().split(/\s+/).slice(0, 16);
        const lines = [];

        for (let index = 0; index < words.length; index += 4) {
            lines.push(words.slice(index, index + 4).join(' '));
        }

        const promptLines = lines.slice(0, 4).map((line, index) =>
            `<tspan x="60" y="${650 + index * 34}">${escapeSvgText(line)}</tspan>`
        ).join('');

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
                <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="hsl(${hueA}, 88%, 54%)"/>
                        <stop offset="48%" stop-color="hsl(${hueB}, 82%, 42%)"/>
                        <stop offset="100%" stop-color="hsl(${hueC}, 78%, 18%)"/>
                    </linearGradient>
                    <radialGradient id="glow" cx="35%" cy="22%" r="70%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.85)"/>
                        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                    </radialGradient>
                    <filter id="blur">
                        <feGaussianBlur stdDeviation="24"/>
                    </filter>
                </defs>
                <rect width="900" height="900" fill="url(#bg)"/>
                <circle cx="${180 + hash % 260}" cy="${170 + hash % 190}" r="230" fill="url(#glow)" opacity="0.72"/>
                <circle cx="${610 + hash % 120}" cy="${270 + hash % 160}" r="150" fill="rgba(255,255,255,0.2)" filter="url(#blur)"/>
                <path d="M0 590 C 180 ${430 + hash % 120}, 310 ${760 - hash % 90}, 510 610 S 760 520, 900 680 L 900 900 L 0 900 Z" fill="rgba(0,0,0,0.34)"/>
                <path d="M80 520 C 250 ${390 + hash % 80}, 390 ${500 + hash % 120}, 560 420 S 790 390, 850 500" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="8" stroke-linecap="round"/>
                <g fill="rgba(255,255,255,0.72)">
                    <circle cx="150" cy="250" r="6"/>
                    <circle cx="710" cy="170" r="5"/>
                    <circle cx="780" cy="410" r="7"/>
                    <circle cx="330" cy="130" r="4"/>
                    <circle cx="520" cy="250" r="5"/>
                </g>
                <g font-family="Arial, sans-serif">
                    <text x="60" y="92" fill="white" font-size="42" font-weight="700">AI Генератор</text>
                    <text x="60" y="138" fill="rgba(255,255,255,0.72)" font-size="24">демонстрационно изображение</text>
                    <text fill="white" font-size="27" font-weight="700">${promptLines}</text>
                </g>
            </svg>
        `;

        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    const setGeneratedImage = (src, prompt) => {
        nanoResult.innerHTML = '';
        const image = document.createElement('img');
        image.src = src;
        image.alt = `Генерирано изображение: ${prompt}`;
        nanoResult.appendChild(image);
    };

    const requestNanoBananaImage = async prompt => {
        const endpoint = window.NANO_BANANA_ENDPOINT;
        if (!endpoint) {
            return { imageUrl: createDemoImage(prompt), isDemo: true };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'nano-banana', prompt })
        });

        if (!response.ok) {
            throw new Error('Image generation request failed');
        }

        return response.json();
    };

    if (nanoForm && nanoPrompt && nanoResult && nanoStatus) {
        nanoForm.addEventListener('submit', async event => {
            event.preventDefault();
            const prompt = nanoPrompt.value.trim();
            const button = nanoForm.querySelector('button[type="submit"]');

            if (!prompt) {
                nanoStatus.textContent = 'Напиши prompt преди генериране';
                nanoPrompt.focus();
                return;
            }

            button.disabled = true;
            nanoStatus.textContent = 'Генериране...';

            try {
                const result = await requestNanoBananaImage(prompt);
                const imageSource = result.imageUrl || result.image || result.url;

                if (!imageSource) {
                    throw new Error('Missing image URL');
                }

                setGeneratedImage(imageSource, prompt);
                nanoStatus.textContent = result.isDemo
                    ? 'Генерирано demo изображение'
                    : 'Изображението е генерирано';
            } catch (error) {
                setGeneratedImage(createDemoImage(prompt), prompt);
                nanoStatus.textContent = 'Показано е demo изображение';
            } finally {
                button.disabled = false;
            }
        });
    }
});
