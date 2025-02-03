import joblib
import skl2onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import numpy as np
import onnx
import onnxruntime as rt
import json

# Load your trained model and vectorizer
model = joblib.load('upi_classifier_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

# Prepare initial types for conversion
initial_types = [('input', FloatTensorType([None, 5000]))]

# Convert model to ONNX format with more detailed options
onnx_model = convert_sklearn(
    model, 
    initial_types=initial_types,
    target_opset=12,  # Specify ONNX opset version for better compatibility
    options={
        'zipmap': False,  # Disable zipmap for better JavaScript compatibility
        'output_names': ['output']  # Specify output tensor name
    }
)

# Validate the ONNX model
try:
    onnx.checker.check_model(onnx_model)
    print("ONNX model is valid!")
except onnx.checker.ValidationError as e:
    print(f"ONNX model is invalid: {e}")

# Save the ONNX model
with open("upi_classifier_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

# Optional: Test ONNX inference to verify conversion
try:
    # Create a sample input (5000-dimensional sparse vector)
    sample_input = np.random.rand(1, 5000).astype(np.float32)
    
    # Run inference using ONNX Runtime
    sess = rt.InferenceSession("upi_classifier_model.onnx")
    input_name = sess.get_inputs()[0].name
    output_name = sess.get_outputs()[0].name
    
    pred_onnx = sess.run([output_name], {input_name: sample_input})
    print("ONNX Inference Test Successful!")
    print("Sample Prediction:", pred_onnx)
except Exception as e:
    print(f"ONNX Inference Test Failed: {e}")

# Additional: Export vectorizer details for reference

# Extract feature names (if available)
try:
    feature_names = vectorizer.get_feature_names_out()
    
    # Save feature names for potential use in JavaScript preprocessing
    with open('tfidf_feature_names.json', 'w') as f:
        json.dump(list(feature_names), f)
    print("Feature names exported successfully!")
except Exception as e:
    print(f"Could not export feature names: {e}")

print("Model conversion and export completed successfully!")
