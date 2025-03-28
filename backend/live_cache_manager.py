import threading
import time

from scrapper.scrapper import get_live_matches, get_match_details
from datetime import datetime


live_match_cache = []
match_details_cache = {}
cache_lock = threading.Lock()
last_updated_timestamp = None

SCRAPE_INTERVAL = 10

def update_cache():
    global live_match_cache, match_details_cache

    while True:
        try:
            start_time = time.time()

            # Fase 1: scrapea solo los partidos
            live_data = get_live_matches()
            with cache_lock:
                live_match_cache = live_data
            print("🔄 Cache partidos actualizada")

            # Fase 2: ahora scrapea los detalles de cada uno
            details_dict = {}
            for match in live_data:
                url = match["url"]
                try:
                    details = get_match_details(url)
                    details_dict[url] = details
                except Exception as e:
                    print(f"❌ Error scraping detalles de {url}: {e}")

            with cache_lock:
                match_details_cache = details_dict
                global last_updated_timestamp
                last_updated_timestamp = datetime.now().strftime('%H:%M:%S')

            print(f"✅ Cache detalles actualizada con {len(details_dict)} partidos")
            print(f"➡️ {len(live_data)} partidos live")
            print(f"🕒 Backend: caché actualizada a las {last_updated_timestamp}")


            print(f"⏱️ Tiempo total scraping: {round(time.time() - start_time, 2)}s")

        except Exception as e:
            print(f"⚠️ Error en update_cache(): {e}")

        time.sleep(SCRAPE_INTERVAL)

def start_background_scrapper():
    scraper_thread = threading.Thread(target=update_cache, daemon=True)
    scraper_thread.start()

def get_cached_live_matches():
    with cache_lock:
        return live_match_cache

def get_cached_match_details(url):
    with cache_lock:
        return match_details_cache.get(url)

def get_last_updated_time():
    with cache_lock:
        return last_updated_timestamp