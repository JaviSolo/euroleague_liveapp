from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from collections import OrderedDict

def create_driver():
    """
    Creates a headless Selenium WebDriver instance for Chrome.
    """
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode (no UI)
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--log-level=3")  # Suppress logs
    options.add_experimental_option("excludeSwitches", ["enable-logging"])  # Suppress DevTools logs

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def get_live_matches(url="https://www.flashscore.com/basketball/spain/copa-de-la-reina-women/"):
    """
    Scrapes live match data from Flashscore Euroleague page.
    Returns a list of live matches with basic information.
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

                # Obtener el valor del cuarto y el tiempo restante correctamente
                quarter = "N/A"
                time = "N/A"

                quarter_element = match.find_elements(By.CLASS_NAME, "event__stage")
                time_element = match.find_elements(By.CLASS_NAME, "event__stage--block")

                if quarter_element:
                    raw_text = quarter_element[0].text.strip().split("\n")  # Dividir por salto de línea si lo hay
                    quarter = raw_text[0] if len(raw_text) > 0 else "N/A"  # Primer valor es el cuarto
                    time = raw_text[1] if len(raw_text) > 1 else "N/A"  # Segundo valor es el tiempo

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
    Scrapes detailed match data, including quarter scores and top 3 player statistics.
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

     # Extract team names
    details["home_team"] = driver.find_element(By.CLASS_NAME, "smh__home").text.strip()
    details["away_team"] = driver.find_element(By.CLASS_NAME, "smh__away").text.strip()
    
    # Extract quarter scores
    for i in range(1, 6):  # Extract up to 5 periods (including OT)
        home_score = driver.find_elements(By.CLASS_NAME, f"smh__part.smh__home.smh__part--{i}")
        away_score = driver.find_elements(By.CLASS_NAME, f"smh__part.smh__away.smh__part--{i}")
        
        details["home_quarter_scores"].append(home_score[0].text.strip() if home_score else "0")
        details["away_quarter_scores"].append(away_score[0].text.strip() if away_score else "0")

     # Extract total scores
    home_total = driver.find_elements(By.CLASS_NAME, "smh__score.smh__home")
    away_total = driver.find_elements(By.CLASS_NAME, "smh__score.smh__away")
    details["home_total"] = home_total[0].text.strip() if home_total else "0"
    details["away_total"] = away_total[0].text.strip() if away_total else "0"
    
    # Extract top 3 player statistics using the given table cell class selector
    try:
        print("\n========== DEBUG: Iniciando extracción de jugadores ==========")

        # Esperamos hasta que la tabla de jugadores esté presente
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".playerStatsTable"))
        )
        print("DEBUG: La tabla de estadísticas de jugadores ha sido encontrada.")

        # Extraer los nombres de los jugadores
        player_names = driver.find_elements(By.CSS_SELECTOR, 
            ".playerStatsTable__cell.playerStatsTable__participantCell.playerStatsTable__cell--clickable.playerStatsTable__cell--shadow")

        # Extraer los equipos de los jugadores
        player_teams = driver.find_elements(By.CSS_SELECTOR, 
            ".playerStatsTable__cell.playerStatsTable__teamCell")

        # Extraer los puntos de los jugadores
        player_points = driver.find_elements(By.CSS_SELECTOR, 
            ".playerStatsTable__cell.playerStatsTable__cell--sortingColumn")

        print(f"DEBUG: Se encontraron {len(player_names)} nombres de jugadores.")
        print(f"DEBUG: Se encontraron {len(player_teams)} equipos de jugadores.")
        print(f"DEBUG: Se encontraron {len(player_points)} registros de puntos de jugadores.")

        if len(player_names) == 0 or len(player_teams) == 0 or len(player_points) == 0:
            print("ERROR: No se encontraron datos completos de los jugadores. Verifica si la estructura HTML ha cambiado.")

        top_player_stats = []

        for index in range(min(3, len(player_names), len(player_teams), len(player_points))):  # Evitar errores de índice
            player_name = player_names[index].text.strip()
            player_team = player_teams[index].text.strip() if index < len(player_teams) else "Unknown"
            player_point = player_points[index].text.strip() if index < len(player_points) else "0"

            print(f"DEBUG: Jugador {index+1}: {player_name} | Equipo: {player_team} | Puntos: {player_point}")  # Depuración detallada

            top_player_stats.append({
                "name": player_name,
                "team": player_team,
                "points": player_point
            })

        details["top_player_stats"] = top_player_stats

        print("DEBUG: Datos de los jugadores extraídos correctamente.\n")

    except Exception as e:
        print("ERROR AL EXTRAER ESTADÍSTICAS DE LOS JUGADORES:", e)
        print("PUEDE QUE LA PÁGINA HAYA CAMBIADO SU ESTRUCTURA HTML.")
        details["top_player_stats"] = "Not found"

    driver.quit()
    return details
