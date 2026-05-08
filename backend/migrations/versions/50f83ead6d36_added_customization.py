"""added customization

Revision ID: 50f83ead6d36
Revises: 982e3caa6e74
Create Date: 2026-05-07 17:01:09.454546

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50f83ead6d36'
down_revision: Union[str, Sequence[str], None] = '982e3caa6e74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
"""added customization

Revision ID: 50f83ead6d36
Revises: 982e3caa6e74
Create Date: 2026-05-07 17:01:09.454546

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50f83ead6d36'
down_revision: Union[str, Sequence[str], None] = '982e3caa6e74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'projects', 
        sa.Column('icon_url', sa.String(500), nullable=True)
    )
    op.add_column(
        'projects', 
        sa.Column('font_color', sa.String(7), nullable=True, server_default='#000000')
    )
    op.add_column(
        'projects', 
        sa.Column('background_type', sa.String(20), nullable=True, server_default='default')
    )
    op.add_column(
        'projects', 
        sa.Column('background_value', sa.Text(), nullable=True)
    )
    
    op.execute("UPDATE projects SET background_type = 'default' WHERE background_type IS NULL")
    op.execute("UPDATE projects SET font_color = '#000000' WHERE font_color IS NULL")
    
    op.alter_column('projects', 'background_type', nullable=False, server_default=None)


def downgrade() -> None:
    op.drop_column('projects', 'background_value')
    op.drop_column('projects', 'background_type')
    op.drop_column('projects', 'font_color')
    op.drop_column('projects', 'icon_url')