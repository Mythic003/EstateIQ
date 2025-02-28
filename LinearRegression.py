import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error

# Load the dataset
file_path = 'EstateIQ/Data/Datasets/House_Price_India/House_Price_India.csv'  # Replace with your file path
data = pd.read_csv(file_path)

# Select features and target
features = [
    "no._of_bathrooms", "living area", "grade of the house",
    "Area of the house(excluding basement)", "living_area_renov"
]
target = "Price"

X = data[features]
y = data[target]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
lr_model = LinearRegression()
lr_model.fit(X_train, y_train)

# Make predictions
lr_predictions = lr_model.predict(X_test)

# Evaluate the model
r2 = r2_score(y_test, lr_predictions)
mse = mean_squared_error(y_test, lr_predictions)

print(f"Linear Regression R² Score: {r2}")
print(f"Linear Regression Mean Squared Error: {mse}")
