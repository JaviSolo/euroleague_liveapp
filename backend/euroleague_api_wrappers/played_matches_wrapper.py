from euroleague_api.EuroLeagueData import EuroLeagueData
from euroleague_api_wrappers.season_utils import get_current_season_code, get_latest_round
import traceback
from datetime import datetime

def get_played_matches(round=None):
    """
    Devuelve los partidos jugados de la ronda especificada.
    Si no se pasa ronda, devuelve los partidos jugados de la última ronda completada.
    """
    try:
        season = get_current_season_code()
        round_number = round or get_latest_round(season)
        print(f"📅 Temporada: {season}-{season+1}, Ronda solicitada: {round_number}")

        euro = EuroLeagueData(competition="E")
        df = euro.get_game_metadata_season(season)

        print(f"🔍 Total de partidos descargados: {len(df)}")
        print("📋 Columnas:", df.columns.tolist())

        # Filtra la ronda especificada
        round_df = df[df["gameday"] == round_number]
        print(f"🌟 Partidos en la ronda {round_number}: {len(round_df)}")

        # Filtra partidos ya jugados
        played_df = round_df[round_df["played"] == True]
        print(f"✅ Partidos jugados en esa ronda: {len(played_df)}")

        result = []
        for _, row in played_df.iterrows():
            # Extrae fecha y hora
            date_str = row.get("date", "")
            time_str = row.get("time", "")
            try:
                dt = datetime.strptime(f"{date_str} {time_str}", "%b %d, %Y %H:%M")
                datetime_str = dt.strftime("%Y-%m-%d %H:%M")
            except Exception:
                datetime_str = "Invalid Date"

            arena_name = row.get("location", "Unknown Arena")

            result.append({
                "home_team": row["hometeam"],
                "away_team": row["awayteam"],
                "home_score": row["homescore"],
                "away_score": row["awayscore"],
                "round": row["gameday"],
                "arena": arena_name,
                "datetime": datetime_str,
                "status": "Finished"
            })

        return result

    except Exception as e:
        print(f"❌ Error al obtener partidos jugados: {e}")
        traceback.print_exc()
        return []

def get_all_played_matches():
    """
    Devuelve todos los partidos que ya han sido jugados en la temporada actual, con su número de ronda.
    """
    try:
        season = get_current_season_code()
        euro = EuroLeagueData(competition="E")
        df = euro.get_game_metadata_season(season)

        played_df = df[df["played"] == True]

        result = []
        for _, row in played_df.iterrows():
            date_str = row.get("date", "")
            time_str = row.get("time", "")
            try:
                dt = datetime.strptime(f"{date_str} {time_str}", "%b %d, %Y %H:%M")
                datetime_str = dt.strftime("%Y-%m-%d %H:%M")
            except Exception:
                datetime_str = "Invalid Date"

            arena_name = row.get("location", "Unknown Arena")

            result.append({
                "home_team": row["hometeam"],
                "away_team": row["awayteam"],
                "home_score": row["homescore"],
                "away_score": row["awayscore"],
                "round": row["gameday"],
                "arena": arena_name,
                "datetime": datetime_str,
                "status": "Finished"
            })

        # 🔪 LOGS de depuración
        print("✅ get_all_played_matches ejecutado")
        print("📋 Total partidos devueltos:", len(result))
        print("🧠 Rondas detectadas:", set(r["round"] for r in result))

        return result

    except Exception as e:
        print(f"❌ Error en get_all_played_matches: {e}")
        traceback.print_exc()
        return []
