let midiAccess;
let midiOutput;
let midiData;

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

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccessInstance) {
    midiAccess = midiAccessInstance;
    midiOutput = Array.from(midiAccess.outputs.values())[0];  // Select port 0

    if (midiOutput) {
        playButton.disabled = false;
    } else {
        console.log('No MIDI output devices found.');
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

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
}

playButton.addEventListener('click', function() {
    playMidi();
});

function playMidi() {
    const now = performance.now();
    let offset = 0;

    function readChunk() {
        const type = midiData.getUint8(offset);
        if ((type & 0xf0) === 0x90) {  // Note on
            const note = midiData.getUint8(offset + 1);
            const velocity = midiData.getUint8(offset + 2);

            if (velocity > 0) {
                midiOutput.send([0x90, note, velocity], now + offset * 100);
            }
        }
        offset += 3;
    }

    while (offset < midiData.byteLength) {
        readChunk();
    }
}
