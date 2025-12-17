import pytest
from app import app as flask_app
from models import db, WarframeData

@pytest.fixture
def app():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()


def test_index_page(client):
    response = client.get("/")
    assert response.status_code == 200

def test_about_page(client):
    response = client.get("/about")
    assert response.status_code == 200

def test_documentation_page(client):
    response = client.get("/documentation")
    assert response.status_code == 200

def test_get_warframe_exists(client):
    response = client.get("/wf/Volt")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
    assert "volt" in data[0]["name"].lower()

    with flask_app.app_context():
        wf = WarframeData.query.filter_by(WFname="Volt").first()
        assert wf is not None

def test_get_warframe_not_found(client):
    response = client.get("/wf/НесуществующийФрейм123")
    assert response.status_code == 404
    assert "error" in response.get_json()

def test_get_mods_exists(client):
    response = client.get("/mods/Continuity")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0

def test_get_mods_not_found(client):
    response = client.get("/mods/НесуществующийМод999")
    assert response.status_code == 404


def test_get_arcanes_exists(client):
    response = client.get("/arcanes/Energize")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0

def test_get_arcanes_not_found(client):
    response = client.get("/arcanes/НесуществующийМистик123")
    assert response.status_code == 404

def test_get_worldstate_invasions(client):
    response = client.get("/worldState/Invasions")
    assert response.status_code == 200
    data = response.get_json()
    assert "event" in data
    assert "locations" in data

def test_get_profile_invalid(client):
    response = client.get("/stat/999999999999")
    assert response.status_code == 404
    assert "error" in response.get_json()