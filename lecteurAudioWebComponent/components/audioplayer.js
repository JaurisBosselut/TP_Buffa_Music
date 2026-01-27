// ici un web component qui encapsule un lecteur audio HTLML5 basique
import "./libs/webaudiocontrols.js";

let style = `
<style>
    audio {
        border: 2px solid #333;
        border-radius: 5px;
        padding: 5px;
        background-color: #f0f0f0;
    }

    #visualizers {
        display: flex;
        gap: 20px;              /* espace entre les deux */
        align-items: flex-start;
        margin-top: 20px;
    }

    #visualization_waveform,
    #visualization_frequency,#visualization_volume {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #ccc;
        padding: 10px;
        background-color: #fafafa;
    }


</style>
`;
let html = `        
    <audio id="myplayer" src=""></audio>
    <button id="playbtn">Play</button>
    <button id="pausebtn">Pause</button>
    <button id="prevBtn">⏮ Prev</button>
    <button id="nextBtn">⏭ Next</button>
    <button id="shuffleBtn">🔀 Shuffle OFF</button>

    <br>
    <label>
        Volume:
        <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="0.5">
        <span id="volume-value" style="position:relative; top:-5px;">volume = 0.5</span>

        Balance:
        <input type="range" id="balanceSlider" min="-1" max="1" step="0.01" value="0">
        <span id="balance-value" style="position:relative; top:-5px;">balance = 0</span>

        Detune:
        <input id="detuneSlider" type="range" min="-1200" max="1200" step="1" value="0" style="height: 20px; width: 200px;">
        <span id="detune-value" style="position:relative; top:-5px;">detune = 0</span>

        Gain:
        <input id="filterGainSlider" type="range" min="-30" max="30" step="1" value="0">
        <span id="gain-value">gain = 0 dB</span>

    </label>
    <br><br>

    <div>
        Frequency: 
        <input id="frequencySlider" type="range" min="100" max="10000" step="1" value="440" style="height: 20px; width: 200px;">
        <span id="frequency-value" style="position:relative; top:-5px;">frequency = 440 Hz</span>
    </div>
    <br>
    <div>
        Q: 
        <input id="qSlider" type="range" min="0.0001" max="1000" step="0.0001" value="1" style="height: 20px; width: 200px;">
        <span id="Q-value" style="position:relative; top:-5px;">Q = 1</span>

        <webaudio-knob id="knobVolume" src="bouton.png" min=0 max=1 step=0.01 value=0.5></webaudio-knob>
    </div>

    <div>
        Type:
        <select id="filtertype">
            <option value="allpass">allpass</option>
            <option value="lowpass">lowpass</option>
            <option value="highpass">highpass</option>
            <option value="bandpass">bandpass</option>
            <option value="lowshelf">lowshelf</option>
            <option value="highshelf">highshelf</option>
            <option value="peaking">peaking</option>
            <option value="notch">notch</option>
        </select>
    </div>

    <div>
        Reverb:
        <input id="reverbSlider" type="range" min="0" max="1" step="0.01" value="0">
        <span id="reverb-value">reverb = 0</span>
        <button id="compressorButton">Turn Compressor On</button>
    </div>


    <h2>Frequency Response</h2>
        <p>A sample showing the frequency response graphs of various kinds of <code>BiquadFilterNodes</code>.</p>

    <canvas id="canvasID" width="600" height="300"></canvas>

    <h3>6-Band Equalizer : </h3>
    <div class="controls">
        <label>60Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 0);"></input>
    <output id="gain0">0 dB</output>
    </div>
    <div class="controls">
        <label>170Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 1);"></input>
    <output id="gain1">0 dB</output>
    </div>
    <div class="controls">
        <label>350Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 2);"></input>
    <output id="gain2">0 dB</output>
    </div>
    <div class="controls">
        <label>1000Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 3);"></input>
    <output id="gain3">0 dB</output>
    </div>
    <div class="controls">
        <label>3500Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 4);"></input>
    <output id="gain4">0 dB</output>
    </div>
    <div class="controls">
        <label>10000Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 5);"></input>
    <output id="gain5">0 dB</output>
    </div>
    <br></br>
    <div id="visualizers">
        <div id="visualization_waveform">
            <h2>2D audio visualization: waveform</h2>
            <canvas id="waveformCanvas" width="600" height="200"></canvas>
        </div>

        <div id="visualization_frequency">
            <h2>2D audio visualization: frequency</h2>
            <canvas id="frequencyCanvas" width="600" height="200"></canvas>
        </div>

        <div id="visualization_volume">
            <h2>Volume (VU meter)</h2>
            <canvas id="volumeCanvas" width="80" height="200"></canvas>
        </div>

    </div>

<script> 
`;


