import os
import joblib
from datetime import datetime
import logging
import shutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_model(new_model_path: str):
    """
    Update the production model with a new version
    
    Args:
        new_model_path: Path to the new model file
    """
    try:
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Load new model to verify it's valid
        new_model = joblib.load(new_model_path)
        
        # Generate timestamp for versioning
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create backup of current model if exists
        current_model_path = os.path.join(models_dir, 'house_price_model.joblib')
        if os.path.exists(current_model_path):
            backup_path = os.path.join(
                models_dir, 
                f'house_price_model_backup_{timestamp}.joblib'
            )
            shutil.copy2(current_model_path, backup_path)
            logger.info(f"Created backup at {backup_path}")
        
        # Copy new model to production location
        shutil.copy2(new_model_path, current_model_path)
        logger.info(f"Updated production model with {new_model_path}")
        
        # Clean up old backups (keep last 5)
        backups = [f for f in os.listdir(models_dir) if f.startswith('house_price_model_backup_')]
        if len(backups) > 5:
            backups.sort()
            for old_backup in backups[:-5]:
                os.remove(os.path.join(models_dir, old_backup))
                logger.info(f"Removed old backup {old_backup}")
        
        return True, "Model updated successfully"
        
    except Exception as e:
        logger.error(f"Error updating model: {str(e)}")
        return False, str(e)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python update_model.py <path_to_new_model>")
        sys.exit(1)
    
    success, message = update_model(sys.argv[1])
    if not success:
        sys.exit(1)
    print(message) 