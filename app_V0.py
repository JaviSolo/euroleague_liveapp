# app_V0.py

from flask import Flask, jsonify, request
from flask_cors import CORS  # Import flask-cors to handle Cross-Origin requests
import json
# Import both scraper functions: get_live_matches and get_match_details
from scrapper import get_live_matches, get_match_details

# Initialize the Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Home route to verify that the API is running
@app.route('/')
def home():
    return "Euroliga LiveScore API is running."

# Endpoint to provide live matches data
@app.route("/api/live_matches", methods=["GET"])
def live_matches():
    # Call the function to scrape live match data
    matches = get_live_matches()
    # Return the match data as a JSON response with pretty-print formatting
    return app.response_class(
        response=json.dumps(matches, indent=4, ensure_ascii=False, sort_keys=False),
        mimetype="application/json"
    )

# Endpoint to provide detailed match data
@app.route("/api/match_details", methods=["GET"])
def match_details():
    # Retrieve the match detail URL from the query string parameter 'url'
    detail_url = request.args.get("url")
    if not detail_url:
        return jsonify({"error": "No URL provided"}), 400
    # Call the function to scrape detailed match data from the provided URL
    details = get_match_details(detail_url)
    return jsonify(details)

if __name__ == "__main__":
    # Run the application on host 0.0.0.0 to be accessible on the local network, port 5000, with debug mode enabled
    app.run(debug=True, host="0.0.0.0", port=5000)
