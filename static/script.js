let recognition;
let attendedCount = 0; // Counter for attended patients

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        document.getElementById('transcription').value = texto;
    };

    recognition.onerror = () => {
        document.getElementById('transcription').value = 'Error en el reconocimiento de voz';
    };
}

function toggleSpeechRecognition() {
    if (recognition) {
        recognition.start();
    }
}

function hablar(texto) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Text-to-speech not supported in this browser');
    }
}

function sendToQueue() {
    const texto = document.getElementById('transcription').value.trim();
    if (!texto) {
        alert('Por favor, transcribe un nombre de paciente primero.');
        return;
    }
    fetch('/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente: texto })
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Error en la solicitud');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from /agregar:', data);
        if (data.status === 'success') {
            actualizarCola(data.cola);
            hablar(`Paciente ${texto} agregado a la cola`);
            document.getElementById('transcription').value = '';
        } else {
            alert(data.message || 'Error al agregar el paciente');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
        alert(`Ocurrió un error: ${error.message}`);
    });
}

function removeLastFromQueue() {
    fetch('/eliminar_ultimo', {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            attendedCount++;
            hablar(`El paciente atendido número ${attendedCount} será ${data.paciente}`);
            actualizarCola(data.cola);
        } else {
            alert(data.message || 'Error al atender el paciente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al comunicarse con el servidor.');
    });
}

function countQueueItems() {
    fetch('/contar')
    .then(response => response.json())
    .then(data => {
        const size = data.count;
        hablar(`Los pacientes en espera son ${size}`);
        alert(`Número de pacientes: ${size}`);
    });
}

function clearTranscript() {
    fetch('/limpiar', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('transcription').value = '';
        attendedCount = 0; // Reset counter when clearing the queue
        actualizarCola(data.cola);
    });
}

function atender() {
    fetch('/atender', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            attendedCount++;
            hablar(`El paciente atendido número ${attendedCount} será ${data.paciente}`);
            actualizarCola(data.cola);
        } else {
            alert(data.message || 'Error al atender');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al comunicarse con el servidor.');
    });
}

function actualizarCola(cola) {
    const queueDiv = document.getElementById('queue');
    if (cola.length) {
        let list = '<ul>';
        cola.forEach((patient, index) => {
            list += `<li data-index="${index + 1}">${patient}</li>`;
        });
        list += '</ul>';
        queueDiv.innerHTML = list;
        queueDiv.classList.add('updated');
    } else {
        queueDiv.textContent = 'La cola está vacía';
        queueDiv.classList.remove('updated');
    }
}