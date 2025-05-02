# Database Migrations

This directory contains database migration scripts managed by Alembic.

## Migration Commands

- Initialize migrations: `alembic init alembic`
- Create a new migration: `alembic revision --autogenerate -m "description"`
- Apply migrations: `alembic upgrade head`
- Rollback migrations: `alembic downgrade -1`
- View migration history: `alembic history`

## Migration Strategy

We use Alembic's autogenerate feature to detect changes in SQLAlchemy models and generate migration scripts automatically. Always review generated migrations before applying them to production.