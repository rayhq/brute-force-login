# Brute Force Login

A full-stack project for security testing login pages using brute force techniques. This project features a Python backend and a React + TypeScript frontend.

## Features

- Python backend for request handling and logic
- React + TypeScript frontend for user interface
- Tailwind CSS for styling
- Example templates for displaying IP details

## Project Structure

brute-force-login/
│
├── backend/ # Python server (Flask/Django)
├── frontend/ # React + TypeScript app (Vite)
│ ├── public/
│ └── src/
├── LICENSE # Project license (MIT)
├── README.md # Project documentation
├── requirements.txt# Python dependencies
└── .gitignore # Ignore files


## Getting Started

### Backend Setup

1. Create and activate a Python virtual environment:
    ```
    python -m venv .venv
    source .venv/bin/activate  # For Unix/Mac
    .venv\Scripts\activate     # For Windows
    ```

2. Install dependencies:
    ```
    pip install -r requirements.txt
    ```

3. Run the backend server:
    ```
    python backend/app.py
    ```

### Frontend Setup

1. Navigate to the frontend directory:
    ```
    cd frontend
    ```

2. Install dependencies:
    ```
    npm install
    ```

3. Start the frontend server:
    ```
    npm run dev
    ```

## Usage

- Navigate to `http://localhost:3000` for the frontend.
- Backend API runs at `http://localhost:5000` (or your configured port).

## Technologies Used

- Python (Flask/Django)
- React
- TypeScript
- Tailwind CSS
- Vite

## Contributing

Pull requests and suggestions welcome! Please fork the repo and submit your PR.

## License

This project is licensed under the [MIT License](./LICENSE).


