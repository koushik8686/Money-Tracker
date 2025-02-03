const ort = require('onnxruntime-web');
const fs = require('fs');
const path = require('path');
const pickle = require('picklejs');

// Preprocessing utilities
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", 
  "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 
  'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 
  'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 
  'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 
  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 
  'by', 'for', 'with', 'about', 'against', 'between', 'into', 
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 
  'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 
  'can', 'will', 'just', 'don', "don't", 'should', "should've", 
  'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 
  "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', 
  "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', 
  "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', 
  "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', 
  "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', 
  "won't", 'wouldn', "wouldn't"
]);

async function loadPickledObject(filePath) {
  try {
    const pickledData = fs.readFileSync(filePath);
    const unpickledData = pickle.loads(pickledData);
    return unpickledData;
  } catch (error) {
    console.error(`Error loading pickled file ${filePath}:`, error);
    throw error;
  }
}

function preprocessText(text, featureNames) {
  // Tokenize and clean text
  const tokens = text.toLowerCase()
    .replace(/[^\w\s]/g, '')  // Remove punctuation
    .split(/\s+/)
    .filter(token => !STOP_WORDS.has(token));

  // Create feature vector
  const features = new Array(5000).fill(0);
  
  tokens.forEach(token => {
    // Find index of token in feature names
    const index = featureNames.indexOf(token);
    if (index !== -1) {
      features[index] = 1;  // Binary feature representation
    }
  });

  return features;
}

async function predictUPIClassification(text) {
  try {
    const vectorizerPath = path.join(__dirname, '..', 'ml', 'tfidf_vectorizer.pkl');
    const modelPath = path.join(__dirname, '..', 'ml', 'upi_classifier_model.onnx');
    const featureNamesPath = path.join(__dirname, '..', 'ml', 'tfidf_feature_names.json');
    
    // Load feature names
    const featureNames = JSON.parse(fs.readFileSync(featureNamesPath, 'utf8'));
    
    // Preprocess text
    const features = preprocessText(text, featureNames);
    
    // Create ONNX inference session
    const session = await ort.InferenceSession.create(modelPath);
    const inputArray = Float32Array.from(features);
    const inputTensor = new ort.Tensor('float32', inputArray, [1, 5000]);

    // Run inference
    const results = await session.run({ 'input': inputTensor });
    
    // Extract prediction
    const outputName = session.outputNames[0];
    const predictionTensor = results[outputName];
    const prediction = Array.from(predictionTensor.data);
    
    // Interpret prediction
    const isUPI = prediction[0] > 0.5;
    
    return {
      isUPI: isUPI,
      confidence: prediction[0]
    };
  } catch (error) {
    console.error('UPI Classification Error:', error);
    throw error;
  }
}

async function main() {
  try {
    const sampleTexts = [
      "Received Rs. 500 from John via UPI at SBI",
      "Hello, how are you today?",
      "Your bill payment of Rs. 1000 is successful",
      "UPI transaction completed for mobile recharge"
    ];
    
    for (const text of sampleTexts) {
      const result = await predictUPIClassification(text);
      console.log(`Text: "${text}"`);
      console.log(`Is UPI Message: ${result.isUPI}`);
      console.log(`Confidence: ${result.confidence}\n`);
    }
  } catch (error) {
    console.error('Main Process Error:', error);
  }
}

main();
