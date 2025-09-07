// Simplified Banana Comic Strip Generator
class ComicGenerator {
    constructor() {
        this.selectedStyle = 'comic';
        this.nanoBananaAPI = null;
        this.savedComics = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAPI();
        this.loadGallery();
        this.updateUsageStats();
    }

    initializeAPI() {
        // API calls now go through backend proxy - no frontend API key needed
        this.nanoBananaAPI = new NanoBananaAPI(null);
        console.log('API proxy initialized successfully');
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

            // Frame the comic
            const framedImageUrl = await this.frameComic(result.imageUrl);

            // Create comic entry
            const comic = {
                id: Date.now(),
                story: storyInput,
                style: this.selectedStyle,
                imageUrl: framedImageUrl,
                originalImageUrl: result.imageUrl,
                createdAt: new Date().toISOString()
            };

            // Save comic to backend
            await this.saveComicToBackend(comic);
            this.savedComics.unshift(comic);

            // Display result
            this.displayComic(comic);
            this.loadGallery();
            this.incrementUsageStats(); // Increment and update usage stats

            // Reset loading state
            this.setLoadingState(false);

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

    async generateDemoComic(story) {
        // Create a demo comic using canvas with 2x2 grid format
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
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

        // Frame the comic
        const framedImageUrl = await this.frameComic(imageUrl);

        // Create comic entry
        const comic = {
            id: Date.now(),
            story: story,
            style: this.selectedStyle,
            imageUrl: framedImageUrl,
            originalImageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            isDemo: true
        };

        // Save and display
        await this.saveComicToBackend(comic);
        this.savedComics.unshift(comic);
        this.displayComic(comic);
        this.loadGallery();
        this.incrementUsageStats(); // Increment usage for demo comics too
        this.setLoadingState(false);
    }

    async frameComic(comicImageUrl) {
        return new Promise((resolve) => {
            // Load the custom frame
            const frameImg = new Image();
            frameImg.onload = () => {
                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = frameImg.width;
                frameCanvas.height = frameImg.height;
                const ctx = frameCanvas.getContext('2d');

                // Draw the frame first
                ctx.drawImage(frameImg, 0, 0);

                // Load and position the comic image
                const comicImg = new Image();
                comicImg.onload = () => {
                    // Calculate the inner area where the comic should go
                    // Make the comic much larger to fill more of the frame
                    const frameSize = frameImg.width;
                    const comicSize = frameSize * 0.85; // Increased from 0.7 to 0.85 for much bigger comic
                    const comicOffset = (frameSize - comicSize) / 2;

                    // Draw the comic centered in the frame
                    ctx.drawImage(comicImg, comicOffset, comicOffset, comicSize, comicSize);

                    // Convert to data URL
                    const framedDataUrl = frameCanvas.toDataURL('image/png', 0.95);
                    resolve(framedDataUrl);
                };

                comicImg.onerror = () => {
                    // If comic fails to load, return frame only
                    resolve(frameCanvas.toDataURL('image/png', 0.95));
                };

                comicImg.src = comicImageUrl;
            };

            frameImg.onerror = () => {
                // If frame fails to load, return original comic
                resolve(comicImageUrl);
            };

            frameImg.src = './frame/FRAME.png';
        });
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
            generateBtn.textContent = '🎨 Generate My Strip';
            statusMessage.style.display = 'none';
        }
    }

    downloadComic() {
        if (!this.currentComic) return;

        const link = document.createElement('a');
        link.download = `banana-comic-${this.currentComic.style}-${Date.now()}.png`;
        link.href = this.currentComic.imageUrl; // This is already the framed version
        link.click();
    }

    startNewComic() {
        // Clear input and hide result
        document.getElementById('story-input').value = '';
        document.getElementById('comic-result').style.display = 'none';
        document.getElementById('comic-placeholder').style.display = 'flex';
        this.currentComic = null;
    }

    async loadGallery() {
        // Load comics from backend
        await this.loadComicsFromBackend();

        const gallery = document.getElementById('comics-gallery');

        if (this.savedComics.length === 0) {
            gallery.innerHTML = `
                <div class="gallery-placeholder">
                    <p>generated comics will appear here</p>
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

    async saveComicToBackend(comic) {
        try {
            const response = await fetch('/api/comics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    story: comic.story,
                    style: comic.style,
                    imageUrl: comic.imageUrl,
                    createdAt: comic.createdAt
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save comic');
            }

            const result = await response.json();
            console.log('Comic saved successfully:', result);
        } catch (error) {
            console.error('Error saving comic to backend:', error);
            // Fallback to localStorage if backend fails
            const localComics = JSON.parse(localStorage.getItem('banana_comics_fallback') || '[]');
            localComics.unshift(comic);
            localStorage.setItem('banana_comics_fallback', JSON.stringify(localComics));
        }
    }

    async loadComicsFromBackend() {
        try {
            const response = await fetch('/api/comics');

            if (!response.ok) {
                throw new Error('Failed to load comics');
            }

            const result = await response.json();
            this.savedComics = result.comics || [];
        } catch (error) {
            console.error('Error loading comics from backend:', error);
            // Fallback to localStorage
            this.savedComics = JSON.parse(localStorage.getItem('banana_comics_fallback') || '[]');
        }
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
        // Get today's usage count from localStorage
        const today = new Date().toDateString();
        const usageKey = `banana_usage_${today}`;
        const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');

        document.getElementById('daily-usage').textContent = `${todayUsage} / 200`;
    }

    incrementUsageStats() {
        // Increment today's usage count
        const today = new Date().toDateString();
        const usageKey = `banana_usage_${today}`;
        const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');
        const newUsage = currentUsage + 1;

        localStorage.setItem(usageKey, newUsage.toString());

        // Clean up old usage data (keep only last 7 days)
        this.cleanupOldUsageData();

        // Update display
        this.updateUsageStats();
    }

    cleanupOldUsageData() {
        const today = new Date();
        const cutoffDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

        // Get all localStorage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('banana_usage_')) {
                const dateStr = key.replace('banana_usage_', '');
                const keyDate = new Date(dateStr);
                if (keyDate < cutoffDate) {
                    keysToRemove.push(key);
                }
            }
        }

        // Remove old keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ComicGenerator();
});

// Make app globally accessible for HTML onclick handlers
window.app = app;