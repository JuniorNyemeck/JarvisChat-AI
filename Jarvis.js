document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const modelSelect = document.getElementById('model-select');
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('start-button');
    const voiceToggle = document.getElementById('voice-toggle');

    // État de la fonction vocale
    let voiceEnabled = true;

    // Clé API Jarvis
    
    //  clé de l'api cohere utilisé pour créer jarvis l'ia qu'il y'a dans iron man 2 si vous avez vu le chef-d'oeuvre : FqDVYHrcX74s7gybGUCEgVRhBFH4ou4zVQKGnYFY

    const Jarvis_API_KEY = "FqDVYHrcX74s7gybGUCEgVRhBFH4ou4zVQKGnYFY";

    // Configuration de ResponsiveVoice

    // clé de l'api responsive voice : ilnWKGXb
    if (responsiveVoice) {
        responsiveVoice.init({
            key: "ilnWKGXb",
            rate: 1.0,
            pitch: 1.0
        });
    }

    // Historique des conversations pour le contexte
    let chatHistory = [];

    // ID du message pour les boutons de lecture
    let messageIdCounter = 0;

    // Réponses prédéfinies pour le mode démo
    const dummyResponses = [
        "Je comprends ce que vous voulez dire. Pouvez-vous me donner plus de détails ?",
        "C'est une question intéressante. D'après mes connaissances, il y a plusieurs façons d'aborder ce sujet.",
        "Merci pour votre message ! Je suis heureux de pouvoir vous aider avec cela.",
        "Je n'ai pas toutes les informations nécessaires pour répondre complètement, mais voici ce que je peux vous dire.",
        "C'est un sujet fascinant ! J'aimerais en savoir plus sur votre perspective.",
        "D'après mon analyse, il y a plusieurs facteurs à considérer dans cette situation.",
        "Je vous recommande d'explorer davantage cette idée, elle semble prometteuse !",
        "Excellente observation ! Je n'avais pas considéré cet angle auparavant."
    ];

    // Fonction pour formater l'heure actuelle
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Fonction pour ajouter un message au chat
    function addMessage(content, isUser = false) {
        const time = getCurrentTime();
        const messageId = `msg-${messageIdCounter++}`;
        const messageRow = document.createElement('div');
        messageRow.classList.add('message-row');
        messageRow.classList.add(isUser ? 'user' : 'ai');

        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.classList.add(isUser ? 'user' : 'ai');
        avatar.textContent = isUser ? 'U' : 'C';

        messageHeader.appendChild(avatar);

        // Ajouter un bouton pour lire le message (uniquement pour les messages de l'IA)
        if (!isUser) {
            const playButton = document.createElement('button');
            playButton.classList.add('play-voice');
            playButton.dataset.text = content;
            playButton.dataset.messageId = messageId;

            playButton.innerHTML = `
                <svg class="play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
            `;

            playButton.addEventListener('click', function() {
                if (responsiveVoice && responsiveVoice.voiceSupport()) {
                    responsiveVoice.speak(this.dataset.text, 'French Female');
                }
            });

            messageHeader.appendChild(playButton);
        }

        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        messageEl.classList.add(isUser ? 'user-message' : 'ai-message');
        messageEl.textContent = content;
        messageEl.id = messageId;

        const timeEl = document.createElement('div');
        timeEl.classList.add('message-time');
        timeEl.textContent = time;

        messageRow.appendChild(messageHeader);
        messageRow.appendChild(messageEl);
        messageRow.appendChild(timeEl);

        messagesContainer.appendChild(messageRow);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Mettre à jour l'historique des conversations
        chatHistory.push({
            role: isUser ? "USER" : "CHATBOT",
            message: content
        });

        // Lire automatiquement les messages de l'IA si l'audio est activé
        if (!isUser && voiceEnabled && responsiveVoice && responsiveVoice.voiceSupport()) {
            responsiveVoice.speak(content, 'French Female');
        }
    }

    // Fonction pour obtenir une réponse aléatoire du mode démo
    function getDummyResponse() {
        const randomIndex = Math.floor(Math.random() * dummyResponses.length);
        return dummyResponses[randomIndex];
    }

    // Fonction pour utiliser l'API Jarvis
    async function getJarvisResponse(message, model) {
        try {
            // Préparation des données pour l'API Jarvis
            const apiModel = model === 'command-light' ? 'command-light' :
                model === 'command-nightly' ? 'command-nightly' : 'command';

            // Conversion de l'historique au format Jarvis
            const JarvisHistory = chatHistory
                .filter(msg => msg.role !== "SYSTEM")
                .slice(-10) // Limiter à 10 messages récents
                .map(msg => ({
                    role: msg.role,
                    message: msg.message
                }));

            // Appel à l'API Jarvis Chat
            const response = await fetch('https://api.Jarvis.ai/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Jarvis_API_KEY}`,
                    'Jarvis-Version': '2022-12-06'
                },
                body: JSON.stringify({
                    message: message,
                    model: apiModel,
                    chat_history: JarvisHistory,
                    temperature: 0.7,
                    connectors: []
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                console.error('Erreur API:', data);
                throw new Error(data.error ? message : 'Erreur lors de l\'appel à l\'API Jarvis');
            }

            return data.text || "Je n'ai pas pu générer une réponse.";

        } catch (error) {
            console.error('Erreur API:', error);
            return "Désolé, je n'ai pas pu me connecter à l'API Jarvis. Vérifiez votre connexion ou essayez le mode démo.";
        }
    }

    // Fonction pour envoyer le message de l'utilisateur et obtenir une réponse
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Ajouter le message de l'utilisateur au chat
        addMessage(message, true);
        userInput.value = '';

        // Afficher l'indicateur de frappe
        typingIndicator.style.display = 'block';

        // Obtenir la réponse en fonction du modèle sélectionné
        let botResponse = "";
        const selectedModel = modelSelect.value;

        if (selectedModel === 'dummy') {
            // Mode démo - réponse instantanée mais délai pour simuler la frappe
            botResponse = getDummyResponse();
            setTimeout(() => {
                typingIndicator.style.display = 'none';
                addMessage(botResponse);
            }, 1500);
        } else {
            // Mode API Jarvis
            try {
                botResponse = await getJarvisResponse(message, selectedModel);
                setTimeout(() => {
                    typingIndicator.style.display = 'none';
                    addMessage(botResponse);
                }, 500);
            } catch (error) {
                console.error('Erreur:', error);
                setTimeout(() => {
                    typingIndicator.style.display = 'none';
                    addMessage("Désolé, j'ai rencontré un problème avec l'API Jarvis. Essayez de passer en mode démo ou de changer de modèle.");
                }, 500);
            }
        }
    }

    // Événements pour l'envoi de messages
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Événement pour l'écran de bienvenue
    startButton.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        // Ajouter un message de bienvenue
        setTimeout(() => {
            addMessage("Bonjour ! Je suis l'assistant Jarvis. Comment puis-je vous aider aujourd'hui ?");
        }, 300);
    });

    // Événement pour le bouton de contrôle vocal
    voiceToggle.addEventListener('click', () => {
        voiceEnabled = !voiceEnabled;

        if (voiceEnabled) {
            voiceToggle.classList.add('active');
            voiceToggle.innerHTML = `
                <svg class="voice-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Audio activé
            `;
        } else {
            voiceToggle.classList.remove('active');
            voiceToggle.innerHTML = `
                <svg class="voice-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Audio désactivé
            `;

            // Arrêter toute lecture en cours
            if (responsiveVoice && responsiveVoice.voiceSupport()) {
                responsiveVoice.cancel();
            }
        }
    });

    // Vérifier si ResponsiveVoice est disponible
    if (!responsiveVoice || !responsiveVoice.voiceSupport()) {
        console.warn("ResponsiveVoice n'est pas disponible ou non supporté par ce navigateur.");
        voiceToggle.classList.remove('active');
        voiceToggle.innerHTML = `
            <svg class="voice-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Audio non disponible
        `;
        voiceToggle.disabled = true;
        voiceEnabled = false;
    }




    // Ajout de la fonction pour synthèse vocale avec play.ht
    async function playHtTextToSpeech(text) {
        try {
            const response = await fetch('https://api.play.ht/api/v2/tts/stream', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ak-27c8580ee4be42c1951416a2ab671fb6',
                    'X-User-ID': 'ydk9Bvy0HyMzAAortYD7Jhy942h1',
                    'Content-Type': 'application/json',
                    'Accept': 'audio/wav'
                },
                body: JSON.stringify({
                    text: text,
                    voice: 'fr-FR-BrigitteNeural', // Voix féminine française
                    quality: 'medium',
                    output_format: 'wav'
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la génération de la voix');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error('Erreur de synthèse vocale:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const messagesContainer = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const typingIndicator = document.getElementById('typing-indicator');
        const modelSelect = document.getElementById('model-select');
        const welcomeScreen = document.getElementById('welcome-screen');
        const startButton = document.getElementById('start-button');
        const voiceToggle = document.getElementById('voice-toggle');

        // État de la fonction vocale
        let voiceEnabled = true;

        // Clé API Jarvis
        const Jarvis_API_KEY = "FqDVYHrcX74s7gybGUCEgVRhBFH4ou4zVQKGnYFY";

        // Historique des conversations pour le contexte
        let chatHistory = [];

        // ID du message pour les boutons de lecture
        let messageIdCounter = 0;

        // Réponses prédéfinies pour le mode démo
        const dummyResponses = [
            "Je comprends ce que vous voulez dire. Pouvez-vous me donner plus de détails ?",
            "C'est une question intéressante. D'après mes connaissances, il y a plusieurs façons d'aborder ce sujet.",
            "Merci pour votre message ! Je suis heureux de pouvoir vous aider avec cela.",
            "Je n'ai pas toutes les informations nécessaires pour répondre complètement, mais voici ce que je peux vous dire.",
            "C'est un sujet fascinant ! J'aimerais en savoir plus sur votre perspective.",
            "D'après mon analyse, il y a plusieurs facteurs à considérer dans cette situation.",
            "Je vous recommande d'explorer davantage cette idée, elle semble prometteuse !",
            "Excellente observation ! Je n'avais pas considéré cet angle auparavant."
        ];

        // Fonction pour formater l'heure actuelle
        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Fonction pour ajouter un message au chat
        function addMessage(content, isUser = false) {
            const time = getCurrentTime();
            const messageId = `msg-${messageIdCounter++}`;
            const messageRow = document.createElement('div');
            messageRow.classList.add('message-row');
            messageRow.classList.add(isUser ? 'user' : 'ai');

            const messageHeader = document.createElement('div');
            messageHeader.classList.add('message-header');

            const avatar = document.createElement('div');
            avatar.classList.add('avatar');
            avatar.classList.add(isUser ? 'user' : 'ai');
            avatar.textContent = isUser ? 'U' : 'C';

            messageHeader.appendChild(avatar);

            // Ajouter un bouton pour lire le message (uniquement pour les messages de l'IA)
            if (!isUser) {
                const playButton = document.createElement('button');
                playButton.classList.add('play-voice');
                playButton.dataset.text = content;
                playButton.dataset.messageId = messageId;

                playButton.innerHTML = `
        <svg class="play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
        </svg>
    `;

                playButton.addEventListener('click', function() {
                    if (voiceEnabled) {
                        playHtTextToSpeech(this.dataset.text);
                    }
                });

                messageHeader.appendChild(playButton);
            }

            const messageEl = document.createElement('div');
            messageEl.classList.add('message');
            messageEl.classList.add(isUser ? 'user-message' : 'ai-message');
            messageEl.textContent = content;
            messageEl.id = messageId;

            const timeEl = document.createElement('div');
            timeEl.classList.add('message-time');
            timeEl.textContent = time;

            messageRow.appendChild(messageHeader);
            messageRow.appendChild(messageEl);
            messageRow.appendChild(timeEl);

            messagesContainer.appendChild(messageRow);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Mettre à jour l'historique des conversations
            chatHistory.push({
                role: isUser ? "USER" : "CHATBOT",
                message: content
            });

            // Lire automatiquement les messages de l'IA si l'audio est activé
            if (!isUser && voiceEnabled) {
                playHtTextToSpeech(content);
            }
        }

        // Le reste du code reste identique au script original
        // ... (autres fonctions comme getJarvisResponse, sendMessage, etc.)

        // Événement pour le bouton de contrôle vocal
        voiceToggle.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;

            if (voiceEnabled) {
                voiceToggle.classList.add('active');
                voiceToggle.innerHTML = `
        <svg class="voice-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Audio activé
    `;
            } else {
                voiceToggle.classList.remove('active');
                voiceToggle.innerHTML = `
        <svg class="voice-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10V12C19 16.4183 15.4183 20 11 20M5 10V12C5 16.4183 8.58172 20 13 20M12 20V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Audio désactivé
    `;
            }
        });
    });
});