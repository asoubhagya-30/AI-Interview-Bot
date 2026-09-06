# 🤖 AI Interview Bot

An AI-powered interview preparation platform designed to help students and job seekers practice interviews in an interactive environment. The system allows users to upload their resume, generate relevant interview questions, and receive AI-assisted feedback to improve their interview performance.

## 📌 Project Overview

The **AI Interview Bot** simulates an interview experience using Artificial Intelligence. It analyzes the user's resume and generates interview questions based on their skills, education, projects, and experience.

The platform provides a structured way for users to practice technical and behavioral interviews and identify areas where they can improve.

## ✨ Features

* 📄 **Resume Upload**

  * Upload your resume for interview preparation.
  * Extract relevant information from the uploaded resume.

* 🤖 **AI-Generated Questions**

  * Generates interview questions based on the candidate's profile.
  * Supports technical and behavioral interview preparation.

* 💬 **Interactive Interview**

  * Practice answering questions in an interview-style environment.
  * Follow a structured question-and-answer flow.

* 📊 **Performance Evaluation**

  * Analyze interview responses.
  * Receive AI-assisted feedback and suggestions.

* 🎯 **Personalized Preparation**

  * Questions are tailored according to the candidate's resume and skills.

* 🖥️ **User-Friendly Interface**

  * Simple and interactive web interface for interview practice.

## 🛠️ Technologies Used

### Frontend

* React.js
* Vite
* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB / MongoDB Atlas

### AI & NLP

* Google Gemini API
* Natural Language Processing (NLP)
* Resume text extraction

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

## 🏗️ Project Architecture

```text
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │      + Vite          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └───────┬───────┬──────┘
                            │       │
                  ┌─────────┘       └─────────┐
                  ▼                           ▼
          ┌───────────────┐          ┌────────────────┐
          │    MongoDB    │          │  Gemini API    │
          │    Database   │          │   AI Service   │
          └───────────────┘          └────────────────┘
```

## 📂 Project Structure

```text
AI-INTERVIEW-BOT/
│
├── backend/
│   ├── config/
│   ├── firebase/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── app.py
│   ├── interview_ai.py
│   └── package.json
│
├── public/
│
├── src/
│
├── screenshots/
│
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── .gitignore
```


## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

```bash
cd AI-Interview-Bot
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5003
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

**Do not upload your `.env` file to GitHub.**

Make sure `.gitignore` contains:

```gitignore
.env
node_modules/
```

### 5. Start the Backend

```bash
cd backend
npm start
```

If your project uses nodemon:

```bash
npm run dev
```

### 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The Vite development server will provide a local URL, usually:

```text
http://localhost:5173
```

## 🔄 Application Workflow

```text
User
  │
  ▼
Register / Login
  │
  ▼
Upload Resume
  │
  ▼
Resume Processing
  │
  ▼
Extract Skills & Information
  │
  ▼
AI Generates Interview Questions
  │
  ▼
User Answers Questions
  │
  ▼
AI Evaluates Responses
  │
  ▼
Feedback & Performance Analysis
```

## 🔐 Environment Variables

The following environment variables may be required:

| Variable         | Description                        |
| ---------------- | ---------------------------------- |
| `PORT`           | Backend server port                |
| `MONGODB_URI`    | MongoDB database connection string |
| `GEMINI_API_KEY` | Google Gemini API key              |

Never expose API keys, database credentials, or other secrets in the repository.

## 🎯 Objectives

The main objectives of this project are:

* To provide an AI-based interview practice platform.
* To generate personalized interview questions.
* To help users practice technical and behavioral interviews.
* To provide automated feedback on interview responses.
* To improve users' confidence and interview preparation.

## 🚀 Future Enhancements

* 🎙️ Voice-based interview interaction
* 📹 Video interview simulation
* 📈 Advanced performance analytics
* 🧠 Improved personalized question generation
* 🗣️ Speech and pronunciation analysis
* 📊 Interview history and progress tracking
* 📱 Mobile-responsive improvements

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

```bash
cd AI-Interview-Bot
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5003
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

**Do not upload your `.env` file to GitHub.**

Make sure `.gitignore` contains:

```gitignore
.env
node_modules/
```

### 5. Start the Backend

```bash
cd backend
npm start
```

If your project uses nodemon:

```bash
npm run dev
```

### 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The Vite development server will provide a local URL, usually:

```text
http://localhost:5173
```

## 👩‍💻 Developed By

**A Soubhagya**

Information Science & Engineering Student

---

⭐ If you find this project useful, consider giving the repository a star!
