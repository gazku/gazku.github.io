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
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let playButton = document.getElementById('playButton');
let player;

function parseMidi(arrayBuffer) {
    midiData = new Uint8Array(arrayBuffer);
    playButton.disabled = false;
}

playButton.addEventListener('click', async function() {
    player = await Soundfont.instrument(audioContext, 'acoustic_grand_piano', { soundfont: 'FluidR3_GM' });
    playMidi();
});

function playMidi() {
    let offset = 0;
    const tempo = 120;  // default tempo
    const secondsPerBeat = 60 / tempo;

    for (let i = 0; i < midiData.length; i++) {
        const type = midiData[i];
        if ((type & 0xf0) === 0x90) {  // Note on
            const note = midiData[i + 1];
            const velocity = midiData[i + 2];
            if (velocity > 0) {
                player.play(note, audioContext.currentTime + offset * secondsPerBeat, { gain: velocity / 127 });
            }
            offset += 3;
        }
    }
}
