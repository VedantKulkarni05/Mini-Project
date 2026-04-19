# College Helpdesk Chatbot

This is a college miniproject developed as a mobile-first campus assistant. It provides a simple chat interface for students and visitors to get quick information about college departments, admissions, fees, and other campus-related queries.

## Project Description

The GESCOE-Assist Helpdesk is a lightweight, frontend-driven chatbot built using vanilla web technologies. It features a modern dark-themed interface with glassmorphism aesthetics and animated background elements. The chatbot uses a keyword-based intent system to provide instant responses and suggestions.

## Key Features

- Mobile-first responsive design.
- Dynamic background and entrance animations.
- Animated typing indicator for improved user feedback.
- Keyword-based response matching from JSON data.
- Built-in fallback responses for unknown queries.
- Time-based greetings for a personalized experience.
- Quick topic cards for common campus inquiries.

## Technical Stack

- Frontend: HTML5, CSS3 (Vanilla CSS).
- Logic: JavaScript (Vanilla JS).
- Data: JSON-based intent system.

## Setup and Installation

### Local Development

To run this project locally, you can open the index.html file in any modern web browser.

Note: Due to browser security (CORS), fetching local JSON files via the file:// protocol might be restricted in some browsers. It is recommended to use a local development server.

### Using NPM

If you have Node.js installed, you can use the included development server:

1. Install dependencies:
   npm install

2. Start the server:
   npm start

3. Open your browser and navigate to:
   http://localhost:3000

## Project Structure

- index.html: Main entry point and structural layout.
- style.css: Premium mobile-first design and animations.
- script.js: Chatbot logic, DOM handling, and interaction.
- data/intents.json: Dataset containing questions and answers.

## Project Context

This project was created as a miniproject for academic evaluation. It emphasizes UI/UX design and simple client-side logic for real-time interaction.
