import pytest
from app import app as flask_app

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as c:
        yield c

def test_signup_success(client):
    resp = client.post('/api/auth/signup', json={
        "email": "test_user_1@example.com",
        "password": "securepass123"
    })
    assert resp.status_code in (201, 409)  # 409 if already run before

def test_signup_invalid_email(client):
    resp = client.post('/api/auth/signup', json={
        "email": "not-an-email",
        "password": "securepass123"
    })
    assert resp.status_code == 400

def test_signup_short_password(client):
    resp = client.post('/api/auth/signup', json={
        "email": "test_user_2@example.com",
        "password": "short"
    })
    assert resp.status_code == 400

def test_login_wrong_password(client):
    client.post('/api/auth/signup', json={
        "email": "test_user_3@example.com",
        "password": "securepass123"
    })
    resp = client.post('/api/auth/login', json={
        "email": "test_user_3@example.com",
        "password": "wrongpass"
    })
    assert resp.status_code == 401

def test_login_success(client):
    client.post('/api/auth/signup', json={
        "email": "test_user_4@example.com",
        "password": "securepass123"
    })
    resp = client.post('/api/auth/login', json={
        "email": "test_user_4@example.com",
        "password": "securepass123"
    })
    assert resp.status_code == 200
    assert "token" in resp.get_json()