# scrapper.py

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from collections import OrderedDict

def create_driver():
    """
    Create and return a headless Chrome webdriver instance.
    """
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")          # Run in headless mode
    options.add_argument("--disable-gpu")       # Disable GPU acceleration
    options.add_argument("--no-sandbox")        # Bypass OS security model
    options.add_argument("--log-level=3")       # Reduce logging output

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def get_live_matches(url="https://www.flashscore.com/basketball/venezuela/superliga/"):
    """
    Scrape live match data from the provided Flashscore URL.
    
    Parameters:
    - url (str): The URL to scrape live matches from.
    
    Returns:
    - list: A list of OrderedDict objects containing match information in the following order:
      team1, team2, score, quarter, minute, url.
    """
    driver = create_driver()
    driver.get(url)
    
    try:
        # Wait until the live matches section is present
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "leagues--live.contest--leagues"))
        )
        # Get the container with live matches
        live_section = driver.find_element(By.CLASS_NAME, "leagues--live.contest--leagues")
        matches = live_section.find_elements(By.CLASS_NAME, "event__match")
    except Exception as e:
        print(f"Error finding live matches section: {e}")
        driver.quit()
        return []
    
    live_matches = []
    
    for match in matches:
        # Check if the match is live by looking for an element with data-state='live'
        live_status = match.find_elements(By.XPATH, ".//span[@data-state='live']")
        if live_status:
            teams = match.find_elements(By.CLASS_NAME, "event__participant")
            score_elements = match.find_elements(By.CLASS_NAME, "event__score")
            match_id = match.get_attribute("id")
            
            if teams and match_id:
                team1 = teams[0].text.strip()
                team2 = teams[1].text.strip()
                # Clean the match ID to construct a valid URL for detailed match data
                match_id_clean = match_id.replace("g_3_", "")
                match_url = f"https://www.flashscore.com/match/{match_id_clean}/#/match-summary/match-summary"
                
                # Default score in case the score elements are not available
                score = "-"  
                if score_elements and len(score_elements) >= 2:
                    score = f"{score_elements[0].text.strip()} - {score_elements[1].text.strip()}"
                
                # Attempt to extract quarter and minute using the 'event__stage--block' class
                quarter = ""
                minute = ""
                time_info_elements = match.find_elements(By.CLASS_NAME, "event__stage--block")
                if time_info_elements:
                    time_text = time_info_elements[0].text.strip()
                    # Expected format: "Q4\n3" (first line: quarter; second line: minute)
                    parts = time_text.split("\n")
                    if len(parts) >= 2:
                        quarter = parts[0].strip()   # e.g., "Q4", "Break", or "Finalizado"
                        minute = parts[1].strip()    # e.g., "3"
                    else:
                        quarter = parts[0].strip()
                    
                    # Format minute to two digits if numeric
                    if minute.isdigit():
                        minute = minute.zfill(2)
                
                # Append the match data in the desired order using OrderedDict
                live_matches.append(OrderedDict([
                    ("team1", team1),
                    ("team2", team2),
                    ("score", score),
                    ("quarter", quarter),
                    ("minute", minute),
                    ("url", match_url)
                ]))
    
    driver.quit()
    return live_matches

def get_match_details(detail_url):
    """
    Scrape detailed match data from the given match summary URL.
    This function extracts quarter scores for home and away teams (excluding the total element),
    total points for each team, and the top 3 player statistics.
    
    Parameters:
    - detail_url (str): The URL of the match details page.
    
    Returns:
    - dict: A dictionary with keys:
        'home_quarter_scores': list of home team scores per quarter,
        'away_quarter_scores': list of away team scores per quarter,
        'home_total': total points for the home team,
        'away_total': total points for the away team,
        'top_player_stats': list of top 3 player statistics (as text)
    """
    driver = create_driver()
    driver.get(detail_url)
    details = {}
    
    try:
        # Wait until any element with the base quarter score class is loaded
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".smh__part"))
        )
    except Exception as e:
        print("Error waiting for match details container:", e)
        driver.quit()
        return {"error": "Match details container not found"}
    
    # Extract quarter scores for the home team (exclude total element)
    try:
        home_elements = driver.find_elements(By.CSS_SELECTOR, ".smh__part.smh__home")
        home_quarter_scores = []
        for elem in home_elements:
            classes = elem.get_attribute("class")
            # Exclude elements that include "smh__score" (the total points element)
            if "smh__part--" in classes and "smh__score" not in classes:
                score_text = elem.text.strip()
                home_quarter_scores.append(score_text)
        details["home_quarter_scores"] = home_quarter_scores
    except Exception as e:
        print("Error extracting home quarter scores:", e)
        details["home_quarter_scores"] = "Not found"
    
    # Extract quarter scores for the away team (exclude total element)
    try:
        away_elements = driver.find_elements(By.CSS_SELECTOR, ".smh__part.smh__away")
        away_quarter_scores = []
        for elem in away_elements:
            classes = elem.get_attribute("class")
            if "smh__part--" in classes and "smh__score" not in classes:
                score_text = elem.text.strip()
                away_quarter_scores.append(score_text)
        details["away_quarter_scores"] = away_quarter_scores
    except Exception as e:
        print("Error extracting away quarter scores:", e)
        details["away_quarter_scores"] = "Not found"
    
    # Extract total points for home team using the specific selector
    try:
        home_total_elem = driver.find_element(By.CSS_SELECTOR, ".smh__part.smh__score.smh__live.smh__home.smh__part--current")
        details["home_total"] = home_total_elem.text.strip()
    except Exception as e:
        print("Error extracting home total points:", e)
        details["home_total"] = "Not found"
    
    # Extract total points for away team using the specific selector
    try:
        away_total_elem = driver.find_element(By.CSS_SELECTOR, ".smh__part.smh__score.smh__live.smh__away.smh__part--current")
        details["away_total"] = away_total_elem.text.strip()
    except Exception as e:
        print("Error extracting away total points:", e)
        details["away_total"] = "Not found"
    
    # Extract top 3 player statistics using the given table cell class selector
    try:
        # Use CSS selector to match the full class string for player statistics cells
        player_cells = driver.find_elements(By.CSS_SELECTOR, ".playerStatsTable__cell.playerStatsTable__participantCell.playerStatsTable__cell--clickable.playerStatsTable__cell--shadow")
        top_player_stats = []
        for cell in player_cells[:3]:
            player_text = cell.text.strip()
            top_player_stats.append(player_text)
        details["top_player_stats"] = top_player_stats
    except Exception as e:
        print("Error extracting top player statistics:", e)
        details["top_player_stats"] = "Not found"
    
    driver.quit()
    return details
