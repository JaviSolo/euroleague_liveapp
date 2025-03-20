from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

# Configuración de Selenium
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # Ejecutar en segundo plano
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--log-level=3")  # Reducir logs

# Iniciar WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

# URL de la página
url = "https://www.flashscore.com/basketball/greece/elite-league/"
driver.get(url)
time.sleep(5)  # Esperar a que cargue la página

# Buscar la sección de partidos de hoy
try:
    live_section = driver.find_element(By.CLASS_NAME, "leagues--live.contest--leagues")
    matches = live_section.find_elements(By.CLASS_NAME, "event__match")
    
    found_live = False
    
    for match in matches:
        live_status = match.find_elements(By.XPATH, ".//span[@data-state='live']")
        if live_status:
            found_live = True
            teams = match.find_elements(By.CLASS_NAME, "event__participant")
            match_id = match.get_attribute("id")
            
            if teams and match_id:
                team1 = teams[0].text.strip()
                team2 = teams[1].text.strip()
                match_id_clean = match_id.replace("g_3_", "")
                match_url = f"https://www.flashscore.com/match/{match_id_clean}/#/match-summary/match-summary"
                
                print(f"{team1} vs {team2} → {match_url}")

                # Acceder a la página del partido
                driver.get(match_url)
                time.sleep(5)  # Esperar a que cargue la página
                
                # Extraer marcador en vivo
                try:
                    score = driver.find_element(By.CLASS_NAME, "detailScore__wrapper").text
                    print(f"Marcador en vivo: {score}")
                except:
                    print("No se pudo obtener el marcador.")
                
                # Extraer tiempo de juego
                try:
                    time_status = driver.find_element(By.CLASS_NAME, "matchHeader__info").text
                    print(f"Tiempo de juego: {time_status}")
                except:
                    print("No se pudo obtener el tiempo de juego.")
                
                # Extraer eventos en vivo (play-by-play)
                try:
                    events = driver.find_elements(By.CLASS_NAME, "smv__incidentRow")
                    print("Eventos en vivo:")
                    for event in events[:5]:  # Mostrar solo los últimos 5 eventos
                        print(event.text)
                except:
                    print("No se pudieron obtener eventos en vivo.")

    if not found_live:
        print("⚠️ No hay partidos en vivo actualmente.")

except Exception as e:
    print(f"Error al encontrar la sección de partidos: {e}")

# Cerrar navegador
driver.quit()
