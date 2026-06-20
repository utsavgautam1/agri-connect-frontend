# Agri-Connect

Agri-Connect is a mobile application built to help Nepali farmers access real-time agricultural information, including weather forecasts and market prices, in a simple and accessible interface.

## Features

- **Weather Updates** — Real-time weather forecasts to help farmers plan their activities
- **Market Prices** — Up-to-date crop and commodity prices
- **Multi-language Support (i18n)** — Built for accessibility across language preferences
- **Dark Mode** — Comfortable viewing in all lighting conditions
- **User Settings** — Personalized app configuration

## Tech Stack

**Frontend**
- React Native (Expo)
- Redux for state management

**Backend**
- Flask (Python)
- MongoDB Atlas
- Hosted on Render

## Getting Started

### Prerequisites

- Node.js installed
- Expo CLI (`npm install -g expo-cli`)
- A `.env` file configured (see `.env.example` for required variables)

### Installation

```bash
# Clone the repository
git clone https://github.com/utsavgautam1/agri-connect-frontend.git
cd agri-connect-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then fill in the required values in .env

# Start the development server
npx expo start
```

## Project Structure

```
Agri-Connect-FrontEnd/
├── assets/          # Images, fonts, and other static assets
├── src/             # Source code (screens, components, redux, etc.)
├── App.js           # App entry point
├── AnimatedSplashScreen.js
├── app.json         # Expo configuration
├── babel.config.js
└── package.json
```

## Backend

This frontend connects to a Flask-based backend with MongoDB Atlas for data storage, deployed on Render. (Link to backend repository, if separate.)

## Author

**Utsav Gautam**
[GitHub](https://github.com/utsavgautam1)

## License

This project is currently unlicensed. Add a license if you intend to open-source it.
