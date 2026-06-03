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

    // AI image generator
    const nanoForm = document.getElementById('nano-form');
    const nanoPrompt = document.getElementById('nano-prompt');
    const nanoResult = document.getElementById('nano-result');
    const nanoStatus = document.getElementById('nano-status');
    const geminiApiKey = document.getElementById('gemini-api-key');
    const geminiModel = 'gemini-3.1-flash-image';

    const setGeneratedImage = (src, prompt) => {
        nanoResult.innerHTML = '';
        const image = document.createElement('img');
        image.src = src;
        image.alt = `Генерирано изображение: ${prompt}`;
        nanoResult.appendChild(image);
    };

    const getInlineImage = response => {
        const parts = response?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(part => part.inlineData || part.inline_data);
        const inlineData = imagePart?.inlineData || imagePart?.inline_data;

        if (!inlineData?.data) {
            return null;
        }

        const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';
        return `data:${mimeType};base64,${inlineData.data}`;
    };

    const requestImageGeneration = async prompt => {
        const endpoint = window.NANO_BANANA_ENDPOINT || window.IMAGE_GENERATOR_ENDPOINT;
        if (!endpoint) {
            return requestGeminiImage(prompt);
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: geminiModel, prompt })
        });

        if (!response.ok) {
            throw new Error('Image generation request failed');
        }

        return response.json();
    };

    const requestGeminiImage = async prompt => {
        const apiKey = (geminiApiKey?.value || localStorage.getItem('geminiApiKey') || '').trim();

        if (!apiKey) {
            throw new Error('Missing Gemini API key');
        }

        localStorage.setItem('geminiApiKey', apiKey);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseModalities: ['Image']
                }
            })
        });

        if (!response.ok) {
            throw new Error('Gemini image generation failed');
        }

        return response.json();
    };

    if (nanoForm && nanoPrompt && nanoResult && nanoStatus) {
        if (geminiApiKey) {
            geminiApiKey.value = localStorage.getItem('geminiApiKey') || '';
        }

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
                const result = await requestImageGeneration(prompt);
                const imageSource = result.imageUrl || result.image || result.url || getInlineImage(result);

                if (!imageSource) {
                    throw new Error('Missing image URL');
                }

                setGeneratedImage(imageSource, prompt);
                nanoStatus.textContent = 'Изображението е генерирано';
            } catch (error) {
                nanoStatus.textContent = error.message === 'Missing Gemini API key'
                    ? 'Въведи Gemini API key, за да генерираш реално изображение'
                    : 'Генерирането не успя. Провери API key или backend endpoint';
            } finally {
                button.disabled = false;
            }
        });
    }
});
