import traceback
from flask import Flask, json, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return "Flask is up"


@app.route('/run', methods=['POST'])
def run_prediction():
    print("/run endpoint hit")

    try:
        input_data = request.get_json(force=True)
        print(f"Received data with {len(input_data)} rows")

        result = subprocess.run(
            ['python', './Back End/scripts/Carpark Availability Prediction Script.py'],
            input=json.dumps(input_data),
            text=True,
            capture_output=True,
            timeout=60  
        )

        print("Raw script stdout:", result.stdout)
        print("Raw script stderr:", result.stderr)

        if result.returncode != 0:
            print("Script failed with return code", result.returncode)
            return jsonify({
                'status': 'error',
                'error': 'Script execution failed',
                'details': result.stderr
            }), 500

        try:
            forecast = json.loads(result.stdout)
        except Exception as e:
            print("Failed to parse JSON from script")
            traceback.print_exc()
            return jsonify({
                'status': 'error',
                'error': 'Invalid JSON returned by script',
                'details': str(e)
            }), 500

        print("Forecast successfully parsed:", forecast[:3], "...")

        return jsonify({
            "message": "Prediction successful",
            "forecast": forecast
        })

    except subprocess.TimeoutExpired:
        print("Script timed out")
        return jsonify({
            'status': 'error',
            'error': 'Script timed out'
        }), 500

    except Exception as e:
        print("Unexpected error")
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'error': 'Flask API error',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
