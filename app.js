// Banana Diary - Main Application JavaScript
class BananaDiary {
    constructor() {
        this.currentUser = null;
        this.currentEntries = [];
        this.currentPage = 1;
        this.entriesPerPage = 6;
        this.apiKey = null;
        this.selectedStyle = 'comic';
        this.nanoBananaAPI = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Google Sign-In callback
        window.handleCredentialResponse = (response) => {
            this.handleGoogleSignIn(response);
        };

        // Diary book click
        document.getElementById('diary-book')?.addEventListener('click', () => {
            this.openDiary();
        });

        // Navigation buttons
        document.getElementById('close-diary-btn')?.addEventListener('click', () => {
            this.closeDiary();
        });

        document.getElementById('new-entry-btn')?.addEventListener('click', () => {
            this.openEntryModal();
        });

        // Modal controls
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.closeEntryModal();
        });

        document.getElementById('close-page-modal')?.addEventListener('click', () => {
            this.closePageModal();
        });

        // Style selection
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectStyle(e.target.dataset.style);
            });
        });

        // Generate comic button
        document.getElementById('generate-comic')?.addEventListener('click', () => {
            this.generateComic();
        });

        // Page navigation
        document.getElementById('prev-page')?.addEventListener('click', () => {
            this.changePage(-1);
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            this.changePage(1);
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Modal backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    checkAuthState() {
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('banana_diary_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDiaryScreen();
            this.loadUserEntries();
        }
    }

    async handleGoogleSignIn(response) {
        try {
            // Decode the JWT token to get user info
            const userInfo = this.parseJwt(response.credential);

            this.currentUser = {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
            };

            // Save user info to localStorage
            localStorage.setItem('banana_diary_user', JSON.stringify(this.currentUser));

            this.showDiaryScreen();
            this.loadUserEntries();
        } catch (error) {
            console.error('Error handling Google Sign-In:', error);
            alert('Sign-in failed. Please try again.');
        }
    }

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    showDiaryScreen() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('diary-screen').classList.add('active');

        // Update user info display
        document.getElementById('user-avatar').src = this.currentUser.picture;
        document.getElementById('user-name').textContent = this.currentUser.name;
    }

    openDiary() {
        document.getElementById('diary-screen').classList.remove('active');
        document.getElementById('pages-screen').classList.add('active');
        this.renderPages();
    }

    closeDiary() {
        document.getElementById('pages-screen').classList.remove('active');
        document.getElementById('diary-screen').classList.add('active');
    }

    openEntryModal() {
        const modal = document.getElementById('entry-modal');
        const dateDisplay = document.getElementById('entry-date');

        // Set today's date
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Clear previous input
        document.getElementById('day-description').value = '';
        this.selectStyle('comic');

        modal.style.display = 'block';
    }

    closeEntryModal() {
        document.getElementById('entry-modal').style.display = 'none';
        document.getElementById('generation-status').style.display = 'none';
    }

    closePageModal() {
        document.getElementById('page-modal').style.display = 'none';
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
        const description = document.getElementById('day-description').value.trim();

        if (!description) {
            alert('Please describe your day before generating a comic!');
            return;
        }

        // Show loading state
        const generateBtn = document.getElementById('generate-comic');
        const statusDiv = document.getElementById('generation-status');

        generateBtn.disabled = true;
        statusDiv.style.display = 'block';

        try {
            // Initialize API if not set
            if (!this.nanoBananaAPI) {
                const apiKey = prompt('Please enter your Google AI Studio API key:');
                if (!apiKey) {
                    throw new Error('API key is required');
                }
                this.nanoBananaAPI = new NanoBananaAPI(apiKey);
            }

            const result = await this.nanoBananaAPI.generateComic(description, this.selectedStyle);
            const comicImageUrl = result.imageUrl;

            // Create new entry
            const entry = {
                id: Date.now(),
                date: new Date().toISOString(),
                description: description,
                style: this.selectedStyle,
                imageUrl: comicImageUrl,
                userId: this.currentUser.id
            };

            // Save entry
            this.saveEntry(entry);
            this.currentEntries.unshift(entry);

            // Close modal and refresh view
            this.closeEntryModal();
            this.renderPages();

            alert('Your comic strip has been created! 🎨');

        } catch (error) {
            console.error('Error generating comic:', error);

            // Fallback to placeholder for demo purposes
            if (error.message.includes('API') || error.message.includes('rate limit')) {
                const confirmation = confirm('API error occurred. Would you like to create a placeholder comic for demo purposes?');
                if (confirmation) {
                    const comicImageUrl = this.generatePlaceholderImage(description, this.selectedStyle);

                    const entry = {
                        id: Date.now(),
                        date: new Date().toISOString(),
                        description: description,
                        style: this.selectedStyle,
                        imageUrl: comicImageUrl,
                        userId: this.currentUser.id,
                        isPlaceholder: true
                    };

                    this.saveEntry(entry);
                    this.currentEntries.unshift(entry);
                    this.closeEntryModal();
                    this.renderPages();

                    alert('Demo comic created! 🎨 (Replace with real API key for actual AI generation)');
                } else {
                    alert('Comic generation cancelled.');
                }
            } else {
                alert('Failed to generate comic. Please try again.');
            }
        } finally {
            generateBtn.disabled = false;
            statusDiv.style.display = 'none';
        }
    }

    // Method removed - now using NanoBananaAPI class from api-integration.js

    generatePlaceholderImage(description, style) {
        // Generate a placeholder image using canvas for demo purposes
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Style-based color schemes
        const colorSchemes = {
            comic: { bg: '#FFE066', text: '#2C3E50', accent: '#E74C3C' },
            ghibli: { bg: '#A8E6CF', text: '#2C3E50', accent: '#88D8A3' },
            superhero: { bg: '#3498DB', text: '#FFFFFF', accent: '#F39C12' },
            disney: { bg: '#FFB6C1', text: '#8B4513', accent: '#FF69B4' },
            manga: { bg: '#F8F8F8', text: '#2C3E50', accent: '#95A5A6' }
        };

        const colors = colorSchemes[style] || colorSchemes.comic;

        // Draw background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw comic panels
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 3;

        // 4 panels
        for (let i = 0; i < 4; i++) {
            const x = (i * 190) + 20;
            const y = 20;
            const width = 180;
            const height = 360;

            ctx.strokeRect(x, y, width, height);

            // Add panel number
            ctx.fillStyle = colors.accent;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${i + 1}`, x + width / 2, y + height / 2);
        }

        // Add title
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${style.toUpperCase()} STYLE COMIC`, 20, 400 - 10);

        // Add description (truncated)
        ctx.font = '12px Arial';
        const truncatedDesc = description.length > 60 ? description.substring(0, 60) + '...' : description;
        ctx.fillText(truncatedDesc, 20, 400 - 30);

        return canvas.toDataURL();
    }

    saveEntry(entry) {
        // Save to localStorage (in production, you'd save to a database)
        const storageKey = `diary_entries_${this.currentUser.id}`;
        const existingEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingEntries.push(entry);
        localStorage.setItem(storageKey, JSON.stringify(existingEntries));
    }

    loadUserEntries() {
        const storageKey = `diary_entries_${this.currentUser.id}`;
        this.currentEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
        this.currentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderPages() {
        const grid = document.getElementById('pages-grid');
        const startIndex = (this.currentPage - 1) * this.entriesPerPage;
        const endIndex = startIndex + this.entriesPerPage;
        const pageEntries = this.currentEntries.slice(startIndex, endIndex);

        if (pageEntries.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>📝 Your diary is empty</h3>
                    <p>Start creating your visual memories by adding your first entry!</p>
                    <button onclick="app.openEntryModal()" class="new-entry-btn">Create First Entry</button>
                </div>
            `;
        } else {
            grid.innerHTML = pageEntries.map(entry => `
                <div class="diary-page" onclick="app.viewPage('${entry.id}')">
                    <div class="page-date">${new Date(entry.date).toLocaleDateString()}</div>
                    <img src="${entry.imageUrl}" alt="Comic Strip" class="comic-preview" loading="lazy">
                    <div class="page-preview">${entry.description}</div>
                    <div class="page-style">${entry.style}</div>
                </div>
            `).join('');
        }

        this.updateNavigation();
    }

    updateNavigation() {
        const totalPages = Math.ceil(this.currentEntries.length / this.entriesPerPage);

        document.getElementById('page-info').textContent =
            `Page ${this.currentPage} of ${Math.max(1, totalPages)}`;

        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= totalPages;
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.currentEntries.length / this.entriesPerPage);
        const newPage = this.currentPage + direction;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderPages();
        }
    }

    viewPage(entryId) {
        const entry = this.currentEntries.find(e => e.id == entryId);
        if (!entry) return;

        document.getElementById('page-date').textContent =
            new Date(entry.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        document.getElementById('comic-image').src = entry.imageUrl;
        document.getElementById('original-text').textContent = entry.description;
        document.getElementById('comic-style-display').textContent = entry.style;

        document.getElementById('page-modal').style.display = 'block';
    }

    logout() {
        localStorage.removeItem('banana_diary_user');
        localStorage.removeItem(`diary_entries_${this.currentUser.id}`);
        this.currentUser = null;
        this.currentEntries = [];

        document.getElementById('pages-screen').classList.remove('active');
        document.getElementById('diary-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BananaDiary();
});

// Make app globally accessible for HTML onclick handlers
window.app = app;
