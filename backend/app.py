import os
import sqlite3
from flask import Flask, jsonify, request

app = Flask(__name__)
DATABASE = os.environ.get("DATABASE_PATH", "/data/events.db")


def get_db():
    os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                event_date TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT DEFAULT ''
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                participant_name TEXT NOT NULL,
                email TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """)
        db.execute("PRAGMA foreign_keys = ON")


@app.get("/health")
def health():
    return jsonify({"status": "ok", "message": "Event Registration API is running"})


@app.get("/api/events")
def get_events():
    with get_db() as db:
        rows = db.execute("""
            SELECT e.id, e.title, e.event_date, e.location, e.description,
                   COUNT(r.id) AS participant_count
            FROM events e
            LEFT JOIN registrations r ON r.event_id = e.id
            GROUP BY e.id
            ORDER BY e.event_date ASC, e.id DESC
        """).fetchall()
    return jsonify([dict(row) for row in rows])


@app.post("/api/events")
def create_event():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    event_date = str(data.get("event_date", "")).strip()
    location = str(data.get("location", "")).strip()
    description = str(data.get("description", "")).strip()

    if not title or not event_date or not location:
        return jsonify({"error": "Event title, date and location are required."}), 400

    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO events (title, event_date, location, description) VALUES (?, ?, ?, ?)",
            (title, event_date, location, description)
        )
        event_id = cursor.lastrowid
    return jsonify({"message": "Event created successfully.", "id": event_id}), 201


@app.delete("/api/events/<int:event_id>")
def delete_event(event_id):
    with get_db() as db:
        db.execute("PRAGMA foreign_keys = ON")
        cursor = db.execute("DELETE FROM events WHERE id = ?", (event_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Event not found."}), 404
    return jsonify({"message": "Event and its registrations deleted."})


@app.get("/api/events/<int:event_id>/registrations")
def get_registrations(event_id):
    with get_db() as db:
        event = db.execute("SELECT id FROM events WHERE id = ?", (event_id,)).fetchone()
        if event is None:
            return jsonify({"error": "Event not found."}), 404
        rows = db.execute("""
            SELECT id, participant_name, email, created_at
            FROM registrations
            WHERE event_id = ?
            ORDER BY id DESC
        """, (event_id,)).fetchall()
    return jsonify([dict(row) for row in rows])


@app.post("/api/events/<int:event_id>/registrations")
def register_participant(event_id):
    data = request.get_json(silent=True) or {}
    name = str(data.get("participant_name", "")).strip()
    email = str(data.get("email", "")).strip()

    if not name or not email:
        return jsonify({"error": "Participant name and email are required."}), 400
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Please enter a valid email address."}), 400

    with get_db() as db:
        event = db.execute("SELECT id FROM events WHERE id = ?", (event_id,)).fetchone()
        if event is None:
            return jsonify({"error": "Event not found."}), 404
        cursor = db.execute(
            "INSERT INTO registrations (event_id, participant_name, email) VALUES (?, ?, ?)",
            (event_id, name, email)
        )
        registration_id = cursor.lastrowid

    return jsonify({"message": "Registration completed successfully.", "id": registration_id}), 201


@app.delete("/api/registrations/<int:registration_id>")
def delete_registration(registration_id):
    with get_db() as db:
        cursor = db.execute("DELETE FROM registrations WHERE id = ?", (registration_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Registration not found."}), 404
    return jsonify({"message": "Registration deleted successfully."})


@app.get("/api/stats")
def get_stats():
    with get_db() as db:
        event_count = db.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        registration_count = db.execute("SELECT COUNT(*) FROM registrations").fetchone()[0]
    return jsonify({"events": event_count, "registrations": registration_count})


initialize_database()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
