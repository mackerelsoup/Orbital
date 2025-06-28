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
    
@app.route("/run", methods=["POST"])
def run():
    print(">> Flask: /run endpoint hit")
    try:
        data = request.get_json()
        print(">> Flask: Received data:", data)
        # Your forecast logic here
    except Exception as e:
        print(">> Flask: Error during prediction", str(e))
        return jsonify({"error": str(e)}), 500

    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
