import pandas as pd
import numpy as np
import re
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.base import BaseEstimator, TransformerMixin

class MessageFeatureExtractor(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        """
        Transform messages into feature matrix
        
        Args:
            X (pd.Series or list): Input messages
        
        Returns:
            np.array: Extracted features
        """
        # Ensure input is a Series or list
        if not isinstance(X, (pd.Series, list)):
            X = pd.Series(X)
        
        # Feature extraction
        features = []
        for message in X:
            # Extract amount
            amount_match = re.search(r'(?:₹|INR|Rs\.?)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)', str(message))
            amount = float(amount_match.group(1).replace(',', '')) if amount_match else 0
            
            # Extract sender
            sender = str(message).split(':')[0].strip() if ':' in str(message) else 'Unknown'
            
            # Extract merchant
            merchants = ['Amazon', 'Zomato', 'Swiggy', 'Netflix', 'Paytm', 'PhonePe', 'Flipkart']
            merchant = next((m for m in merchants if m.lower() in str(message).lower()), 'Unknown')
            
            features.append([amount, sender, merchant])
        
        return np.array(features)

class UPIMessageExtractor:
    def __init__(self):
        # Initialize encoders
        self.sender_encoder = LabelEncoder()
        self.merchant_encoder = LabelEncoder()
        
        # Feature extractor and preprocessor
        self.feature_extractor = MessageFeatureExtractor()
        self.text_vectorizer = TfidfVectorizer(
            stop_words='english', 
            max_features=5000, 
            ngram_range=(1, 2)
        )
        
        # Preprocessing pipeline
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('text', self.text_vectorizer, 'message'),  # Text vectorization
                ('features', 'passthrough', ['sender', 'merchant'])  # Sender and merchant features
            ])
    
    def prepare_dataset(self, messages=None, dataset_path=None):
        """
        Prepare dataset for training
        
        Args:
            messages (list, optional): List of messages
            dataset_path (str, optional): Path to CSV dataset
        
        Returns:
            pd.DataFrame: Prepared dataset
        """
        if messages is not None:
            # Create DataFrame from messages
            df = pd.DataFrame({
                'message': messages,
                'amount': [self._extract_amount(msg) for msg in messages],
                'sender': [msg.split(':')[0].strip() if ':' in msg else 'Unknown' for msg in messages],
                'merchant': [self._extract_merchant(msg) for msg in messages]
            })
        elif dataset_path is not None:
            # Load from CSV
            df = pd.read_csv(dataset_path)
        else:
            raise ValueError("Either messages or dataset_path must be provided")
        
        # Encode categorical features
        df['sender_encoded'] = self.sender_encoder.fit_transform(df['sender'])
        df['merchant_encoded'] = self.merchant_encoder.fit_transform(df['merchant'])
        
        return df
    
    def _extract_amount(self, message):
        """Extract amount from message"""
        amount_patterns = [
            r'\₹\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)',  # Indian Rupee ₹
            r'INR\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)',  # INR format
            r'\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)',  # US Dollar $
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, str(message))
            if match:
                # Remove commas and convert to float
                amount_str = match.group(1).replace(',', '')
                try:
                    return float(amount_str)
                except ValueError:
                    continue
        
        return 0.0  # Default amount if no match
    
    def _extract_merchant(self, message):
        """Extract merchant from message"""
        merchants = ['Amazon', 'Zomato', 'Swiggy', 'Netflix', 'Paytm', 'PhonePe', 'Flipkart']
        for merchant in merchants:
            if merchant.lower() in str(message).lower():
                return merchant
        return 'Unknown'
    
    def train_extraction_models(self, messages=None, dataset_path=None):
        """
        Train models for extracting UPI message details
        
        Args:
            messages (list, optional): List of messages
            dataset_path (str, optional): Path to CSV dataset
        
        Returns:
            tuple: Trained models for sender, merchant, and amount
        """
        # Prepare dataset
        df = self.prepare_dataset(messages, dataset_path)
        
        # Split data
        X_train, X_test, y_sender_train, y_sender_test, \
        y_merchant_train, y_merchant_test, \
        y_amount_train, y_amount_test = train_test_split(
            df[['message', 'sender', 'merchant']],  # Pass multiple columns
            df['sender_encoded'], 
            df['merchant_encoded'], 
            df['amount'], 
            test_size=0.2, 
            random_state=42
        )
        
        # Sender classification pipeline
        sender_pipeline = Pipeline([
            ('preprocessor', self.preprocessor),
            ('classifier', RandomForestClassifier(n_estimators=100))
        ])
        
        # Merchant classification pipeline
        merchant_pipeline = Pipeline([
            ('preprocessor', self.preprocessor),
            ('classifier', RandomForestClassifier(n_estimators=100))
        ])
        
        # Amount regression pipeline
        amount_pipeline = Pipeline([
            ('preprocessor', self.preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100))
        ])
        
        # Train models
        sender_pipeline.fit(X_train, y_sender_train)
        merchant_pipeline.fit(X_train, y_merchant_train)
        amount_pipeline.fit(X_train, y_amount_train)
        
        # Evaluate models
        print("Sender Model Accuracy:", sender_pipeline.score(X_test, y_sender_test))
        print("Merchant Model Accuracy:", merchant_pipeline.score(X_test, y_merchant_test))
        print("Amount Model R² Score:", amount_pipeline.score(X_test, y_amount_test))
        
        # Save models and encoders
        joblib.dump({
            'sender_model': sender_pipeline,
            'merchant_model': merchant_pipeline,
            'amount_model': amount_pipeline,
            'sender_encoder': self.sender_encoder,
            'merchant_encoder': self.merchant_encoder
        }, 'upi_extraction_models.pkl')
        
        print("Models and encoders saved successfully!")
        
        return sender_pipeline, merchant_pipeline, amount_pipeline
    
    def predict_details(self, message):
        """
        Predict details from a UPI message
        
        Args:
            message (str): Input message
        
        Returns:
            dict: Predicted sender, merchant, and amount
        """
        # Load saved models
        models = joblib.load('upi_extraction_models.pkl')
        
        # Create a DataFrame with the correct structure
        input_data = pd.DataFrame({
            'message': [message],
            'sender': ['Unknown'],  # Placeholder
            'merchant': ['Unknown']  # Placeholder
        })
        
        # Predict sender, merchant, and amount
        sender_pred = models['sender_model'].predict(input_data)[0]
        merchant_pred = models['merchant_model'].predict(input_data)[0]
        amount_pred = models['amount_model'].predict(input_data)[0]
        
        # Decode predictions
        sender = models['sender_encoder'].inverse_transform([sender_pred])[0]
        merchant = models['merchant_encoder'].inverse_transform([merchant_pred])[0]
        
        return {
            'sender': sender,
            'merchant': merchant,
            'amount': round(amount_pred, 2)
        }

