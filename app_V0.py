import logging
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS  
import json
from scrapper.scrapper import get_live_matches, get_match_details  # Importing scrapers

# Initialize Flask application
app = Flask(__name__, template_folder="frontend", static_folder="frontend")
CORS(app)  # Enable CORS to allow requests from different origins

# Suppress Flask request logs (only show errors)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Route to render the main page
@app.route('/')
def home():
    return render_template("index.html")  # Load the main HTML page

# API endpoint to fetch live match data in JSON format
@app.route("/api/live_matches", methods=["GET"])
def api_live_matches():
    matches = get_live_matches()  # Scrape live matches
    return jsonify(matches)  # Return match data as JSON

# API endpoint to fetch detailed match data in JSON format
@app.route("/api/match_details", methods=["GET"])
def match_details():
    detail_url = request.args.get("url")  # Get match URL from request parameters
    if not detail_url:
        return jsonify({"error": "No URL provided"}), 400  # Return error if no URL
    details = get_match_details(detail_url)  # Scrape match details
    return jsonify(details)  # Return detailed match data as JSON

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)  # Start Flask server
