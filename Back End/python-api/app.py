from flask import Flask, json, request, jsonify
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
        
        result = subprocess.run(
            ['python3', 'Carpark Availability Prediction Script.py'],
            input=json.dumps(input_data),
            text=True,
            capture_output=True,
            check=True
        )

        print("Script output:", result.stdout)

        forecast = json.loads(result.stdout)

        return jsonify({
            "message": "Prediction successful",
            "forecast": forecast
        })

    except Exception as e:
        print("Prediction failed:", e)
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
    
    def run():
        print("Received request to /run")
        input_data = request.get_json()
        print("Input data:", input_data)
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
