from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return "Flask is up"


@app.route('/run', methods=['POST'])
def run_prediction():
    try:
        input_data = request.get_json(force=True)
        print("Received data:", input_data)

        # return dummy forecast for now
        forecast = [
            {"recorded_at": "2025-06-27 18:00:00", "available": 10},
            {"recorded_at": "2025-06-27 19:00:00", "available": 12}
        ]

        return jsonify({
            "message": "Prediction successful",
            "forecast": forecast
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
