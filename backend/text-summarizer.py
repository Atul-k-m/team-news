from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest
from bs4 import BeautifulSoup
from urllib.request import urlopen

# Load the spaCy model
nlp = spacy.load("en_core_web_lg")

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

def txt_summarizer(raw_docx):
    stopwords = list(STOP_WORDS)
    raw_text = raw_docx
    docx = nlp(raw_text)

    word_frequencies = {}
    for word in docx:
        if word.text.lower() not in stopwords:
            if word.text.lower() not in punctuation:
                if word.text not in word_frequencies:
                    word_frequencies[word.text] = 1
                else:
                    word_frequencies[word.text] += 1

    maximum_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word] = (word_frequencies[word] / maximum_frequency)

    sentence_list = [sentence for sentence in docx.sents]

    sentence_scores = {}
    for sent in sentence_list:
        for word in sent:
            if word.text.lower() in word_frequencies:
                if len(sent.text.split(' ')) < 30:
                    if sent not in sentence_scores:
                        sentence_scores[sent] = word_frequencies[word.text.lower()]
                    else:
                        sentence_scores[sent] += word_frequencies[word.text.lower()]

    summarized_sentences = nlargest(10, sentence_scores, key=sentence_scores.get)
    final_sentences = [w.text for w in summarized_sentences]
    summary = ' '.join(final_sentences)

    return summary

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    raw_text = request.form['input_text']
    final_summary = txt_summarizer(raw_text)
    return render_template('result.html', ctext=raw_text, final_summary=final_summary)

@app.route('/process_url', methods=['POST'])
def process_url():
    raw_url = request.form['input_url']
    raw_text = urlopen(raw_url).read()
    raw_text = BeautifulSoup(raw_text, 'html.parser').get_text()
    final_summary = txt_summarizer(raw_text)
    return render_template('result.html', ctext=raw_text, final_summary=final_summary)

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    url = data.get('url')
    if url:
        raw_text = urlopen(url).read()
        raw_text = BeautifulSoup(raw_text, 'html.parser').get_text()
        summary = txt_summarizer(raw_text)
        return jsonify({'summary': summary})
    return jsonify({'error': 'No URL provided'}), 400

if __name__ == '__main__':
    app.run(debug=True)
