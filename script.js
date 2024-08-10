class VoiceRecorder {
    constructor() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log("getUserMedia supported");
        } else {
            console.log("getUserMedia is not supported on your browser!");
        }

        this.mediaRecorder = null;
        this.stream = null;
        this.chunks = [];
        this.isRecording = false;

        this.recorderRef = document.querySelector("#recorder");
        this.playerRef = document.querySelector("#player");
        this.startRef = document.querySelector("#start");
        this.stopRef = document.querySelector("#stop");
        
        this.startRef.onclick = this.startRecording.bind(this);
        this.stopRef.onclick = this.stopRecording.bind(this);

        this.constraints = {
            audio: true,
            video: false
        };
    }

    handleSuccess(stream) {
        this.stream = stream;
        this.stream.oninactive = () => {
            console.log("Stream ended!");
        };
        this.recorderRef.srcObject = this.stream;
        this.mediaRecorder = new MediaRecorder(this.stream);
        console.log(this.mediaRecorder);
        this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable.bind(this);
        this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this);
        this.recorderRef.play();
        this.mediaRecorder.start();
    }

    handleError(error) {
        console.log("navigator.getUserMedia error: ", error);
    }
    
    onMediaRecorderDataAvailable(e) {
        this.chunks.push(e.data);
    }
    
    onMediaRecorderStop() { 
        const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
        const audioURL = window.URL.createObjectURL(blob);
        this.playerRef.src = audioURL;
        this.chunks = [];
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
        this.playerRef.classList.remove('hidden');
        document.querySelector('.title').classList.remove('hidden');
        this.stopRef.classList.add('hidden');
        this.startRef.classList.remove('hidden');
    }

    startRecording() {
        if (this.isRecording) return;
        this.isRecording = true;
        this.startRef.classList.add('hidden');
        this.stopRef.classList.remove('hidden');
        this.playerRef.src = '';
        this.playerRef.classList.add('hidden');
        document.querySelector('.title').classList.add('hidden');

        navigator.mediaDevices
            .getUserMedia(this.constraints)
            .then(this.handleSuccess.bind(this))
            .catch(this.handleError.bind(this));
    }
    
    stopRecording() {
        if (!this.isRecording) return;
        this.isRecording = false;
        this.recorderRef.pause();
        this.mediaRecorder.stop();
    }
}

window.voiceRecorder = new VoiceRecorder();