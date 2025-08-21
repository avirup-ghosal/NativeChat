# React Native Chat App
## Overview
A real-time 1:1 chat app built with React Native (Expo) frontend and Node.js (Express + Socket.IO) backend. Users can register, log in, view other users, and chat in real time.
## Set up and run
### Backend
1. Navigate to backend folder:
```bash
cd backend
```
2. Install dependencies
```bash
npm install
```
3. Create a .env file
```text
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
PORT=5000
```
4. Start the server:
```bash
node server.js
```
### Frontend
1. Navigate to project folder:
```bash
cd app
```
2. Install dependencies:
```bash
npm install
```
3. Start Expo:
```bash
npx expo start
```
4. Open the web viewer by pressing the w key in the command line

### You can create your own test chat users by registering multiple timmes into the app. Also make sure you have mongodb installed.

