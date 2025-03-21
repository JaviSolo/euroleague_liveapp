from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from scrapper.scrapper import get_live_matches, get_match_details

# Inicializa la aplicación Flask
app = Flask(__name__, template_folder="frontend", static_folder="static")
CORS(app)

# Ruta principal para mostrar el HTML principal
@app.route('/')
def home():
    return render_template("index.html")

# Ruta que renderiza los partidos en vivo en formato HTML (no se está usando actualmente)
@app.route("/live_matches", methods=["GET"])
def live_matches():
    matches = get_live_matches()
    return render_template("live_matches.html", matches=matches)

# API que devuelve partidos en vivo como JSON
@app.route("/api/live_matches", methods=["GET"])
def api_live_matches():
    matches = get_live_matches()
    return jsonify(matches)

# API que devuelve detalles de un partido específico
@app.route("/api/match_details", methods=["GET"])
def match_details():
    detail_url = request.args.get("url")
    if not detail_url:
        return jsonify({"error": "No URL provided"}), 400
    details = get_match_details(detail_url)
    return jsonify(details)

# Ejecuta la app en modo debug (localhost)
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
