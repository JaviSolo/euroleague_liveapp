from euroleague_api.EuroLeagueData import EuroLeagueData
from euroleague_api_wrappers.season_utils import get_current_season_code, get_latest_round
import traceback

def get_played_matches():
    try:
        season = get_current_season_code()
        round_number = get_latest_round(season)
        print(f"📅 Temporada: {season}-{season+1}, Ronda actual: {round_number}")

        euro = EuroLeagueData(competition="E")
        df = euro.get_game_metadata_season(season)

        print(f"🔍 Total de partidos descargados: {len(df)}")
        print("📋 Columnas:", df.columns.tolist())

        # Filtra la ronda actual
        round_df = df[df["gameday"] == round_number]
        print(f"🎯 Partidos en la ronda {round_number}: {len(round_df)}")

        # Filtra partidos ya jugados
        played_df = round_df[round_df["played"] == True]
        print(f"✅ Partidos jugados en esa ronda: {len(played_df)}")

        result = []
        for _, row in played_df.iterrows():
            result.append({
                "home_team": row["hometeam"],
                "away_team": row["awayteam"],
                "home_score": row["homescore"],
                "away_score": row["awayscore"],
                "status": "Finished"
            })

        return result

    except Exception as e:
        print(f"❌ Error al obtener partidos jugados: {e}")
        traceback.print_exc()
        return []
