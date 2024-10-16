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

    playButton.disabled = false;
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

    for (let i = 0; i < midiData.byteLength; i++) {
        const type = midiData.getUint8(i);

        if (type === 0x90) {  // Note on
            const note = midiData.getUint8(i + 1);
            const velocity = midiData.getUint8(i + 2);

            if (velocity > 0) {
                const osc = audioContext.createOscillator();
                osc.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
                osc.connect(audioContext.destination);
                osc.start(now);
                osc.stop(now + 0.5);  // Play for 0.5 seconds
            }
        }
    }
}
