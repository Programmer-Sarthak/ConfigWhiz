CodeTest - Intelligent Multi-Language Automated Testing Platform
CodeTest is a full-stack, AI-powered Continuous Integration (CI) platform. It allows developers to upload code snippets or full project archives (ZIP), automatically generates professional-grade unit tests using Google Gemini AI, and executes them in secure, isolated Docker containers.
This project solves the problem of "it works on my machine" by providing a standardized, ephemeral testing environment for Python, Java, and JavaScript/Node.js.
🚀 Key Features
🤖 AI-Driven Test Generation: Uses GenAI to analyze code logic and write comprehensive unittest, JUnit, or console.assert test suites automatically.
🐳 Docker Sandboxing: Executes untrusted user code inside isolated Docker containers (python:slim, node:slim, openjdk), ensuring 100% security and consistency.
📦 Project ZIP Runner: Simulates a CI/CD pipeline. Upload a full Node.js or Python project (ZIP), and the system automatically detects dependencies (package.json, requirements.txt), installs them, and runs the test suite.
⚡ Polyglot Support: Seamlessly handles Python, JavaScript, and Java (including smart compilation for Java files).
📊 Real-Time History: Tracks test execution results, logs, and status using Firebase Firestore.
🛠️ Tech Stack
Frontend: React.js, TypeScript, Vite, Bootstrap 5 (Custom Dark Theme), Monaco Editor.
AI Service (Microservice 1): Python FastAPI, Google Gemini 1.5 Flash.
Runner Service (Microservice 2): Python FastAPI, Docker SDK.
Infrastructure: Docker Desktop.
Auth & Database: Firebase Authentication, Cloud Firestore.
📋 Prerequisites
Before running the project, ensure you have the following installed:
Node.js (v16 or higher)
Python (v3.10 or higher)
Docker Desktop (Critical: Must be installed and running)
A Google Gemini API Key (Free to generate here)
⚙️ Installation & Setup Guide
This project uses a Microservices Architecture. You will need to run three separate terminals to start the Frontend, the AI Backend, and the Runner Backend.
1. Clone the Repository
git clone [https://github.com/yourusername/codetest.git](https://github.com/yourusername/codetest.git)
cd codetest


2. Setup AI Backend (Terminal 1)
This service handles the communication with Google Gemini.
Open a terminal and navigate to the folder:
cd test_case_generator


Install dependencies:
pip install -r requirements.txt


Configure API Key: Create a file named .env in this folder and add your key:
GOOGLE_API_KEY=your_actual_api_key_here


Start the server:
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

You should see: Uvicorn running on http://127.0.0.1:8000
3. Setup Runner Backend (Terminal 2)
This service manages Docker containers to run the code securely.
Open a new terminal and navigate to the folder:
cd python_tester_backend


Install dependencies:
pip install -r requirements.txt


Start Docker Desktop on your computer and wait for it to initialize.
Start the server:
uvicorn main:app --host 127.0.0.1 --port 8001 --reload

You should see: Successfully connected to Docker
4. Setup Frontend (Terminal 3)
This is the User Interface.
Open a new terminal and navigate to the folder:
cd project


Install dependencies:
npm install


Start the React app:
npm run dev


