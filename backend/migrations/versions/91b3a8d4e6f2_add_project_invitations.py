"""add project invitations

Revision ID: 91b3a8d4e6f2
Revises: 3d9f6a2b7c10
Create Date: 2026-06-04 19:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '91b3a8d4e6f2'
down_revision: Union[str, Sequence[str], None] = '3d9f6a2b7c10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'project_invitations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('invited_by_id', sa.Integer(), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('specialty_id', sa.Integer(), nullable=True),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text("timezone('UTC', now())"), nullable=False),
        sa.ForeignKeyConstraint(['invited_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['specialty_id'], ['project_specialties.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_project_invitations_email'), 'project_invitations', ['email'], unique=False)
    op.create_index(op.f('ix_project_invitations_id'), 'project_invitations', ['id'], unique=False)
    op.create_index(op.f('ix_project_invitations_project_id'), 'project_invitations', ['project_id'], unique=False)
    op.create_index(op.f('ix_project_invitations_token_hash'), 'project_invitations', ['token_hash'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_project_invitations_token_hash'), table_name='project_invitations')
    op.drop_index(op.f('ix_project_invitations_project_id'), table_name='project_invitations')
    op.drop_index(op.f('ix_project_invitations_id'), table_name='project_invitations')
    op.drop_index(op.f('ix_project_invitations_email'), table_name='project_invitations')
    op.drop_table('project_invitations')
