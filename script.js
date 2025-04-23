document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const timerElement = document.getElementById('timer');
    const timerCircle = document.getElementById('timer-circle');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const fastForwardBtn = document.getElementById('fast-forward-btn');
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    const motivationText = document.getElementById('motivation-text');
    const loadingAudio = document.getElementById('loading-audio');
    const mainContainer = document.getElementById('main-container');
    
    // Elementos de áudio
    const audioRoundStart = document.getElementById('audio-round-start');
    const audioRoundEnd = document.getElementById('audio-round-end');
    const audioBombTick = document.getElementById('audio-bomb-tick');
    
    // Variáveis de estado
    let time = 115; // 1:55 em segundos
    let isRunning = false;
    let interval;
    let tickInterval;
    let soundEnabled = true;
    
    // Frases motivacionais
    const phrases = [
        "RUSH B!",
        "VAMOS FURIA!",
        "Clutch or Kick",
        "Eles são só cinco!",
        "Segura a bomba!",
        "Eco round? Que nada!",
        "Bora virar o jogo!",
        "Não dá peek!",
        "Planta a bomba!",
        "Segura o ângulo!",
    ];
    
    // Verificar se os áudios estão carregados
    let audiosLoaded = 0;
    const totalAudios = 3;
    
    function checkAudioLoaded() {
        audiosLoaded++;
        if (audiosLoaded === totalAudios) {
            loadingAudio.style.display = 'none';
        }
    }
    
    audioRoundStart.addEventListener('canplaythrough', checkAudioLoaded);
    audioRoundEnd.addEventListener('canplaythrough', checkAudioLoaded);
    audioBombTick.addEventListener('canplaythrough', checkAudioLoaded);
    
    // Mostrar o status de carregamento de áudio
    loadingAudio.style.display = 'block';
    
    // Funções auxiliares
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function changePhrase() {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        motivationText.textContent = `"${phrases[randomIndex]}"`;
        motivationText.classList.remove('fade-in');
        void motivationText.offsetWidth; // Trigger reflow
        motivationText.classList.add('fade-in');
    }
    
    function playSound(audio, volume = 1) {
        if (!soundEnabled) return;
        
        try {
            // Clonar o áudio para permitir sobreposição de sons
            const audioClone = audio.cloneNode();
            audioClone.volume = volume;
            audioClone.play().catch(err => {
                console.error('Erro ao reproduzir som:', err);
            });
        } catch (err) {
            console.error('Erro ao clonar áudio:', err);
        }
    }
    
    function playBombTickSound() {
        if (!soundEnabled) return;
        
        // Ajustar volume com base no tempo restante - fica mais alto conforme o tempo diminui
        const volume = Math.min(1, 1 - time / 115 + 0.3);
        playSound(audioBombTick, volume);
    }
    
    function updateTimer() {
        timerElement.textContent = formatTime(time);
        
        // Adicionar efeito visual para os últimos 10 segundos
        if (time <= 10 && isRunning) {
            timerCircle.classList.add('pulse');
            mainContainer.classList.add('red-pulse-bg'); // Adiciona o fundo vermelho pulsante
        } else {
            timerCircle.classList.remove('pulse');
            mainContainer.classList.remove('red-pulse-bg'); // Remove o fundo vermelho pulsante
        }
        
        // Atualizar estado do botão de avanço rápido
        updateFastForwardButton();
    }
    
    function updateFastForwardButton() {
        // O botão de avanço rápido só deve estar ativo quando o timer estiver rodando
        // e o tempo for maior que 10 segundos
        fastForwardBtn.disabled = !isRunning || time <= 10;
    }
    
    function startTimer() {
        if (isRunning) return;
        
        if (time > 0) {
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            playSound(audioRoundStart);
            
            interval = setInterval(() => {
                time--;
                updateTimer();
                
                if (time <= 0) {
                    stopTimer();
                    changePhrase();
                    playSound(audioRoundEnd);
                }
            }, 1000);
            
            // Iniciar o som de tique-taque nos últimos 10 segundos
            checkTickSound();
            
            // Atualizar estado do botão de avanço rápido
            updateFastForwardButton();
        } else {
            resetTimer();
            startTimer();
        }
    }
    
    function checkTickSound() {
        clearInterval(tickInterval);
        
        if (isRunning && time <= 10) {
            const interval = time <= 5 ? 300 : 500;
            tickInterval = setInterval(playBombTickSound, interval);
        }
    }
    
    function pauseTimer() {
        if (!isRunning) return;
        
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        clearInterval(interval);
        clearInterval(tickInterval);
        
        // Remover efeitos visuais quando pausado
        if (time <= 10) {
            mainContainer.classList.remove('red-pulse-bg');
        }
        
        // Atualizar estado do botão de avanço rápido
        updateFastForwardButton();
    }
    
    function stopTimer() {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        clearInterval(interval);
        clearInterval(tickInterval);
        
        // Remover efeitos visuais quando parado
        timerCircle.classList.remove('pulse');
        mainContainer.classList.remove('red-pulse-bg');
        
        // Atualizar estado do botão de avanço rápido
        updateFastForwardButton();
    }
    
    function resetTimer() {
        stopTimer();
        time = 115; // Reset para 1:55
        updateTimer();
        changePhrase();
    }
    
    function fastForward() {
        // Só avança se o timer estiver rodando e o tempo for maior que 10 segundos
        if (isRunning && time > 10) {
            // Avança para 10 segundos
            time = 10;
            updateTimer();
            
            // Inicia o som de tique-taque
            checkTickSound();
        }
    }
    
    function toggleSound() {
        soundEnabled = !soundEnabled;
        
        if (soundEnabled) {
            soundIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            `;
        } else {
            soundIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
        }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    fastForwardBtn.addEventListener('click', fastForward);
    soundBtn.addEventListener('click', toggleSound);
    
    // Inicialização
    updateTimer();
    changePhrase();
    pauseBtn.disabled = true;
    fastForwardBtn.disabled = true; // Inicialmente desativado
});