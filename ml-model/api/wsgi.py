import os
import sys

# Add the current directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from app import app as application

if __name__ == "__main__":
    application.run() 