from flask import Flask, render_template, jsonify
import requests
from sqlalchemy import func
from flask_cors import CORS
from models import db, create_db, WarframeData, ModData, ArcaneData
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///acolyte.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

create_db(app)

CORS(app)

app.location_data = requests.get("https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/refs/heads/master/data/solNodes.json").json()

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/documentation")
def documentation():
    return render_template("documentation.html")

@app.route("/worldState/<event>")
def get_event(event):
    search_event = event.strip()
    event_info = load_json("https://api.warframe.com/cdn/worldState.php")
    if search_event not in event_info:
        return jsonify({"error": "Событие не найдено"}), 404
    return jsonify({
        "event": event_info[search_event],
        "locations": app.location_data
    })

@app.route("/stat/<id>")
def get_stat(id):
    try:
        response = requests.get(f"https://api.warframe.com/cdn/getProfileViewingData.php?playerId={id}", timeout=10)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "Профиль не найден"}), 404

    except Exception as e:
        print(f"Ошибка загрузки {e}")
        return jsonify({"error": "Ошибка сервера"}), 500

@app.route("/arcanes/<arcane>")
def get_arcanes(arcane):
    search_arcane = arcane.strip().lower()

    matches_in_db = db.session.execute(
        db.select(ArcaneData).filter(ArcaneData.name.ilike(f"%{search_arcane}%"))
    ).scalars().all()

    if matches_in_db:
        results = []
        for a in matches_in_db:
            level_stats = [a.level0, a.level1, a.level2, a.level3, a.level4, a.level5]

            while level_stats and level_stats[-1] is None:
                level_stats.pop()
            results.append({
                "name": a.name,
                "category": a.category,
                "type": a.type,
                "rarity": a.rarity,
                "tradable": a.tradable,
                "levelStats": level_stats
            })
        return jsonify(results)
    
    
    data = load_json("https://raw.githubusercontent.com/WFCD/warframe-items/refs/heads/master/data/json/Arcanes.json")
    if not data:
        return jsonify({"error": "Данные мистификаторов недоступны"}), 503

    result = [arcane_info for arcane_info in data if search_arcane in arcane_info["name"].lower()]
    if not result:
        return jsonify({"error": "Мистификатор не найден"}), 404
    
    for item in result:
        existing = db.session.execute(
            db.select(ArcaneData).filter(func.lower(ArcaneData.name) == item["name"].lower())
        ).scalar()

        if not existing:
            level_stats = item.get("levelStats", [])
            padded_levels = level_stats + [None] * (6 - len(level_stats))

            new_arcane = ArcaneData(
                name=item["name"],
                category=item.get("category"),
                type=item.get("type", "Warframe"),
                rarity=item.get("rarity", "Common"),
                tradable=item.get("tradable", False),
                level0=padded_levels[0] if len(padded_levels) > 0 else None,
                level1=padded_levels[1] if len(padded_levels) > 1 else None,
                level2=padded_levels[2] if len(padded_levels) > 2 else None,
                level3=padded_levels[3] if len(padded_levels) > 3 else None,
                level4=padded_levels[4] if len(padded_levels) > 4 else None,
                level5=padded_levels[5] if len(padded_levels) > 5 else None,
            )
            db.session.add(new_arcane)

    db.session.commit()
    return jsonify(result)

