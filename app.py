from flask import Flask, render_template, jsonify, request
import requests
from sqlalchemy import func
from flask_cors import CORS
from models import db, create_db, WarframeData, ModData, ArcaneData, ItemIndex
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

@app.route("/api/autocomplete")
def autocomplete():
    query = request.args.get('q', '').strip().lower()
    item_type = request.args.get('type')

    if not query or len(query) < 1: 
        return jsonify([])

    sql_query = db.select(ItemIndex).filter(ItemIndex.name.ilike(f"%{query}%"))

    if item_type:
        sql_query = sql_query.filter(ItemIndex.item_type == item_type)

    results = db.session.execute(sql_query.limit(10)).scalars().all()

    return jsonify([
        {"name": item.name, "type": item.item_type} 
        for item in results
    ])

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

@app.route("/mods/<mod>")
def get_mods(mod):
    search_term = mod.strip().lower()

    matches_in_db = db.session.execute(
        db.select(ModData).filter(ModData.name.ilike(f"%{search_term}%"))
    ).scalars().all()

    if matches_in_db:
        results = [{
            "name": m.name,
            "type": m.type,
            "baseDrain": m.baseDrain,
            "fusionLimit": m.fusionLimit,
            "rarity": m.rarity,
            "polarity": m.polarity,
            "tradable": m.tradable,
            "releaseDate": m.releaseDate.isoformat() if m.releaseDate else None,
            "wikiAvailable": m.wikiAvailable,
            "wikiaUrl": m.wikiaUrl    
        } for m in matches_in_db]
        return jsonify(results)


    data = load_json("https://raw.githubusercontent.com/WFCD/warframe-items/refs/heads/master/data/json/Mods.json")
    if not data:
        return jsonify({"error": "Данные недоступны"}), 503

    matches_external = [m for m in data if search_term in m["name"].lower()]
    if not matches_external:
        return jsonify({"error": "Не найдено"}), 404

    cached_results = []
    for mod_cache in matches_external:
        existing = db.session.execute(
            db.select(ModData).filter(func.lower(ModData.name) == mod_cache["name"].lower())
        ).scalar_one_or_none()

        if not existing:
            release_date = None
            if mod_cache.get("releaseDate"):
                try:
                    release_date = datetime.strptime(mod_cache["releaseDate"], "%Y-%m-%d").date()
                except:
                    pass

            new_mod = ModData(
                name=mod_cache["name"],
                type=mod_cache["type"],
                baseDrain=mod_cache["baseDrain"],
                fusionLimit=mod_cache["fusionLimit"],
                rarity=mod_cache["rarity"],
                polarity=mod_cache["polarity"],
                tradable=mod_cache["tradable"],
                releaseDate=release_date,
                wikiAvailable=mod_cache["wikiAvailable"],
                wikiaUrl=mod_cache["wikiaUrl"]
            )
            db.session.add(new_mod)

        cached_results.append(mod_cache)

    db.session.commit()
    return jsonify(cached_results)

def load_json(url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()

    except Exception as e:
        print(f"Ошибка загрузки {url}: {e}")
        return {}



@app.route("/wf/<name>")
def get_warframe(name):
    search = name.strip().lower()

    wf = db.session.execute(
        db.select(WarframeData)
        .filter(func.lower(WarframeData.WFname) == search)
    ).scalar_one_or_none()

    if wf:
        results = [{"name" : wf.WFname,
                 "type": wf.WFtype,
                 "health": wf.health,
                 "shield": wf.shield,
                 "armor": wf.armor,
                 "power": wf.power,
                 "sprintSpeed": wf.sprintSpeed,
                 "releaseDate": wf.releaseDate,
                 "description": wf.description,
                 "abilities" : [
                     {"name" : wf.abilities1, "description" : wf.description1}, 
                     {"name" : wf.abilities2, "description" : wf.description2}, 
                     {"name" : wf.abilities3, "description" : wf.description3}, 
                     {"name" : wf.abilities4, "description" : wf.description4}
                     ]
                }]
        
        return jsonify(results)

    
    data = load_json("https://raw.githubusercontent.com/WFCD/warframe-items/refs/heads/master/data/json/Warframes.json")
    if not data:
        return jsonify({"error": "Данные недоступны"}), 503
    results = [wf for wf in data if search in wf["name"].lower()]
    if not results:
        return jsonify({"error": "Не найдено"}), 404
    wf_cache = results[0]
    release_date_str = wf_cache.get("releaseDate")
    if release_date_str:
        release_date = datetime.strptime(release_date_str, "%Y-%m-%d").date()
    else:
        release_date = None

    wf_data = WarframeData(WFname=wf_cache["name"],
                            WFtype=wf_cache["type"],
                            health=wf_cache["health"],
                            shield=wf_cache["shield"],
                            armor=wf_cache["armor"],
                            power=wf_cache["power"],
                            sprintSpeed=wf_cache["sprintSpeed"],
                            releaseDate=release_date,
                            description=wf_cache["description"],
                            abilities1=wf_cache["abilities"][0]["name"],
                            description1=wf_cache["abilities"][0]["description"],
                            abilities2=wf_cache["abilities"][1]["name"],
                            description2=wf_cache["abilities"][1]["description"],
                            abilities3=wf_cache["abilities"][2]["name"],
                            description3=wf_cache["abilities"][2]["description"],
                            abilities4=wf_cache["abilities"][3]["name"],
                            description4=wf_cache["abilities"][3]["description"])
    db.session.add(wf_data)
    db.session.commit()
    return jsonify([wf_cache])


if __name__ == '__main__':
    app.run(port=5000)
