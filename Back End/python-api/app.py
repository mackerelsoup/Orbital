from flask import Flask, jsonify
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return "Flask is up"


@app.route('/run', methods=['GET'])
def run_prediction():
    try:
        result = subprocess.run(
            ['python3', '../scripts/Carpark Availability Prediction Script.py'],
            capture_output=True,
            text=True,
            check=True
        )
        return jsonify({
            'status': 'success',
            'output': result.stdout
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            'status': 'error',
            'error': e.stderr
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
