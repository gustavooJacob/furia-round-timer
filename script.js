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
    
    // Web Audio API
    let audioContext = null;
    let tickBuffer = null;
    let tickSource = null;
    let tickGainNode = null;
    let isTickPlaying = false;
    
    // Inicializar Web Audio API
    function initAudioContext() {
        try {
            // Criar o contexto de áudio
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Carregar o som de tique-taque
            loadTickSound();
            
            console.log('Audio context initialized');
        } catch (e) {
            console.error('Web Audio API não suportada:', e);
        }
    }
    
    // Carregar o som de tique-taque
    function loadTickSound() {
        fetch('assents/10 Second Countdown ⧸ Bomb Countdown.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                tickBuffer = audioBuffer;
                console.log('Tick sound loaded');
            })
            .catch(error => console.error('Error loading tick sound:', error));
    }
    
    // Reproduzir o som de tique-taque
    function playTickSound() {
        if (!audioContext || !tickBuffer || !soundEnabled || isTickPlaying) return;
        
        try {
            // Parar qualquer som anterior
            stopTickSound();
            
            // Criar uma fonte de áudio
            tickSource = audioContext.createBufferSource();
            tickSource.buffer = tickBuffer;
            
            // Criar um nó de ganho para controlar o volume
            tickGainNode = audioContext.createGain();
            
            // Ajustar o volume com base no tempo restante
            const volume = Math.min(1, 0.7 + (10 - time) * 0.03);
            tickGainNode.gain.value = volume;
            
            // Conectar a fonte ao nó de ganho e o nó de ganho à saída
            tickSource.connect(tickGainNode);
            tickGainNode.connect(audioContext.destination);
            
            // Marcar como tocando
            isTickPlaying = true;
            
            // Configurar o evento de término
            tickSource.onended = function() {
                isTickPlaying = false;
                
                // Se o timer ainda estiver rodando e abaixo de 10 segundos, tocar novamente
                if (isRunning && time <= 10 && time > 0) {
                    setTimeout(() => {
                        playTickSound();
                    }, time <= 5 ? 300 : 500);
                }
            };
            
            // Iniciar a reprodução
            tickSource.start(0);
            console.log('Tick sound played with volume:', volume);
        } catch (e) {
            console.error('Error playing tick sound:', e);
            isTickPlaying = false;
        }
    }
    
    // Parar o som de tique-taque
    function stopTickSound() {
        if (!isTickPlaying || !tickSource) return;
        
        try {
            tickSource.stop(0);
            isTickPlaying = false;
            console.log('Tick sound stopped');
        } catch (e) {
            console.error('Error stopping tick sound:', e);
        }
    }
    
    // Variáveis de estado
    let time = 115; // 1:55 em segundos
    let isRunning = false;
    let interval;
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
    const totalAudios = 2; // Reduzido para 2 porque o tick agora é carregado pela Web Audio API
    
    function checkAudioLoaded() {
        audiosLoaded++;
        if (audiosLoaded === totalAudios) {
            loadingAudio.style.display = 'none';
        }
    }
    
    audioRoundStart.addEventListener('canplaythrough', checkAudioLoaded);
    audioRoundEnd.addEventListener('canplaythrough', checkAudioLoaded);
    
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
            
            // Usar uma Promise para garantir que o som seja reproduzido
            const playPromise = audioClone.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error('Erro ao reproduzir som:', err);
                });
            }
        } catch (err) {
            console.error('Erro ao clonar áudio:', err);
        }
    }
    
    function updateTimer() {
        timerElement.textContent = formatTime(time);
        
        // Adicionar efeito visual para os últimos 10 segundos
        if (time <= 10 && isRunning) {
            timerCircle.classList.add('pulse');
            mainContainer.classList.add('red-pulse-bg'); // Adiciona o fundo vermelho pulsante
            
            // Iniciar o som de tique-taque se ainda não estiver tocando
            if (soundEnabled && !isTickPlaying) {
                playTickSound();
            }
            
            // Atualizar o volume do som de tique-taque
            if (tickGainNode && isTickPlaying) {
                const volume = Math.min(1, 0.7 + (10 - time) * 0.03);
                tickGainNode.gain.value = volume;
            }
        } else {
            timerCircle.classList.remove('pulse');
            mainContainer.classList.remove('red-pulse-bg'); // Remove o fundo vermelho pulsante
            
            // Parar o som de tique-taque
            stopTickSound();
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
        
        // Inicializar o contexto de áudio se necessário
        if (!audioContext) {
            initAudioContext();
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
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
            
            // Verificar se já devemos iniciar o som de tique-taque
            if (time <= 10 && time > 0 && soundEnabled) {
                playTickSound();
            }
            
            // Atualizar estado do botão de avanço rápido
            updateFastForwardButton();
        } else {
            resetTimer();
            startTimer();
        }
    }
    
    function pauseTimer() {
        if (!isRunning) return;
        
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        clearInterval(interval);
        
        // Parar o som de tique-taque
        stopTickSound();
        
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
        
        // Parar o som de tique-taque
        stopTickSound();
        
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
            
            // Reiniciar o som de tique-taque se necessário
            if (isRunning && time <= 10 && time > 0) {
                playTickSound();
            }
        } else {
            soundIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
            
            // Parar o som de tique-taque
            stopTickSound();
        }
    }
    
    // Função para testar o som de tique-taque
    function testTickSound() {
        console.log('Testing tick sound...');
        
        // Inicializar o contexto de áudio se necessário
        if (!audioContext) {
            initAudioContext();
            
            // Dar tempo para o buffer carregar
            setTimeout(() => {
                playTickSound();
            }, 500);
        } else {
            playTickSound();
        }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    fastForwardBtn.addEventListener('click', fastForward);
    soundBtn.addEventListener('click', toggleSound);
    
    // Adicionar um event listener para testar o som com um clique no timer
    timerCircle.addEventListener('click', testTickSound);
    
    // Inicialização
    updateTimer();
    changePhrase();
    pauseBtn.disabled = true;
    fastForwardBtn.disabled = true; // Inicialmente desativado
    
    // Inicializar o contexto de áudio quando a página carregar
    // Isso deve ser feito em resposta a uma interação do usuário em alguns navegadores
    document.addEventListener('click', function initAudioOnFirstClick() {
        if (!audioContext) {
            initAudioContext();
            document.removeEventListener('click', initAudioOnFirstClick);
        }
    });
});