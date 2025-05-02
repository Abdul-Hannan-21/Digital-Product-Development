from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'games',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('game_type', sa.String, nullable=False),
        sa.Column('score', sa.Float, nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )

def downgrade():
    op.drop_table('games')