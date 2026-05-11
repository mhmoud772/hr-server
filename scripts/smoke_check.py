#!/usr/bin/env python
import os
import secrets
import sys
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

import django

django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.test import APIClient

from hr.models import EducationalLevel, MaritalStatus, TypeOfEmployee


def assert_status(response: Any, expected: int, label: str) -> None:
    if response.status_code != expected:
        body = getattr(response, 'data', None) or response.content.decode('utf-8', errors='replace')
        raise AssertionError(f'{label}: expected {expected}, got {response.status_code}: {body}')


def require_access_token(response: Any) -> str:
    assert_status(response, 200, 'JWT login')
    token = response.data.get('access')
    if not token:
        raise AssertionError('JWT login: missing access token')
    return token


def run() -> None:
    client = APIClient(HTTP_HOST='127.0.0.1')
    suffix = secrets.token_hex(4)
    username = f'smoke_{suffix}'
    password = f'Smoke-{suffix}-Pass123'

    with transaction.atomic():
        User = get_user_model()
        User.objects.create_user(username=username, password=password)

        login = client.post(
            '/api/token/',
            {'username': username, 'password': password},
            format='json',
        )
        access_token = require_access_token(login)

        refresh = client.post(
            '/api/token/refresh/',
            {'refresh': login.data.get('refresh')},
            format='json',
        )
        assert_status(refresh, 200, 'JWT refresh')

        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        checks = [
            ('employees list', client.get('/api/employees/')),
            ('attendance date filter', client.get('/api/attendance/?date=2026-05-07')),
            ('attendance month filter', client.get('/api/attendance/?month=2026-05')),
            ('leave request status filter', client.get('/api/leave-requests/?status=1')),
        ]
        for label, response in checks:
            assert_status(response, 200, label)

        educational_level = EducationalLevel.objects.create(name=f'Smoke Level {suffix}')
        employee_type, _ = TypeOfEmployee.objects.get_or_create(type_of_employee='1')
        marital_status, _ = MaritalStatus.objects.get_or_create(marital_status='2')

        payload = {
            'name': f'Smoke Employee {suffix}',
            'number_employee': f'SMOKE-{suffix}',
            'address': 'Smoke Address',
            'phone': '777777777',
            'phone1': '',
            'email': f'{username}@example.test',
            'educational_level': educational_level.id,
            'type_of_employee': employee_type.id,
            'marital_status': marital_status.id,
            'basic_salary': '1000.00',
            'secondary_salary': '100.00',
            'active': True,
            'note': 'smoke-check',
        }
        created = client.post('/api/employees/', payload, format='json')
        assert_status(created, 201, 'employee create')
        employee_id = created.data.get('id')
        if not employee_id:
            raise AssertionError('employee create: missing id')

        updated = client.patch(
            f'/api/employees/{employee_id}/',
            {'phone': '777777778'},
            format='json',
        )
        assert_status(updated, 200, 'employee update')

        deleted = client.delete(f'/api/employees/{employee_id}/')
        assert_status(deleted, 204, 'employee delete')

        password_change = client.post(
            '/api/change-password/',
            {
                'old_password': password,
                'new_password': f'{password}-New',
                'confirm_password': f'{password}-New',
            },
            format='json',
        )
        assert_status(password_change, 200, 'password change')

        transaction.set_rollback(True)

    print('Smoke check passed: auth, refresh, protected API, filters, CRUD, password change')


if __name__ == '__main__':
    try:
        run()
    except Exception as exc:
        print(f'Smoke check failed: {exc}', file=sys.stderr)
        raise SystemExit(1) from exc
