from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from collections import OrderedDict

def create_driver():
    """
    Crea una instancia del WebDriver de Chrome en modo headless.
    """
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--log-level=3")
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def get_live_matches(url="https://www.flashscore.com/basketball/usa/nba/"):
    """
    Scrapea los partidos en vivo de una liga de baloncesto desde Flashscore.
    Devuelve una lista de diccionarios con datos básicos de cada partido.
    """
    driver = create_driver()
    driver.get(url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "leagues--live.contest--leagues"))
        )
        live_section = driver.find_element(By.CLASS_NAME, "leagues--live.contest--leagues")
        matches = live_section.find_elements(By.CLASS_NAME, "event__match")
    except Exception as e:
        print(f"Error finding live matches section: {e}")
        driver.quit()
        return []

    live_matches = []

    for match in matches:
        live_status = match.find_elements(By.XPATH, ".//span[@data-state='live']")
        if live_status:
            teams = match.find_elements(By.CLASS_NAME, "event__participant")
            score_elements = match.find_elements(By.CLASS_NAME, "event__score")
            match_id = match.get_attribute("id")

            if teams and match_id:
                team1 = teams[0].text.strip()
                team2 = teams[1].text.strip()
                match_id_clean = match_id.replace("g_3_", "")
                match_url = f"https://www.flashscore.com/match/{match_id_clean}/#/match-summary/match-summary"

                score = "-"
                if score_elements and len(score_elements) >= 2:
                    score = f"{score_elements[0].text.strip()} - {score_elements[1].text.strip()}"

                # Obtener cuarto y tiempo de juego correctamente
                quarter = ""
                time = ""

                stage_block = match.find_elements(By.CLASS_NAME, "event__stage--block")
                if stage_block:
                    raw_text = stage_block[0].text.strip().split("\n")
                    if len(raw_text) >= 2:
                        quarter = raw_text[0]
                        time = raw_text[1]
                    elif len(raw_text) == 1:
                        quarter = raw_text[0]
                        time = ""

                live_matches.append(OrderedDict([
                    ("team1", team1),
                    ("team2", team2),
                    ("score", score),
                    ("quarter", quarter),
                    ("time", time),
                    ("url", match_url)
                ]))

    driver.quit()
    return live_matches

def get_match_details(detail_url):
    """
    Scrapea los detalles de un partido en vivo (puntos por cuarto, top 3 jugadores, estadísticas básicas por equipo).
    """
    driver = create_driver()
    driver.get(detail_url)
    details = {}

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "smh__part"))
        )
    except Exception as e:
        print("Error waiting for match details container:", e)
        driver.quit()
        return {"error": "Match details container not found"}

    details["home_quarter_scores"] = []
    details["away_quarter_scores"] = []
    details["top_player_stats"] = []
    details["team_statistics"] = []

    # Obtener nombre de los equipos desde el contenedor superior
    try:
        teams = driver.find_elements(By.CLASS_NAME, "event__participant")
        if len(teams) >= 2:
            details["home_team"] = teams[0].text.strip()
            details["away_team"] = teams[1].text.strip()
        else:
            details["home_team"] = "Unknown"
            details["away_team"] = "Unknown"
    except Exception as e:
        print("Error extracting team names:", e)
        details["home_team"] = "Unknown"
        details["away_team"] = "Unknown"

    # Puntos por cuarto (1 a 4 + OT)
    for i in range(1, 6):
        home_score = driver.find_elements(By.CLASS_NAME, f"smh__part.smh__home.smh__part--{i}")
        away_score = driver.find_elements(By.CLASS_NAME, f"smh__part.smh__away.smh__part--{i}")
        details["home_quarter_scores"].append(home_score[0].text.strip() if home_score else "0")
        details["away_quarter_scores"].append(away_score[0].text.strip() if away_score else "0")

    # Puntos totales
    home_total = driver.find_elements(By.CLASS_NAME, "smh__score.smh__home")
    away_total = driver.find_elements(By.CLASS_NAME, "smh__score.smh__away")
    details["home_total"] = home_total[0].text.strip() if home_total else "0"
    details["away_total"] = away_total[0].text.strip() if away_total else "0"

    # Top 3 jugadores (opcional, puede no existir)
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".playerStatsTable"))
        )

        player_names = driver.find_elements(By.CSS_SELECTOR, ".playerStatsTable__cell.playerStatsTable__participantCell.playerStatsTable__cell--clickable.playerStatsTable__cell--shadow")
        player_teams = driver.find_elements(By.CSS_SELECTOR, ".playerStatsTable__cell.playerStatsTable__teamCell")
        player_points = driver.find_elements(By.CSS_SELECTOR, ".playerStatsTable__cell.playerStatsTable__cell--sortingColumn")

        top_players = []
        for i in range(min(3, len(player_names), len(player_teams), len(player_points))):
            top_players.append({
                "name": player_names[i].text.strip(),
                "team": player_teams[i].text.strip(),
                "points": player_points[i].text.strip()
            })

        details["top_player_stats"] = top_players
    except Exception as e:
        details["top_player_stats"] = "Not found"

    # Estadísticas por equipo (Field Goals Attempted, FG%, Rebounds)
    try:
        stats_labels = ["Field Goals Attempted", "Field Goals %", "Total Rebounds"]
        parsed_stats = []

        rows = driver.find_elements(By.CSS_SELECTOR, "[class^='wcl-row_']")
        
        for row in rows:
            try:
                label_elem = row.find_element(By.CSS_SELECTOR, "[data-testid='wcl-statistics-category'] [data-testid='wcl-scores-simpleText-01']")
                label = label_elem.text.strip()

                if label in stats_labels:
                    home_val_elem = row.find_element(By.CSS_SELECTOR, "[class*='wcl-homeValue'] [data-testid='wcl-scores-simpleText-01']")
                    away_val_elem = row.find_element(By.CSS_SELECTOR, "[class*='wcl-awayValue'] [data-testid='wcl-scores-simpleText-01']")
                    home_val = home_val_elem.text.strip()
                    away_val = away_val_elem.text.strip()

                    parsed_stats.append({
                        "label": label,
                        "home": home_val,
                        "away": away_val
                    })

            except Exception as inner_error:
                continue

        if parsed_stats:
            details["team_statistics"] = parsed_stats
        else:
            details["team_statistics"] = "Not found"

    except Exception as e:
        details["team_statistics"] = "Not found"

    driver.quit()
    return details