class MyAudioPlayer extends HTMLElement {
    constructor() {
        super();
        // On crée un shadow DOM: le HTML contenu dans le shadow DOM ne sera pas affecté par 
        // les styles CSS de la page hôte, et ne sera visible dans le debugger que si on coche 
        // la case dans les options du debugger "Show user agent shadow DOM"
        this.attachShadow({ mode: 'open' });

        // On récupère l'attribut src qui contient l'URL du fichier audio à lire
        this.src = this.getAttribute('src');
        console.log("AudioPlayer: src attribute = ", this.src);
        this.audioContext = new AudioContext();
    }  


    setSource(newSrc) {
        this.src = newSrc; // met à jour l'attribut interne
        const audioElement = this.shadowRoot.querySelector('#myplayer');
        audioElement.src = newSrc;
        audioElement.play(); // optional : démarre la musique immédiatement
    }


    connectedCallback() {
        // Cette méthode est appelée lorsque le composant est inséré dans la page HTML
        // on ajoute du HTML et du CSS dans le shadow DOM
        this.shadowRoot.innerHTML = style + html;

        // on initialise le src de l'élément audio
        const audioElement = this.shadowRoot.querySelector('#myplayer');
        audioElement.src = this.src;

        this.source = this.audioContext.createMediaElementSource(audioElement);


        // on définit les listeners pour les boutons et le slider
        this.defineListeners();
    }

