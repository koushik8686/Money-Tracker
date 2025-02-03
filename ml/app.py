from flask import Flask, request, jsonify
import joblib
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load the saved model and vectorizer
model = joblib.load('upi_classifier_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

@app.route('/' , methods=['GET'])
def home():
    """
    Home page
    """
    return "Welcome to the UPI classification model!"

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict the classification of a message
    Expects a JSON payload with a 'message' key
    Returns the predicted label and confidence
    """
    try:
        # Get the message from the request
        data = request.get_json(force=True)
        print(data)
        message = data.get('message', '')
        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Vectorize the input message
        message_vec = vectorizer.transform([message])

        # Make prediction
        prediction = model.predict(message_vec)[0]
        probabilities = model.predict_proba(message_vec)[0]
        # Get the probability of the predicted class
        max_prob = np.max(probabilities)
        return jsonify({
            'prediction': str(prediction),
            'confidence': str(float(max_prob))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)