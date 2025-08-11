from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = "supersecretkey"

# Allow CORS requests from React dev server with credentials
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Example in-memory users (passwords hashed)
users = {
    "admin": generate_password_hash("password"),
    "alice": generate_password_hash("Winter2025")
}

FLAG = "FLAG{bruteforce_success_123}"
attempts = []

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    u = data.get("username", "")
    p = data.get("password", "")
    ip = request.remote_addr

    success = u in users and check_password_hash(users[u], p)

    # Log the attempt
    attempts.append({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ip": ip,
        "username": u,
        "password": p,
        "success": success
    })

    if success:
        session["username"] = u
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
