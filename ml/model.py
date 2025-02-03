import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import re

def extract_sender(message):
    """Extract sender from the message"""
    # Split message and return the first part (sender)
    sender = message.split(':')[0].strip()
    return sender

def preprocess_text(text):
    """Clean text for better vectorization"""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train_upi_classifier(csv_path='upi_dataset.csv'):
    # Load dataset
    df = pd.read_csv(csv_path)
    
    # Extract sender and preprocess message
    df['sender'] = df['message'].apply(extract_sender)
    df['processed_message'] = df['message'].apply(preprocess_text)
    
    # Encode senders
    le = LabelEncoder()
    df['sender_encoded'] = le.fit_transform(df['sender'])
    
    # Prepare features and labels
    X = df[['processed_message', 'sender_encoded']]
    y = df['label']
    
    # Create preprocessing for different feature types
    preprocessor = ColumnTransformer(
        transformers=[
            ('msg_tfidf', TfidfVectorizer(
                stop_words='english', 
                max_features=5000, 
                ngram_range=(1, 2)
            ), 'processed_message'),
            ('sender', 'passthrough', ['sender_encoded'])
        ])
    
    # Create pipeline with preprocessing and classification
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', MultinomialNB())
    ])
    
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    pipeline.fit(X_train, y_train)
    
    # Predictions and evaluation
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Print results
    print(f"Accuracy: {accuracy*100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Perform cross-validation
    cv_scores = cross_val_score(pipeline, X, y, cv=5)
    print(f"\nCross-validation Scores: {cv_scores}")
    print(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Save model, vectorizer, and label encoder
    joblib.dump(pipeline, 'upi_classifier_model.pkl')
    joblib.dump(le, 'sender_label_encoder.pkl')
    print("\nModel and Label Encoder saved successfully!")
    
    return pipeline, le

def predict_upi_message(model, le, message):
    """Predict if a message is a UPI message"""
    # Extract sender and preprocess message
    sender = extract_sender(message)
    processed_msg = preprocess_text(message)
    
    # Handle unseen senders by using a default encoding
    try:
        sender_encoded = le.transform([sender])[0]
    except ValueError:
        # If sender is not in the original training data, use a default value
        sender_encoded = -1  # or len(le.classes_)
    
    # Prepare input
    input_data = pd.DataFrame({
        'processed_message': [processed_msg],
        'sender_encoded': [sender_encoded]
    })
    
    # Predict
    prediction = model.predict(input_data)
    proba = model.predict_proba(input_data)
    
    return {
        'is_upi': bool(prediction[0]),
        'upi_probability': max(proba[0]),
        'sender': sender,
        'details': f"Predicted as {'UPI' if prediction[0] else 'Non-UPI'} message"
    }

# Train the model
model, label_encoder = train_upi_classifier()

# Example predictions
test_messages = [
    "SBI: Your a/c XXXXX1234 credited INR 5000.00 by UPI REF NO 789456 on 15-Feb-25. Bal: INR 50000",
    "Friend Amit: Hey, what's up? Wanna grab coffee later?",
    "Netflix: Your monthly subscription is due. Pay now to continue uninterrupted service."
]

print("\nTest Message Predictions:")
for msg in test_messages:
    print(f"\nMessage: {msg}")
    print(predict_upi_message(model, label_encoder, msg))