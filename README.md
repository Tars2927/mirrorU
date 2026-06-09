# 🪞 Mirror of Truth

> A mirror that does not flatter. Stark philosophical reflections, shaped by tradition, language, tone, and subject.

![Netlify Ready](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=flat-square&logo=netlify)
![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq-f55036?style=flat-square)

**Mirror of Truth** is an AI-powered oracle application that provides stark, unflattering, and profound philosophical reflections. Unlike standard AI chatbots that aim to please, this application is designed to deliver raw and thought-provoking truths using the ultra-fast Groq API.

## ✨ Features

- **Interactive 3D UI**: The application features a stunning, interactive 3D mirror that physically "flips" to reveal your generated reflection on its dark, glassmorphic backface.
- **Powered by Groq & Llama 3**: Leverages `llama-3.1-8b-instant` (or any compatible Groq model) to generate lightning-fast, highly contextual philosophical insights instantly.
- **Customizable Oracles**: Choose the tradition (e.g., Stoicism, Nihilism), tone (e.g., Quietly Devastating), and language to tailor the philosophical sting.
- **Fully Responsive**: A responsive layout that seamlessly adapts from desktop widescreen down to a mobile smartphone view without breaking immersion.
- **Netlify Serverless Ready**: Architected to run flawlessly on Netlify using `serverless-http`.

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- A [Groq API Key](https://console.groq.com/)

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
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.1-8b-instant # Optional
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
5. Add a new variable: `GROQ_API_KEY` and set it to your real API key.
6. Click **Deploy**!

---
*Built with Express.js, Vanilla HTML/CSS/JS, and Groq.*
