from euroleague_api.src.euroleague_api.standings import Standings
from euroleague_api_wrappers.season_utils import get_current_season_code, get_latest_round

def get_euroleague_standings():
    try:
        season = get_current_season_code()
        round_number = get_latest_round(season)

        if round_number is None:
            print("❌ No se pudo determinar la ronda actual.")
            return []

        print(f"📊 Obteniendo standings de la temporada {season}-{season+1}, ronda {round_number}")

        standings_api = Standings()  # Por defecto usa "E" para Euroleague
        df = standings_api.get_standings(season=season, round_number=round_number)

        data = df.to_dict(orient="records")
        return data

    except Exception as e:
        print(f"❌ Error al obtener standings de la Euroliga: {e}")
        return []
