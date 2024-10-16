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

function parseMidi(arrayBuffer) {
    const data = new DataView(arrayBuffer);
    let offset = 0;

    function readChunk() {
        const id = String.fromCharCode(
            data.getUint8(offset),
            data.getUint8(offset + 1),
            data.getUint8(offset + 2),
            data.getUint8(offset + 3)
        );
        const length = data.getUint32(offset + 4);
        const chunkData = new Uint8Array(arrayBuffer, offset + 8, length);
        offset += 8 + length;
        return { id, length, chunkData };
    }

    const header = readChunk();
    const tracks = [];

    while (offset < data.byteLength) {
        const track = readChunk();
        tracks.push(track);
    }

    displayMidiInfo(header, tracks);
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
