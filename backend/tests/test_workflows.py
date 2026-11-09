import asyncio
import os
import tempfile
import unittest
from pathlib import Path

# Configure an isolated database before importing application modules.
test_dir = tempfile.TemporaryDirectory()
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///' + str(Path(test_dir.name) / 'test.db').replace('\\', '/')
os.environ['SECRET_KEY'] = 'synthetic-test-signing-key-not-for-deployment'
os.environ['ADMIN_INVITE_CODE'] = 'local-test-invite'
from fastapi.testclient import TestClient
from main import app
from app.database import engine


class WorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)
        asyncio.run(engine.dispose())
        test_dir.cleanup()

    def test_registration_authorization_inventory_and_requests(self):
        c = self.client
        self.assertEqual(c.get('/health').status_code, 200)
        user = {'name': 'Demo User', 'email': 'user@example.com', 'password': 'Test-pass-123'}
        denied = c.post('/auth/register', json={**user, 'role': 'admin'})
        self.assertEqual(denied.status_code, 403)
        registered = c.post('/auth/register', json=user)
        self.assertEqual(registered.status_code, 200, registered.text)
        user_headers = {'Authorization': 'Bearer ' + registered.json()['access_token']}
        self.assertEqual(c.get('/auth/me', headers=user_headers).json()['role'], 'user')
        self.assertEqual(c.post('/auth/login', json={'email': user['email'], 'password': 'wrong'}).status_code, 401)
        self.assertEqual(c.post('/auth/login', json={'email': user['email'], 'password': user['password']}).status_code, 200)
        self.assertEqual(c.get('/admin/analytics', headers=user_headers).status_code, 403)
        self.assertEqual(c.get('/deliveries', headers=user_headers).status_code, 403)
        self.assertEqual(c.post('/books', headers=user_headers, json={'title': 'Demo', 'author': 'Author'}).status_code, 403)
        admin = c.post('/auth/register', json={**user, 'email': 'admin@example.com', 'role': 'admin', 'admin_invite_code': 'local-test-invite'})
        self.assertEqual(admin.status_code, 200, admin.text)
        headers = {'Authorization': 'Bearer ' + admin.json()['access_token']}
        book = c.post('/books', headers=headers, json={'title': 'Synthetic Test Book', 'author': 'Demo Author', 'category': 'Fiction'})
        self.assertEqual(book.status_code, 200, book.text)
        book_id = book.json()['id']
        self.assertEqual(c.get('/books/search', params={'q': 'Synthetic'}).json()[0]['id'], book_id)
        self.assertEqual(c.put(f'/books/{book_id}', headers=headers, json={'description': 'Demo only'}).status_code, 200)
        request = c.post('/deliveries', headers=headers, json={'book_id': book_id, 'dropoff_location': 'Demo pickup desk', 'credit_reward': 0})
        self.assertEqual(request.status_code, 201, request.text)
        self.assertEqual(request.json()['status'], 'pending')
        self.assertEqual(c.get(f'/books/{book_id}').json()['status'], 'reserved')
        self.assertEqual(c.get('/admin/analytics', headers=headers).json()['deliveries']['total'], 1)
        self.assertEqual(c.post('/deliveries', headers=headers, json={'book_id': book_id, 'dropoff_location': 'Demo'}).status_code, 400)

    def test_invalid_registration_input(self):
        base = {'name': 'Demo', 'email': 'invalid-role@example.com', 'password': 'Test-pass-123'}
        self.assertEqual(self.client.post('/auth/register', json={**base, 'role': 'owner'}).status_code, 422)
        self.assertEqual(self.client.post('/auth/register', json={**base, 'password': 'short'}).status_code, 422)
        self.assertEqual(self.client.post('/auth/register', json={**base, 'password': 'x' * 73}).status_code, 422)