    defineListeners() {
        const audioElement = this.shadowRoot.querySelector('#myplayer');
        const playButton = this.shadowRoot.querySelector('#playbtn');
        const pauseButton = this.shadowRoot.querySelector('#pausebtn');
        const volumeslider = this.shadowRoot.querySelector('#volumeslider');
        const pannerSlider = this.shadowRoot.querySelector('#balanceslider');
        const frequencySlider = this.shadowRoot.querySelector('#frequencyslider');
        const detuneSlider = this.shadowRoot.querySelector('#detuneslider');
        const qSlider = this.shadowRoot.querySelector('#qslider');
        const filterTypeSelect = this.shadowRoot.querySelector('#filtertype');
        const reverbSlider = this.shadowRoot.querySelector('#reverbSlider');

        const gainSliders = [
            this.shadowRoot.querySelector('#gain0'),
            this.shadowRoot.querySelector('#gain1'),
            this.shadowRoot.querySelector('#gain2'),
            this.shadowRoot.querySelector('#gain3'),
            this.shadowRoot.querySelector('#gain4'),
            this.shadowRoot.querySelector('#gain5')
        ];

        const nextBtn = this.shadowRoot.querySelector('#nextBtn');
        const prevBtn = this.shadowRoot.querySelector('#prevBtn');
        const shuffleBtn = this.shadowRoot.querySelector('#shuffleBtn');

        shuffleBtn.addEventListener('click', () => {
            this.shuffle = !this.shuffle;
            shuffleBtn.textContent = this.shuffle ? "🔀 Shuffle ON" : "🔀 Shuffle OFF";
        });


        const audioContext = this.audioContext;


        const selector = document.getElementById("musicSelector");
        this.playlist = Array.from(selector.options).map(opt => opt.value);
        this.currentIndex = selector.selectedIndex || 0;
        this.shuffle = false;
        this.history = [];


        const player = document.getElementById("player");

        selector.addEventListener("change", (e) => {
            loadTrack(e.target.selectedIndex);
        });



        /* =========================
        AUDIO NODES et affichage graphe
        ========================= */

        const source = this.source;

        // EQ
        const eqFrequencies = [60, 170, 350, 1000, 3500, 10000];
        const eqFilters = eqFrequencies.map(freq => {
            const f = audioContext.createBiquadFilter();
            f.type = "peaking";
            f.frequency.value = freq;
            f.Q.value = 1;
            f.gain.value = 0;
            return f;
        });

        // Filtre global
        const filter = audioContext.createBiquadFilter();
        filter.type = "allpass";

        const masterGain = audioContext.createGain();
        masterGain.gain.value = 1;



        // Compresseur
        const compressorNode = audioContext.createDynamicsCompressor();
        let compressorOn = false;

        // Panner
        const panner = audioContext.createStereoPanner();

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // résolution temporelle


        // Reverb
        const convolver = audioContext.createConvolver();
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();

        dryGain.gain.value = 1;
        wetGain.gain.value = 0;
        // Graphe de réponse en fréquence
        const canvas = this.shadowRoot.querySelector('#canvasID');
        const frequencyRenderer = this.FilterFrequencyResponseRenderer(canvas, audioContext);
        frequencyRenderer.draw([...eqFilters, filter]);

        /* =========================
        ROUTING PROPRE (UNE SEULE CHAÎNE)
        ========================= */

        // source → EQ
        source.connect(eqFilters[0]);
        for (let i = 0; i < eqFilters.length - 1; i++) {
            eqFilters[i].connect(eqFilters[i + 1]);
        }

        // EQ → filtre
        eqFilters[eqFilters.length - 1].connect(filter);

        // connexion par défaut (sans compresseur)
        filter.connect(masterGain);
        masterGain.connect(panner);
        panner.connect(analyser);
        analyser.connect(dryGain);
        dryGain.connect(audioContext.destination);

        /* =========================
        TRACK LOADING AND NAVIGATION
        ========================= */

        const loadTrack = (index) => {
            if (this.currentIndex !== index) {
                this.history.push(this.currentIndex);
            }

            this.currentIndex = index;
            const track = this.playlist[this.currentIndex];
            audioElement.src = track;
            audioElement.play();
            selector.selectedIndex = this.currentIndex;
        };


        const nextTrack = () => {
            if (this.shuffle) {
                let next;
                do {
                    next = Math.floor(Math.random() * this.playlist.length);
                } while (next === this.currentIndex);
                loadTrack(next);
            } else {
                loadTrack((this.currentIndex + 1) % this.playlist.length);
            }
        };

        const prevTrack = () => {
            if (this.shuffle && this.history.length > 0) {
                const previousIndex = this.history.pop();
                this.currentIndex = previousIndex;
                audioElement.src = this.playlist[this.currentIndex];
                audioElement.play();
                selector.selectedIndex = this.currentIndex;
            } else {
                loadTrack(
                    (this.currentIndex - 1 + this.playlist.length) % this.playlist.length
                );
            }
        };


        nextBtn.addEventListener('click', nextTrack);
        prevBtn.addEventListener('click', prevTrack);

        /* =========================
        Gain node
        ========================= */

        const filterGainSlider = this.shadowRoot.querySelector('#filterGainSlider');

        filterGainSlider.addEventListener('input', e => {
            const value = parseFloat(e.target.value);
            filter.gain.value = value;
            this.shadowRoot.querySelector('#gain-value').textContent = `gain = ${value} dB`;
            frequencyRenderer.draw([...eqFilters, filter]);
        });

        /* =========================
        UI LISTENERS
        ========================= */

        playButton.addEventListener('click', () => {
            audioContext.resume();
            audioElement.play();
            drawWaveform();
            drawFrequency();
            drawVolume();
        });

        pauseButton.addEventListener('click', () => {
            audioElement.pause();
        });

        volumeslider.addEventListener('input', e => {
            audioElement.volume = e.target.value;
            this.shadowRoot.querySelector('#volume-value').textContent = "volume = " + e.target.value;
        });

        pannerSlider.addEventListener('input', e => {
            panner.pan.value = e.target.value;
            this.shadowRoot.querySelector('#balance-value').textContent = "balance = " + e.target.value;
        });

        frequencySlider.addEventListener('input', e => {
            filter.frequency.value = e.target.value;
            this.shadowRoot.querySelector('#frequency-value').textContent = "frequency = " + e.target.value + " Hz";
            frequencyRenderer.draw([...eqFilters, filter]);
        });

        detuneSlider.addEventListener('input', e => {
            filter.detune.value = e.target.value;
            this.shadowRoot.querySelector('#detune-value').textContent = "detune = " + e.target.value;
            frequencyRenderer.draw([...eqFilters, filter]);
        });

        qSlider.addEventListener('input', e => {
            filter.Q.value = e.target.value;
            this.shadowRoot.querySelector('#Q-value').textContent = "Q = " + e.target.value;
            frequencyRenderer.draw([...eqFilters, filter]);
        });

        filterTypeSelect.addEventListener('change', e => {
            filter.type = e.target.value;
            frequencyRenderer.draw([...eqFilters, filter]);
        });

        let reverbActive = false;

        reverbSlider.addEventListener('input', e => {
            const value = parseFloat(e.target.value);

            // dry toujours actif
            dryGain.gain.value = 1 - value;

            if (value > 0 && !reverbActive) {
                // activation reverb
                panner.connect(convolver);
                convolver.connect(wetGain);
                wetGain.connect(audioContext.destination);
                reverbActive = true;
            }

            if (value === 0 && reverbActive) {
                // bypass total reverb
                panner.disconnect(convolver);
                convolver.disconnect(wetGain);
                wetGain.disconnect(audioContext.destination);
                reverbActive = false;
            }

            wetGain.gain.value = value;

            this.shadowRoot.querySelector('#reverb-value').textContent = "reverb = " + value;
        });


        /* =========================
        EQ SLIDERS
        ========================= */

        window.changeGain = (value, index) => {
            const dbValue = parseFloat(value);
            eqFilters[index].gain.value = dbValue;
            gainSliders[index].textContent = `${dbValue} dB`;
            frequencyRenderer.draw([...eqFilters, filter]);
        };

        /* =========================
        COMPRESSOR TOGGLE
        ========================= */

        const compressorButton = this.shadowRoot.querySelector('#compressorButton');

        compressorButton.addEventListener('click', () => {
            filter.disconnect();

            if (compressorOn) {
                filter.connect(panner); // bypass
                compressorButton.textContent = "Turn Compressor On";
            } else {
                filter.connect(compressorNode);
                compressorNode.connect(panner);
                compressorButton.textContent = "Turn Compressor Off";
            }

            compressorOn = !compressorOn;
        });


        /* =========================
        REVERB IR
        ========================= */

        async function loadImpulseResponse(url) {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            convolver.buffer = await audioContext.decodeAudioData(buffer);
        }

        loadImpulseResponse("truc.wav");


        /* =========================
        WAVEFORM VISUALIZATION
        ========================= */

        const waveformCanvas = this.shadowRoot.querySelector("#waveformCanvas");
        const waveCtx = waveformCanvas.getContext("2d");

        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        function drawWaveform() {
            requestAnimationFrame(drawWaveform);

            analyser.getByteTimeDomainData(dataArray);

            waveCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

            waveCtx.lineWidth = 2;
            waveCtx.strokeStyle = "rgb(0, 200, 255)";
            waveCtx.beginPath();

            const sliceWidth = waveformCanvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0; // [0..255] → [0..2]
                const y = (v * waveformCanvas.height) / 2;

                if (i === 0) waveCtx.moveTo(x, y);
                else waveCtx.lineTo(x, y);

                x += sliceWidth;
            }

            waveCtx.stroke();
        }

