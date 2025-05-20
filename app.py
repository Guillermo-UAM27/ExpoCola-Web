from flask import Flask, request, jsonify
from models.cola import Cola
import logging

app = Flask(__name__)
cola_pacientes = Cola()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/agregar', methods=['POST'])
def agregar_paciente():
    try:
        logger.debug("Received request to /agregar")
        data = request.get_json(force=True)
        logger.debug(f"Request data: {data}")
        if not data or 'paciente' not in data:
            logger.warning("Missing 'paciente' parameter in request")
            return jsonify({'status': 'error', 'message': 'Falta el parámetro paciente'}), 400
        paciente = data['paciente']
        logger.debug(f"Attempting to add patient: {paciente}")
        if cola_pacientes.agregar(paciente):
            logger.info(f"Patient {paciente} added to queue")
            return jsonify({'status': 'success', 'cola': cola_pacientes.items.copy()})
        logger.warning(f"Invalid patient entry: {paciente}")
        return jsonify({'status': 'error', 'message': 'Entrada inválida'}), 400
    except Exception as e:
        logger.error(f"Error in /agregar: {str(e)}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Error interno del servidor'}), 500

@app.route('/atender', methods=['POST'])
def atender_paciente():
    try:
        paciente = cola_pacientes.atender()
        if paciente:
            return jsonify({'status': 'success', 'paciente': paciente, 'cola': cola_pacientes.items.copy()})
        return jsonify({'status': 'error', 'message': 'No hay pacientes en la cola'})
    except Exception as e:
        logger.error(f"Error in /atender: {e}")
        return jsonify({'status': 'error', 'message': 'Error interno del servidor'}), 500

@app.route('/eliminar_ultimo', methods=['POST'])
def eliminar_ultimo():
    try:
        paciente = cola_pacientes.atender()
        if paciente:
            return jsonify({'status': 'success', 'paciente': paciente, 'cola': cola_pacientes.items.copy()})
        return jsonify({'status': 'error', 'message': 'No hay pacientes en la cola'})
    except Exception as e:
        logger.error(f"Error in /eliminar_ultimo: {e}")
        return jsonify({'status': 'error', 'message': 'Error interno del servidor'}), 500

@app.route('/contar', methods=['GET'])
def contar_objetos():
    try:
        return jsonify({'count': cola_pacientes.contar_objetos()})
    except Exception as e:
        logger.error(f"Error in /contar: {e}")
        return jsonify({'status': 'error', 'message': 'Error interno del servidor'}), 500

@app.route('/limpiar', methods=['POST'])
def limpiar():
    try:
        cola_pacientes.limpiar()
        return jsonify({'status': 'success', 'cola': cola_pacientes.items.copy()})
    except Exception as e:
        logger.error(f"Error in /limpiar: {e}")
        return jsonify({'status': 'error', 'message': 'Error interno del servidor'}), 500

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)