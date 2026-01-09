from fastapi.testclient import TestClient
from app.core.config import settings
import time

def test_create_user(client: TestClient) -> None:
    unique_id = int(time.time())
    r = client.post(
        f"{settings.API_V1_STR}/auth/register/",
        json={
            "email": f"test_{unique_id}@example.com",
            "username": f"testuser_{unique_id}",
            "password": "password123",
            "password2": "password123",
        },
    )
    assert r.status_code == 201
    assert "user" in r.json()
    assert "access" in r.json()

def test_login_user(client: TestClient) -> None:
    # Use the testuser I created manually or in a previous step to verify login
    # Actually, better to register a fresh one for the test
    unique_id = int(time.time()) + 1
    username = f"loginuser_{unique_id}"
    email = f"login_{unique_id}@example.com"
    
    # Register
    client.post(
        f"{settings.API_V1_STR}/auth/register/",
        json={
            "email": email,
            "username": username,
            "password": "password123",
            "password2": "password123",
        },
    )
    
    # Login
    r = client.post(
        f"{settings.API_V1_STR}/auth/login/",
        json={
            "username": username,
            "password": "password123",
        },
    )
    assert r.status_code == 200
    assert "access" in r.json()

def test_notes_lifecycle(client: TestClient) -> None:
    unique_id = int(time.time()) + 2
    username = f"noteuser_{unique_id}"
    
    # Auth
    reg = client.post(
        f"{settings.API_V1_STR}/auth/register/",
        json={
            "email": f"note_{unique_id}@example.com",
            "username": username,
            "password": "password123",
            "password2": "password123",
        },
    )
    token = reg.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Note
    r = client.post(
        f"{settings.API_V1_STR}/notes/",
        headers=headers,
        json={"title": "Test Note", "content": "Initial Content"}
    )
    assert r.status_code == 201
    note_id = r.json()["id"]
    
    # Update Note (should create version)
    r = client.put(
        f"{settings.API_V1_STR}/notes/{note_id}/",
        headers=headers,
        json={"title": "Updated Title", "content": "Updated Content"}
    )
    assert r.status_code == 200
    
    # List Versions
    r = client.get(f"{settings.API_V1_STR}/notes/{note_id}/versions/", headers=headers)
    assert r.status_code == 200
    versions = r.json()
    assert len(versions) >= 1
    version_id = versions[0]["id"]
    
    # Restore Version
    r = client.post(f"{settings.API_V1_STR}/notes/{note_id}/versions/{version_id}/restore/", headers=headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Test Note"
    
    # Delete
    r = client.delete(f"{settings.API_V1_STR}/notes/{note_id}/", headers=headers)
    assert r.status_code == 204
