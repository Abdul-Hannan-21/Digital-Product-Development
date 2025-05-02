"""
Add faq_answers table and seed preset FAQ answers
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Text

def upgrade():
    op.create_table(
        'faq_answers',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('keyword', sa.String, unique=True, nullable=False, index=True),
        sa.Column('response_text', sa.Text, nullable=False)
    )
    # Seed preset questions
    faq_answers = table('faq_answers',
        column('keyword', String),
        column('response_text', Text)
    )
    op.bulk_insert(faq_answers, [
        {'keyword': 'appointment', 'response_text': 'You have an appointment at 3 PM today.'},
        {'keyword': 'what day', 'response_text': 'Today is Monday, April 28.'},
        {'keyword': 'reminder', 'response_text': "Don't forget to take your medication at 8 AM!"}
    ])

def downgrade():
    op.drop_table('faq_answers')