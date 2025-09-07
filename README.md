# 🍌 Banana Diary

Transform your daily memories into beautiful comic strips using Google's Nano Banana API (Gemini 2.5 Flash Image)!

## 🎯 Features

- **Google Sign-In Authentication**: Secure login with your Google account
- **Interactive Diary Interface**: Beautiful book-like interface that opens to reveal your memories
- **AI-Powered Comic Generation**: Transform text descriptions into stunning comic strips
- **Multiple Art Styles**: Choose from Comic Book, Studio Ghibli, Superhero, Disney, and Manga styles
- **Personal Memory Pages**: Each day gets its own page with your custom comic strip
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sign-In API
   - Create OAuth 2.0 credentials for web application
   - Add your domain to authorized origins

2. **Google AI Studio API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Generate an API key for Gemini 2.5 Flash Image
   - Keep this key secure - you'll enter it when generating comics

### Installation

1. **Clone or download this repository**
```bash
git clone https://github.com/yourusername/banana-diary.git
cd banana-diary
```

2. **Configure Google OAuth**:
   - Open `config.js`
   - Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID
   
3. **Start the application**:
```bash
# Option 1: Using Python (recommended)
python -m http.server 8000

# Option 2: Using Node.js
npm install
npm run serve

# Option 3: Using any other local server
# Just serve the files from any web server
```

4. **Open your browser**:
   - Navigate to `http://localhost:8000`
   - Sign in with your Google account
   - Start creating your visual diary!

## 🎨 How to Use

1. **Sign In**: Click the Google Sign-In button and authenticate
2. **Open Diary**: Click on the diary book to open it
3. **Create Entry**: Click "New Entry" to describe your day
4. **Choose Style**: Select your preferred comic art style
5. **Generate Comic**: Let AI transform your words into a comic strip
6. **Browse Memories**: Navigate through your visual diary pages

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: Google Sign-In API
- **AI Integration**: Google Gemini 2.5 Flash Image API (Nano Banana)
- **Storage**: LocalStorage (for demo - can be extended to cloud storage)

### Key Features Used from Nano Banana API
- **Text-to-Image Generation**: Converting daily descriptions into comic strips
- **Style Consistency**: Maintaining character and style consistency across panels
- **Multimodal Output**: Generating visual content from textual descriptions

### API Limits
- 20 images per minute
- 200 requests per project per day (free tier)

## 🎯 Hackathon Submission

This project was created for the Google Nano Banana Hackathon, showcasing:

**Innovation & "Wow" Factor (40%)**:
- Unique concept of transforming personal memories into visual comic strips
- Interactive diary interface that feels magical and personal
- Multiple art styles allowing personalized expression

**Technical Execution (30%)**:
- Seamless integration with Gemini 2.5 Flash Image API
- Responsive design with smooth animations
- Proper error handling and user feedback
- Efficient storage and retrieval of user data

**Potential Impact (20%)**:
- Solves the problem of preserving memories in an engaging visual format
- Appeals to journaling enthusiasts, comic lovers, and storytellers
- Educational potential for creative writing and visual storytelling

**Presentation Quality (10%)**:
- Clean, intuitive user interface
- Engaging visual design with smooth interactions
- Clear user flow from login to comic creation

## 🔧 Development

### Project Structure
```
banana-diary/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js             # Main application logic
├── config.js          # Configuration settings
├── package.json       # Project metadata
└── README.md          # This file
```

### Extending the App

**Add Cloud Storage**:
- Replace localStorage with Firebase or similar
- Implement user data synchronization

**Enhanced AI Features**:
- Add character consistency across entries
- Implement story continuation features
- Add collaborative diary entries

**Social Features**:
- Share comic strips with friends
- Create collaborative stories
- Export diary as PDF or video

## 📝 Environment Variables

Create a `.env` file (if implementing backend):
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 🐛 Troubleshooting

**Google Sign-In not working**:
- Ensure your domain is added to authorized origins in Google Cloud Console
- Check that the Client ID in `config.js` is correct
- Make sure you're serving over HTTPS in production

**Comic generation failing**:
- Verify your Gemini API key is valid
- Check you haven't exceeded API rate limits
- Ensure your description is detailed enough for good results

**Images not displaying**:
- Check browser console for CORS errors
- Ensure images are properly base64 encoded
- Verify blob URL creation is working

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini Team for the amazing Nano Banana API
- Google Cloud for authentication services
- The open source community for inspiration and tools

## 🎬 Demo Video

[Link to demo video will be added]

## 🌐 Live Demo

[Link to live demo will be added]

---

Made with ❤️ for the Google Nano Banana Hackathon
