import requests
from bs4 import BeautifulSoup

url = "https://www.flashscore.com/"
response = requests.get(url)

if response.status_code == 200:
    print("✅ Conexión exitosa a Flashscore")
else:
    print("❌ Error al conectar con Flashscore")
