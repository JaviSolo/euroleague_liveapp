import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "euroleague_api", "src"))


from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from scrapper.scrapper import get_live_matches, get_match_details
from euroleague_api_wrappers.standings_wrapper import get_euroleague_standings
from euroleague_api_wrappers.scheduled_games_wrapper import get_scheduled_matches
from euroleague_api_wrappers.played_matches_wrapper import get_played_matches, get_all_played_matches
from euroleague_api_wrappers.season_utils import get_current_season_code, get_latest_round

from live_cache_manager import (
    get_cached_live_matches,
    get_cached_match_details,
    start_background_scrapper,
    get_last_updated_time,
)

# Inicializa la aplicación Flask
app = Flask(__name__, template_folder="frontend", static_folder="static")
CORS(app)

@app.route('/')
def home():
    return render_template("index.html")

@app.route("/api/current_round")
def current_round():
    try:
        season = get_current_season_code()
        round_number = get_latest_round(season)
        return jsonify({"round": round_number})
    except Exception as e:
        print("❌ Error fetching current round:", e)
        return jsonify({"error": "Could not fetch round"}), 500
    
@app.route("/api/all_played_matches", methods=["GET"])
def api_all_played_matches():
    try:
        matches = get_all_played_matches()
        return jsonify(matches)
    except Exception as e:
        print(f"❌ Error en /api/all_played_matches: {e}")
        return jsonify([]), 500


@app.route("/api/played_matches", methods=["GET"])
def api_played_matches():
    try:
        round_param = request.args.get("round", default=None, type=int)
        matches = get_played_matches(round=round_param)
        return jsonify(matches)
    except Exception as e:
        print(f"❌ Error en /api/played_matches: {e}")
        return jsonify([]), 500



@app.route("/api/live_matches", methods=["GET"])
def api_live_matches():
    data = get_cached_live_matches()
    last_updated = get_last_updated_time()
    print("🟡 FLASK accede a cache. Tamaño:", len(data))
    return jsonify({
        "last_updated": last_updated,
        "matches": data
    })
           


@app.route("/api/match_details")
def api_match_details():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    data = get_cached_match_details(url)
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "No cached details for this match"}), 404


@app.route("/api/euroleague_standings")
def euroleague_standings():
    standings = get_euroleague_standings()
    return jsonify(standings)

@app.route("/api/scheduled_matches", methods=["GET"])
def scheduled_matches():
    # Obtener el parámetro "round" de la query string
    round_param = request.args.get("round", default=None, type=int)
    
    try:
        # Si el parámetro de round está presente, lo pasamos al wrapper
        if round_param:
            matches = get_scheduled_matches(round=round_param)
        else:
            # Si no se pasa ningún parámetro, devolvemos todos los partidos programados
            matches = get_scheduled_matches()
        
        return jsonify(matches)
    
    except Exception as e:
        print(f"❌ Error en /api/scheduled_matches: {e}")
        return jsonify([]), 500

# ✅ Lanza el hilo del scrapper dentro del main
if __name__ == "__main__":
    start_background_scrapper()
    app.run(debug=True, host="0.0.0.0", port=5000)
