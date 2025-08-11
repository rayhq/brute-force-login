from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = "supersecretkey"

# Allow CORS requests from Vite dev server (5173) with credentials
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

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

@app.route("/api/me", methods=["GET"])
def api_me():
    username = session.get("username")
    if username:
        return jsonify({"logged_in": True, "username": username})
    else:
        return jsonify({"logged_in": False}), 401

@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("username", None)
    return jsonify({"success": True, "message": "Logged out"})

@app.route("/api/attempts", methods=["GET"])
def api_attempts():
    # Only admin can view the attempts via API
    if session.get("username") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(attempts)

@app.route("/attempts")
def show_attempts():
    # Only admin can view the attempts via HTML
    if session.get("username") != "admin":
        return "Unauthorized", 403
    return render_template("ip_details.html", attempts=attempts)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
