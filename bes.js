document.getElementById('midiFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        parseMidi(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
});

let midiData;
let audioContext;
let playButton = document.getElementById('playButton');

function parseMidi(arrayBuffer) {
    midiData = new DataView(arrayBuffer);
    let offset = 0;

    function readChunk() {
        const id = String.fromCharCode(
            midiData.getUint8(offset),
            midiData.getUint8(offset + 1),
            midiData.getUint8(offset + 2),
            midiData.getUint8(offset + 3)
        );
        const length = midiData.getUint32(offset + 4);
        const chunkData = new Uint8Array(arrayBuffer, offset + 8, length);
        offset += 8 + length;
        return { id, length, chunkData };
    }

    const header = readChunk();
    const tracks = [];

    while (offset < midiData.byteLength) {
        const track = readChunk();
        tracks.push(track);
    }

    displayMidiInfo(header, tracks);
    playButton.disabled = false;
}

function displayMidiInfo(header, tracks) {
    const output = document.getElementById('output');
    output.textContent = `Header Chunk:
    ID: ${header.id}
    Length: ${header.length}

Tracks:
    ${tracks.map((track, i) => `Track ${i + 1} - ID: ${track.id}, Length: ${track.length}`).join('\n')}
    `;
}

playButton.addEventListener('click', function() {
    if (audioContext) {
        audioContext.close();
    }
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    playMidi();
});

function playMidi() {
    // Simple MIDI playback demo. Real playback would involve more complexity.
    const now = audioContext.currentTime;
    const duration = 1.0;  // 1 second for demonstration
    const osc = audioContext.createOscillator();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4 note
    osc.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + duration);
}
