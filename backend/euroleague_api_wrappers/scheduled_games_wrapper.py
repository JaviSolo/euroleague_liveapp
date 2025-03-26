import requests
from datetime import datetime
import xml.etree.ElementTree as ET

def get_scheduled_matches_from_api_v1():
    url = "https://api-live.euroleague.net/v1/schedules"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content  # XML
    except Exception as e:
        print(f"❌ Error al obtener datos de la API V1: {e}")
        return None

def parse_scheduled_matches(xml_data):
    root = ET.fromstring(xml_data)
    matches_by_gameday = {}
    now = datetime.now()

    for item in root.findall("item"):
        gameday = int(item.findtext("gameday", default="0"))
        date_str = item.findtext("date")
        time_str = item.findtext("startime")
        try:
            dt = datetime.strptime(f"{date_str} {time_str}", "%b %d, %Y %H:%M")
        except ValueError:
            continue

        match = {
            "home_team": item.findtext("hometeam", ""),
            "away_team": item.findtext("awayteam", ""),
            "arena": item.findtext("arenaname", ""),
            "datetime": dt.strftime("%Y-%m-%d %H:%M")
        }

        if dt > now:
            matches_by_gameday.setdefault(gameday, []).append(match)

    return matches_by_gameday

def get_scheduled_matches():
    xml_data = get_scheduled_matches_from_api_v1()
    if not xml_data:
        return []

    grouped_matches = parse_scheduled_matches(xml_data)
    if not grouped_matches:
        return []

    # Elegimos el gameday más próximo con partidos futuros
    next_gameday = sorted(grouped_matches.keys())[0]
    print(f"📅 Mostrando partidos programados de la jornada {next_gameday}")
    return grouped_matches[next_gameday]
