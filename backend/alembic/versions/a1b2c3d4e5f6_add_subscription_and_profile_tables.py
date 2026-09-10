"""add_subscription_and_profile_tables

Revision ID: a1b2c3d4e5f6
Revises: 0ff8693e828a
Create Date: 2026-09-10 13:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '0ff8693e828a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Plans table
    if 'plans' not in tables:
        op.create_table(
            'plans',
            sa.Column('id', sa.String(length=50), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('price_inr', sa.Integer(), nullable=False),
            sa.Column('billing_period', sa.String(length=50), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # Subscriptions table
    if 'subscriptions' not in tables:
        op.create_table(
            'subscriptions',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('plan_id', sa.String(length=50), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=False),
            sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('provider', sa.String(length=50), nullable=True),
            sa.Column('provider_subscription_id', sa.String(length=255), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['plan_id'], ['plans.id']),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
        op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=True)

    # Usage records table
    if 'usage_records' not in tables:
        op.create_table(
            'usage_records',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('metric', sa.String(length=100), nullable=False),
            sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
            sa.Column('period_end', sa.DateTime(timezone=True), nullable=False),
            sa.Column('count', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_usage_records_metric'), 'usage_records', ['metric'], unique=False)
        op.create_index(op.f('ix_usage_records_user_id'), 'usage_records', ['user_id'], unique=False)

    # Notification preferences table
    if 'notification_preferences' not in tables:
        op.create_table(
            'notification_preferences',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('email_alerts', sa.Boolean(), nullable=False),
            sa.Column('push_alerts', sa.Boolean(), nullable=False),
            sa.Column('detection_alerts', sa.Boolean(), nullable=False),
            sa.Column('incident_alerts', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
        op.create_index(op.f('ix_notification_preferences_user_id'), 'notification_preferences', ['user_id'], unique=True)

    # Audit logs table
    if 'audit_logs' not in tables:
        op.create_table(
            'audit_logs',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=True),
            sa.Column('action', sa.String(length=100), nullable=False),
            sa.Column('feature', sa.String(length=100), nullable=True),
            sa.Column('details', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
        op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)



def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('notification_preferences')
    op.drop_table('usage_records')
    op.drop_table('subscriptions')
    op.drop_table('plans')
