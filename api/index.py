import sys
import os

# Add backend directory to Python path so relative imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app

handler = app