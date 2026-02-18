# Travel Planner App 

A fullstack web application for planning trips, managing travel details, and tracking expenses.
The system allows users to organize trips, monitor costs, manage tasks, and view travel history in one place.

This project demonstrates fullstack development using a modern React frontend and a Node.js backend with REST API architecture.

## Features

* Create and manage trips
* View trip history (past trips)
* Track expenses per trip
* Add, edit, and delete expenses
* TODO list for each trip
* Full CRUD operations
* Calendar integration (currently in development)

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* REST API

## Project Structure

travel-app/
│
├── frontend/   # React + Vite client application
└── backend/    # Node.js + Express server

## Run Locally

### 1️) Clone the repository
git clone https://github.com/IdanOshri98/travel-planner-app.git
cd travel-planner-app

### 2️) Run Backend Server
cd backend
npm install
node src/server.js

The backend runs on:  http://localhost:5000

### 3) Run Frontend Application

Open a new terminal:
cd frontend
npm install
npm run dev

The frontend runs on:  http://localhost:5173

## 🔌 API Communication
The frontend communicates with the backend using REST API requests.
Make sure the backend server is running before starting the frontend.

## Purpose of the Project

This project was built to practice and demonstrate:

* Fullstack application development
* Client–server architecture
* REST API design
* State management in React
* CRUD operations
* Building scalable project structure

##  Challenges & Learning

* Connecting frontend and backend services
* Managing application state
* Designing reusable components
* Structuring a fullstack project
* Implementing expense tracking logic

## Future Improvements
* Full calendar functionality
* UI/UX improvements
* Authentication system
* Deployment to production environment
* Performance optimizations

## Author
Idan Oshri
Computer Science Graduate — Ben-Gurion University
