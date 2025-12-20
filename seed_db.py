
import requests
from app import app, db
from models import ItemIndex

# Ссылки на данные
URLS = {
    "wf": "https://raw.githubusercontent.com/WFCD/warframe-items/refs/heads/master/data/json/Warframes.json",
    "mods": "https://raw.githubusercontent.com/WFCD/warframe-items/refs/heads/master/data/json/Mods.json",
    "arcanes": "https://raw.githubusercontent.com/WFCD/warframe-items/refs/heads/master/data/json/Arcanes.json"
}

def seed_index():
    with app.app_context():
        # Очищаем таблицу перед обновлением, чтобы не было дублей
        print("Очистка индекса...")
        db.session.query(ItemIndex).delete()
        
        for item_type, url in URLS.items():
            print(f"Скачиваем {item_type}...")
            try:
                data = requests.get(url).json()
                items_batch = []
                
                for item in data:
                    # Проверяем, есть ли имя (игнорируем мусорные данные)
                    if "name" in item:
                        # Некоторые JSON-ы могут содержать дубликаты (скины и т.д.), можно добавить проверки
                        entry = ItemIndex(
                            name=item["name"],
                            item_type=item_type # Записываем, куда вести пользователя (wf/mods/arcanes)
                        )
                        items_batch.append(entry)
                
                db.session.add_all(items_batch)
                print(f"Добавлено {len(items_batch)} записей в категорию {item_type}.")
                
            except Exception as e:
                print(f"Ошибка с {item_type}: {e}")

        db.session.commit()
        print("База данных имен успешно обновлена!")

if __name__ == "__main__":
    seed_index()