# Sample UPI messages for training
upi_messages = [
    "SBI: Your a/c XXXXX1234 credited ₹5000.00 by UPI REF NO 789456 on 15-Feb-25. Bal: INR 50000",
    "Zomato: Paid ₹350.50 for your food order. Ref Number 456123 dated 20-Jan-25",
    "Amazon: Received ₹1000.00 from Seller. Transaction REF 654321 on 10-Mar-25",
    "PhonePe: Sent ₹750.75 to Merchant. REF 987654 on 05-Apr-25",
    "Paytm: Credited ₹2500.25 from Friend. Transaction ID 123456 on 12-Feb-25"
]

# Main execution
if __name__ == "__main__":
    extractor = UPIMessageExtractor()
    
    # Train models on sample messages
    extractor.train_extraction_models(messages=upi_messages)
    
    # Example predictions
    test_messages = [
        "SBI: Your a/c credited ₹4500.00 by UPI REF NO 456789 on 20-Feb-25",
        "Zomato: Paid ₹350.75 for food order",
        "PhonePe: Sent ₹750.50 to Merchant"
    ]
    
    print("\nPrediction Results:")
    for msg in test_messages:
        prediction = extractor.predict_details(msg)
        print(f"\nMessage: {msg}")
        print("Prediction:", prediction)