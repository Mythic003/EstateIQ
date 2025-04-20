import sys

# Add the parent directory to the path
path = '/home/your_username/ml-model/api'
if path not in sys.path:
    sys.path.append(path)

from app import app as application

if __name__ == "__main__":
    application.run() 