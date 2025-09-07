// Simplified Banana Comic Strip Generator
class ComicGenerator {
    constructor() {
        this.selectedStyle = 'comic';
        this.nanoBananaAPI = null;
        this.savedComics = JSON.parse(localStorage.getItem('banana_comics') || '[]');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAPI();
        this.loadGallery();
        this.updateUsageStats();
    }

    initializeAPI() {
        if (window.CONFIG && window.CONFIG.GEMINI_API_KEY) {
            this.nanoBananaAPI = new NanoBananaAPI(window.CONFIG.GEMINI_API_KEY);
            console.log('API initialized successfully');
        } else {
            console.error('No API key found in configuration');
        }
    }

    setupEventListeners() {
        // Style selection
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectStyle(e.target.closest('.style-btn').dataset.style);
            });
        });

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateComic();
        });

        // Action buttons
        document.getElementById('download-btn')?.addEventListener('click', () => {
            this.downloadComic();
        });

        document.getElementById('new-comic-btn')?.addEventListener('click', () => {
            this.startNewComic();
        });
    }

    selectStyle(style) {
        this.selectedStyle = style;

        // Update button states
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-style="${style}"]`).classList.add('active');
    }

    async generateComic() {
        const storyInput = document.getElementById('story-input').value.trim();

        if (!storyInput) {
            alert('Please enter a story description before generating a comic!');
            return;
        }

        if (!this.nanoBananaAPI) {
            alert('API not initialized. Please check your configuration.');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Generate the comic
            const result = await this.nanoBananaAPI.generateComic(storyInput, this.selectedStyle);

            // Create comic entry
            const comic = {
                id: Date.now(),
                story: storyInput,
                style: this.selectedStyle,
                imageUrl: result.imageUrl,
                createdAt: new Date().toISOString()
            };

            // Save comic
            this.savedComics.unshift(comic);
            localStorage.setItem('banana_comics', JSON.stringify(this.savedComics));

            // Display result
            this.displayComic(comic);
            this.loadGallery();
            this.updateUsageStats();

        } catch (error) {
            console.error('Error generating comic:', error);

            // Show error and offer fallback
            if (confirm('API error occurred. Would you like to create a demo comic instead?')) {
                this.generateDemoComic(storyInput);
            } else {
                this.setLoadingState(false);
            }
        }
    }

    generateDemoComic(story) {
        // Create a demo comic using canvas with 2x2 grid format
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Style-based themes
        const themes = {
            comic: { bg: '#FFE066', primary: '#2C3E50', accent: '#E74C3C' },
            ghibli: { bg: '#A8E6CF', primary: '#2C3E50', accent: '#88D8A3' },
            superhero: { bg: '#3498DB', primary: '#FFFFFF', accent: '#F39C12' },
            disney: { bg: '#FFB6C1', primary: '#8B4513', accent: '#FF69B4' },
            manga: { bg: '#F8F8F8', primary: '#2C3E50', accent: '#95A5A6' },
            pixar: { bg: '#87CEEB', primary: '#2C3E50', accent: '#FF6347' },
            watercolor: { bg: '#F0E68C', primary: '#4B0082', accent: '#DA70D6' },
            minimalist: { bg: '#FFFFFF', primary: '#333333', accent: '#0066CC' }
        };

        const theme = themes[this.selectedStyle] || themes.comic;

        // Draw background
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw 2x2 grid of panels
        const panelWidth = 280;
        const panelHeight = 200;
        const panelSpacing = 30;
        const startX = (canvas.width - (2 * panelWidth + panelSpacing)) / 2;
        const startY = 80;

        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 4;

        const panelLabels = ['Morning Start', 'Daytime Events', 'Key Moments', 'Evening End'];
        const panelIcons = ['🌅', '☀️', '⭐', '🌙'];

        // Draw 2x2 grid
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const panelIndex = row * 2 + col;
                const x = startX + (col * (panelWidth + panelSpacing));
                const y = startY + (row * (panelHeight + panelSpacing));

                // Panel border
                ctx.strokeRect(x, y, panelWidth, panelHeight);

                // Panel background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(x + 4, y + 4, panelWidth - 8, panelHeight - 8);

                // Panel number badge
                ctx.fillStyle = theme.accent;
                ctx.fillRect(x + 15, y + 15, 40, 30);
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(`${panelIndex + 1}`, x + 35, y + 35);

                // Panel icon
                ctx.font = '40px Arial';
                ctx.fillText(panelIcons[panelIndex], x + panelWidth / 2, y + 80);

                // Panel title
                ctx.fillStyle = theme.primary;
                ctx.font = 'bold 16px Arial';
                ctx.fillText(panelLabels[panelIndex], x + panelWidth / 2, y + 120);

                // Style-specific decorations
                ctx.font = '20px Arial';
                ctx.fillStyle = theme.accent;
                if (this.selectedStyle === 'comic') {
                    ctx.fillText('💥', x + panelWidth / 2 - 30, y + 150);
                    ctx.fillText('💥', x + panelWidth / 2 + 30, y + 150);
                } else if (this.selectedStyle === 'ghibli') {
                    ctx.fillText('🌸', x + panelWidth / 2 - 30, y + 150);
                    ctx.fillText('✨', x + panelWidth / 2 + 30, y + 150);
                } else if (this.selectedStyle === 'superhero') {
                    ctx.fillText('⚡', x + panelWidth / 2 - 20, y + 150);
                    ctx.fillText('💨', x + panelWidth / 2 + 20, y + 150);
                } else if (this.selectedStyle === 'disney') {
                    ctx.fillText('✨', x + panelWidth / 2 - 20, y + 150);
                    ctx.fillText('🏰', x + panelWidth / 2 + 20, y + 150);
                } else if (this.selectedStyle === 'pixar') {
                    ctx.fillText('🎬', x + panelWidth / 2 - 20, y + 150);
                    ctx.fillText('🎭', x + panelWidth / 2 + 20, y + 150);
                } else if (this.selectedStyle === 'watercolor') {
                    ctx.fillText('🎨', x + panelWidth / 2 - 20, y + 150);
                    ctx.fillText('🖌️', x + panelWidth / 2 + 20, y + 150);
                } else if (this.selectedStyle === 'minimalist') {
                    ctx.fillText('⚪', x + panelWidth / 2 - 20, y + 150);
                    ctx.fillText('⚫', x + panelWidth / 2 + 20, y + 150);
                }
            }
        }

        // Add title
        ctx.fillStyle = theme.primary;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.selectedStyle.toUpperCase()} STYLE DEMO`, canvas.width / 2, 40);

        // Add story snippet at bottom
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        const maxWidth = canvas.width - 60;
        const words = story.split(' ');
        let line = '';

        for (let i = 0; i < Math.min(words.length, 20); i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                break;
            }
            line = testLine;
        }

        if (line.length > 120) {
            line = line.substring(0, 117) + '...';
        }

        ctx.fillText('Story: ' + line, 30, canvas.height - 30);

        // Convert to data URL
        const imageUrl = canvas.toDataURL();

        // Create comic entry
        const comic = {
            id: Date.now(),
            story: story,
            style: this.selectedStyle,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            isDemo: true
        };

        // Save and display
        this.savedComics.unshift(comic);
        localStorage.setItem('banana_comics', JSON.stringify(this.savedComics));
        this.displayComic(comic);
        this.loadGallery();
        this.setLoadingState(false);
    }

    displayComic(comic) {
        // Hide placeholder, show result
        document.getElementById('comic-placeholder').style.display = 'none';
        document.getElementById('comic-result').style.display = 'block';

        // Set comic data
        document.getElementById('generated-comic').src = comic.imageUrl;
        document.getElementById('story-text').textContent = comic.story;
        document.getElementById('style-badge').textContent = comic.style + (comic.isDemo ? ' (Demo)' : '');

        // Store current comic for download
        this.currentComic = comic;
    }

    setLoadingState(loading) {
        const generateBtn = document.getElementById('generate-btn');
        const statusMessage = document.getElementById('status-message');

        if (loading) {
            generateBtn.disabled = true;
            generateBtn.textContent = '🎨 Generating...';
            statusMessage.style.display = 'block';
        } else {
            generateBtn.disabled = false;
            generateBtn.textContent = '🎨 Generate My Comic Strip';
            statusMessage.style.display = 'none';
        }
    }

    downloadComic() {
        if (!this.currentComic) return;

        const link = document.createElement('a');
        link.download = `comic-${this.currentComic.style}-${Date.now()}.png`;
        link.href = this.currentComic.imageUrl;
        link.click();
    }

    startNewComic() {
        // Clear input and hide result
        document.getElementById('story-input').value = '';
        document.getElementById('comic-result').style.display = 'none';
        document.getElementById('comic-placeholder').style.display = 'flex';
        this.currentComic = null;
    }

    loadGallery() {
        const gallery = document.getElementById('comics-gallery');

        if (this.savedComics.length === 0) {
            gallery.innerHTML = `
                <div class="gallery-placeholder">
                    <p>Your generated comics will appear here</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = this.savedComics.map(comic => `
            <div class="gallery-item" onclick="app.viewComic('${comic.id}')">
                <img src="${comic.imageUrl}" alt="Comic ${comic.id}" loading="lazy">
                <div class="gallery-item-info">
                    <div class="gallery-item-style">${comic.style}${comic.isDemo ? ' (Demo)' : ''}</div>
                    <div class="gallery-item-story">${comic.story}</div>
                </div>
            </div>
        `).join('');
    }

    viewComic(comicId) {
        const comic = this.savedComics.find(c => c.id == comicId);
        if (comic) {
            this.displayComic(comic);
            // Scroll to comic display
            document.querySelector('.output-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateUsageStats() {
        // Update API usage display
        if (this.nanoBananaAPI && this.nanoBananaAPI.rateLimiter) {
            const remaining = this.nanoBananaAPI.rateLimiter.getRemainingRequests();
            document.getElementById('daily-usage').textContent = `${200 - remaining.daily} / 200`;
            document.getElementById('minute-usage').textContent = `${20 - remaining.perMinute} / 20`;
        } else {
            document.getElementById('daily-usage').textContent = '0 / 200';
            document.getElementById('minute-usage').textContent = '0 / 20';
        }
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ComicGenerator();
});

// Make app globally accessible for HTML onclick handlers
window.app = app;