        /* =========================
        FREQUENCY VISUALIZATION
        ========================= */

        const frequencyCanvas = this.shadowRoot.querySelector("#frequencyCanvas");
        const freqCtx = frequencyCanvas.getContext("2d");

        const freqBufferLength = analyser.frequencyBinCount;
        const freqDataArray = new Uint8Array(freqBufferLength);

        function drawFrequency() {
            requestAnimationFrame(drawFrequency);

            analyser.getByteFrequencyData(freqDataArray);

            freqCtx.clearRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);

            const barWidth = (frequencyCanvas.width / freqBufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < freqBufferLength; i++) {
                const value = freqDataArray[i];
                const barHeight = (value / 255) * frequencyCanvas.height;

                freqCtx.fillStyle = "rgb(0, 0, 0)"; // barres noires
                freqCtx.fillRect(
                    x,
                    frequencyCanvas.height - barHeight,
                    barWidth,
                    barHeight
                );

                x += barWidth + 1;
            }
        }

        /* =========================
        VOLUME VISUALIZATION (VU METER)
        ========================= */

        const volumeCanvas = this.shadowRoot.querySelector("#volumeCanvas");
        const volCtx = volumeCanvas.getContext("2d");

        const volumeBufferLength = analyser.fftSize;
        const volumeDataArray = new Uint8Array(volumeBufferLength);

        function drawVolume() {
            requestAnimationFrame(drawVolume);

            analyser.getByteTimeDomainData(volumeDataArray);

            // calcul RMS
            let sum = 0;
            for (let i = 0; i < volumeBufferLength; i++) {
                const v = (volumeDataArray[i] - 128) / 128; // [-1..1]
                sum += v * v;
            }
            const rms = Math.sqrt(sum / volumeBufferLength); // 0..~1

            // normalisation visuelle
            const volumeHeight = rms * volumeCanvas.height * 1.4;

            // clear
            volCtx.clearRect(0, 0, volumeCanvas.width, volumeCanvas.height);

            // couleur type VU
            let color = "green";
            if (rms > 0.5) color = "orange";
            if (rms > 0.75) color = "red";

            volCtx.fillStyle = color;
            volCtx.fillRect(
                0,
                volumeCanvas.height - volumeHeight,
                volumeCanvas.width,
                volumeHeight
            );
        }


    }


    FilterFrequencyResponseRenderer(canvas, audioCxt) {
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const audioContext = audioCxt;

        const curveColor = "rgb(224,27,106)";
        const gridColor = "rgb(100,100,100)";
        const textColor = "rgb(81,127,207)";

        const dbScale = 60;
        let pixelsPerDb = (0.5 * height) / dbScale;

        const dbToY = db => (0.5 * height) - pixelsPerDb * db;

        function drawGrid(nyquist, noctaves) {
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;

            // lignes verticales (fréquences)
            for (let octave = 0; octave <= noctaves; octave++) {
                let x = octave * width / noctaves;
                ctx.beginPath();
                ctx.moveTo(x, 30);
                ctx.lineTo(x, height);
                ctx.stroke();

                let f = nyquist * Math.pow(2, octave - noctaves);
                let label = f >= 1000 ? (f / 1000).toFixed(1) + "kHz" : f.toFixed(0) + "Hz";

                ctx.strokeStyle = textColor;
                ctx.textAlign = "center";
                ctx.strokeText(label, x, 20);
                ctx.strokeStyle = gridColor;
            }

            // ligne 0dB
            ctx.beginPath();
            ctx.moveTo(0, 0.5 * height);
            ctx.lineTo(width, 0.5 * height);
            ctx.stroke();

            // lignes dB
            for (let db = -dbScale; db <= dbScale; db += 10) {
                let y = dbToY(db);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();

                ctx.strokeStyle = textColor;
                ctx.strokeText(db + " dB", width - 40, y);
                ctx.strokeStyle = gridColor;
            }
        }

        function draw(filters) {
            ctx.clearRect(0, 0, width, height);

            const nyquist = 0.5 * audioContext.sampleRate;
            const noctaves = 11;

            const frequencyHz = new Float32Array(width);
            const magResponse = new Float32Array(width);
            const phaseResponse = new Float32Array(width);

            // init fréquences + magnitude
            for (let i = 0; i < width; i++) {
                let f = i / width;
                frequencyHz[i] = nyquist * Math.pow(2, noctaves * (f - 1));
                magResponse[i] = 1;
            }

            // multiplier les réponses de tous les filtres
            filters.forEach(filter => {
                const tmpMag = new Float32Array(width);
                filter.getFrequencyResponse(frequencyHz, tmpMag, phaseResponse);
                for (let i = 0; i < width; i++) {
                    magResponse[i] *= tmpMag[i];
                }
            });

            // grille
            drawGrid(nyquist, noctaves);

            // courbe finale
            ctx.beginPath();
            ctx.strokeStyle = curveColor;
            ctx.lineWidth = 3;

            for (let i = 0; i < width; i++) {
                const db = 20 * Math.log10(magResponse[i]);
                const x = i;
                const y = dbToY(db);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }

            ctx.stroke();
        }

        return { draw };
    }

}
customElements.define('my-audio-player', MyAudioPlayer);