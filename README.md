# aiCo-thinkers Web Platform

Welcome to the source code for the aiCo-thinkers platform. This is a full-stack MERN application (MongoDB, Express, React, Node.js). 

⚠️ IMPORTANT NOTE FOR DEVELOPERS:
To keep the file size small and prevent Operating System conflicts, all `node_modules` and compiled `dist` folders have been removed from this archive. You must run `npm install` to generate fresh, OS-compatible modules before running the app.

---

## 📁 Project Structure

*   /client - The React.js frontend (Built with Vite).
*   /server - The Node.js/Express backend.
*   package.json (Root) - A convenience script for running both frontend and backend simultaneously in local development.

---

## 💻 How to Run Locally (For Development)

If your developers want to test the app on their local computers, follow these steps:

1. Install Root Dependencies:
   Open a terminal in the main root folder and run:
   ```bash
   npm install

Install Server Dependencies:
   cd server
npm install
cd ..

Install Client Dependencies:

Bash
cd client
npm install
cd ..



Start the App:
From the main root folder, run:

Bash
npm run dev

(This will automatically start the backend on port 5000 and the frontend on port 5173).