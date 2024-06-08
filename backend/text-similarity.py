from flask import Flask, render_template, request
from flask_cors import CORS
import spacy

# Load the spaCy model
nlp = spacy.load("en_core_web_lg")

app = Flask(__name__)
CORS(app)

def check_similarity(text1, text2):
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    similarity = doc1.similarity(doc2)
    return similarity

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    text1 = request.form['input_text1']
    text2 = request.form['input_text2']
    similarity = check_similarity(text1, text2)
    result = "Probably Real" if similarity > 0.7 else "Probably Fake"
    return render_template('result.html', text1=text1, text2=text2, similarity=similarity, result=result)

@app.route('/fact_check', methods=['POST'])
def fact_check():
    data = request.json
    text1 = data.get('text1')
    text2 = data.get('text2')
    if text1 and text2:
        similarity = check_similarity(text1, text2)
        result = "Probably Real" if similarity > 0.7 else "Probably Fake"
        return jsonify({'similarity': similarity, 'result': result})
    return jsonify({'error': 'Invalid input data'}), 400

if __name__ == '__main__':
    app.run(debug=True)
