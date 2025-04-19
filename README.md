# EstateIQ

A local real estate price prediction web application using MERN stack and machine learning.

## Project Structure

```
EstateIQ/
├── client/                  # React frontend
├── server/                 # Express backend
├── ml-model/              # Python ML components
├── design/                # UI design assets
└── docs/                  # Documentation
```

## Prerequisites

- Node.js v18+
- Python 3.8+
- MongoDB v8.0+
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EstateIQ
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd server
npm install
npm run dev
```

### 4. ML Model Setup

```bash
cd ml-model
pip install -r requirements.txt
```

### 5. Environment Variables

Create `.env` files in both client and server directories:

#### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_CONFIG=your_firebase_config
```

#### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/estateiq
```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000
- MongoDB runs on: mongodb://localhost:27017

## Features

- Google OAuth Authentication
- Real Estate Price Prediction
- Responsive Design
- Local ML Model Integration
- History Tracking

## Tech Stack

- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB
- Authentication: Firebase
- ML: Python (scikit-learn, XGBoost)

## License

MIT 