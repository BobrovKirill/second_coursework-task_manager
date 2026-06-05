"""add email action tokens

Revision ID: 3d9f6a2b7c10
Revises: a05c497f2af9
Create Date: 2026-06-04 18:46:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d9f6a2b7c10'
down_revision: Union[str, Sequence[str], None] = 'a05c497f2af9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'email_action_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('purpose', sa.String(length=50), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text("timezone('UTC', now())"), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_email_action_tokens_id'), 'email_action_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_email_action_tokens_purpose'), 'email_action_tokens', ['purpose'], unique=False)
    op.create_index(op.f('ix_email_action_tokens_token_hash'), 'email_action_tokens', ['token_hash'], unique=True)
    op.create_index(op.f('ix_email_action_tokens_user_id'), 'email_action_tokens', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_email_action_tokens_user_id'), table_name='email_action_tokens')
    op.drop_index(op.f('ix_email_action_tokens_token_hash'), table_name='email_action_tokens')
    op.drop_index(op.f('ix_email_action_tokens_purpose'), table_name='email_action_tokens')
    op.drop_index(op.f('ix_email_action_tokens_id'), table_name='email_action_tokens')
    op.drop_table('email_action_tokens')
