from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

app = Flask(__name__)
CORS(app)

# Training data
training_sentences = [

    # FOOD
    "I need food",
    "I am hungry",
    "food help",
    "free food",
    "food bank near me",

    # SHELTER
    "I need shelter",
    "I am homeless",
    "place to stay",
    "temporary shelter",
    "need a place to sleep",

    # HEALTH
    "I need doctor",
    "health problem",
    "medical help",
    "hospital near me",
    "doctor clinic",

    # HOTEL / STAY
    "I need hotel",
    "I need hostel",
    "I need homestay",
    "cheap hotel near me",
    "place to stay tonight",
    "any hostel nearby",
    "room for night",
    "guest house"
]

training_labels = [

    # FOOD
    "food_bank",
    "food_bank",
    "food_bank",
    "food_bank",
    "food_bank",

    # SHELTER
    "shelter",
    "shelter",
    "shelter",
    "shelter",
    "shelter",

    # HEALTH
    "clinic",
    "clinic",
    "clinic",
    "clinic",
    "clinic",

    # HOTEL
    "hotel",
    "hotel",
    "hotel",
    "hotel",
    "hotel",
    "hotel",
    "hotel",
    "hotel"
]

# Vectorize text
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(training_sentences)

# Train model
model = MultinomialNB()
model.fit(X, training_labels)

@app.route('/predict', methods=['POST'])
def predict():

    data = request.get_json()
    message = data["message"].lower()

    vec = vectorizer.transform([message])
    prediction = model.predict(vec)[0]

    explanations = {
        "food_bank": "You may need food assistance. Showing nearby food banks.",
        "shelter": "You may need housing support. Showing nearby shelters.",
        "clinic": "You may need medical help. Showing nearby health clinics.",
        "hotel": "You may need temporary accommodation. Showing nearby hotels or homestays."
    }

    return jsonify({
        "service": prediction,
        "message": explanations.get(prediction, "Searching services near you.")
    })


if __name__ == "__main__":
    app.run(port=5050)