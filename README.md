# 🪞 Mirror of Truth

> A mirror that does not flatter. Stark philosophical reflections, shaped by tradition, language, tone, and subject.

![Netlify Ready](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=flat-square&logo=netlify)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue?style=flat-square&logo=google)

**Mirror of Truth** is an AI-powered oracle application that provides stark, unflattering, and profound philosophical reflections. Unlike standard AI chatbots that aim to please, this application is designed to deliver raw and thought-provoking truths using the Google Gemini API.

## ✨ Features

- **Interactive 3D UI**: The application features a stunning, interactive 3D mirror that physically "flips" to reveal your generated reflection on its dark, glassmorphic backface.
- **Powered by Google Gemini**: Leverages `gemini-2.5-flash-lite` (or any compatible Gemini model) to generate lightning-fast, highly contextual philosophical insights.
- **Customizable Oracles**: Choose the tradition (e.g., Stoicism, Nihilism), tone (e.g., Quietly Devastating), and language to tailor the philosophical sting.
- **Fully Responsive**: A responsive layout that seamlessly adapts from desktop widescreen down to a mobile smartphone view without breaking immersion.
- **Netlify Serverless Ready**: Architected to run flawlessly on Netlify using `serverless-http`.

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- A [Google Gemini API Key](https://aistudio.google.com/)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tars2927/mirrorU.git
   cd mirrorU
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash-lite # Optional
   PORT=3000 # Optional
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## ☁️ Deploying to Netlify

This project is pre-configured for seamless deployment to Netlify via Netlify Functions.

1. Push your repository to GitHub.
2. Go to your [Netlify Dashboard](https://app.netlify.com) and click **Add new site** -> **Import an existing project**.
3. Select this repository. Netlify will automatically detect the settings provided in `netlify.toml`.
4. Go to **Site Configuration** > **Environment Variables** in Netlify.
5. Add a new variable: `GEMINI_API_KEY` and set it to your real API key.
6. Click **Deploy**!

---
*Built with Express.js, Vanilla HTML/CSS/JS, and Google Generative AI.*
