# Weather Alert App

A modern web application for tracking weather and managing favorite locations, built with Next.js, TypeScript, and OpenWeather APIs.

---

## Table of Contents

- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Architecture Overview](#architecture-overview)
- [Technology Choices & Justifications](#technology-choices--justifications)
- [Known Limitations & Assumptions](#known-limitations--assumptions)
- [Future Improvements](#future-improvements)
- [Deployment](#deployment)

---

## Features

- Search and add locations to favorites
- View current weather and 3-hour forecast for favorite locations
- Detailed weather view for each location
- Responsive, accessible UI
- In-memory caching for weather API responses
- Error handling and custom not-found pages

---

## Setup and Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/kobzarmax/weather_alert_app.git
   cd weather_alert_app
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Environment variables:**

   Create a `.env.local` file in the root directory with the following:

   ```
   OPENWEATHER_API_KEY=your_openweather_api_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   DB_URL=http://localhost:4000 # or your actual DB endpoint
   ```

4. **Run the development server:**

   ```sh
   npm run dev:all
   ```

5. **Run tests:**
   ```sh
   npm test
   ```

---

## Architecture Overview

### 1. **Frontend**

- **Next.js App Router**: Used for routing and server-side rendering.
- **TypeScript**: Ensures type safety across the codebase.
- **Components**: Modular React components for UI (e.g., `LocationCard`, `LocationDetails`, `ThreeDotsMenu`).
- **Pages**:
  - `/` — Main page listing favorite locations.
  - `/[id]` — Dynamic route for detailed location weather.
  - `/not-found` — Custom not found page.

### 2. **API Layer**

- **API Routes**: Located in `src/app/api/weather/`, these proxy requests to OpenWeather APIs and cache responses.
- **Caching**: In-memory cache (`memoryCache.ts`) reduces redundant API calls and improves performance.

### 3. **Data Layer**

- **Favorites**: Stored in a backend database (mocked or real, via REST API at `DB_URL`).
- **Weather Data**: Fetched from OpenWeatherMap using secure API keys.

### 4. **Testing**

- **Jest** and **React Testing Library**: For unit and integration tests.
- **ts-jest**: TypeScript support for Jest.

### 5. **Error Handling**

- Custom error and not-found pages.
- Graceful fallback for failed API calls.

---

## Technology Choices & Justifications

- **Next.js**: Enables hybrid SSR/SSG, fast routing, and API routes in one framework.
- **TypeScript**: Improves code reliability and maintainability.
- **OpenWeatherMap API**: Comprehensive, reliable weather data.
- **React Testing Library & Jest**: Industry-standard testing tools for React apps.
- **Tailwind CSS (if used)**: Rapid, utility-first styling.
- **In-memory caching**: Simple, effective for small-scale or demo apps.

---

## Known Limitations & Assumptions

- **In-memory cache** is not persistent and resets on server restart.
- **Favorites** are assumed to be stored in a backend accessible via REST API (`DB_URL`); no authentication is implemented.
- **API rate limits**: OpenWeatherMap free tier may restrict frequent requests.
- **No offline support**: App requires internet connection.
- **No user authentication**: All users share the same favorites list (unless backend is extended).

---

## Future Improvements

- **Persistent caching** (e.g., Redis) for scalability.
- **User authentication** and per-user favorites.
- **Progressive Web App (PWA)** features for offline access.
- **Improved error handling** and user feedback.
- **Enhanced UI/UX** with animations and accessibility improvements.
- **Localization** for multiple languages.
- **Automated deployment scripts** (see below).

---

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub.
2. Connect to [Vercel](https://vercel.com/) and import the project.
3. Set environment variables in Vercel dashboard.
4. Deploy!

## Scripts

- `npm run dev:all` — Start development server + json-server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm test` — Run tests

---
