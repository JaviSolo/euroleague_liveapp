from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

# Configurar el navegador
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # Ejecutar en segundo plano (sin abrir ventana)
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--log-level=3")  # Para evitar demasiados logs

# Iniciar WebDriver con Chrome
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

# URL de la liga (cambiar según la liga deseada)
url = "https://www.flashscore.com/basketball/europe/euroleague/"
driver.get(url)

# Esperamos unos segundos para que la página cargue dinámicamente
time.sleep(5)

# Buscar todos los partidos
matches = driver.find_elements(By.CLASS_NAME, "event__match")

# Variable para controlar si encontramos partidos en vivo
found_live = False

# Solo mostrar partidos en vivo
for match in matches:
    # Verificamos si el partido tiene el atributo data-state="live"
    live_status = match.find_elements(By.XPATH, ".//span[@data-state='live']")
    
    if live_status:  # Si encontramos el atributo data-state="live"
        found_live = True  # Marcamos que encontramos partidos en vivo
        teams = match.find_elements(By.CLASS_NAME, "event__participant")
        match_id = match.get_attribute("id")  # Obtener ID del partido

        if teams and match_id:
            team1 = teams[0].text.strip()
            team2 = teams[1].text.strip()

            # Construimos la URL del partido
            match_id_clean = match_id.replace("g_3_", "")  # Limpiar el ID
            match_url = f"https://www.flashscore.com/match/{match_id_clean}/#/match-summary/match-summary"

            print(f"{team1} vs {team2} → {match_url}")

# Si no encontramos partidos en vivo, mostramos el mensaje solo una vez
if not found_live:
    print("⚠️ No hay partidos en vivo actualmente.")

# Cerrar Selenium
driver.quit()
