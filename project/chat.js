class JarvisChat {
    constructor() {
        this.currentConversationId = 1;
        this.conversations = new Map();
        this.models = {
            'jarvis-pro': 'Jarvis Pro',
            'gpt-4': 'GPT-4',
            'claude-3': 'Claude 3',
            'gemini-pro': 'Gemini Pro',
            'llama-2': 'Llama 2'
        };
        this.replyingTo = null;
        this.selectedFiles = [];
        
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordingStartTime = null;
        this.recordingTimer = null;
        
        this.emojis = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
            people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
            nature: ['🌿', '🍀', '🎍', '🎋', '🍃', '🌱', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '⭐'],
            food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️'],
            travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞'],
            objects: ['💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐']
        };
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadInitialConversation();
    }

    initializeApp() {
        // Initialize conversations
        this.conversations.set(1, {
            id: 1,
            title: 'Discussion générale',
            model: 'jarvis-pro',
            messages: [],
            createdAt: new Date()
        });
    }

    setupEventListeners() {
        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.createNewConversation();
        });

        // Model selector
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.updateConversationModel(e.target.value);
        });

        // Send message
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // File attachment
        document.getElementById('attachmentBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Remove files
        document.getElementById('removeFiles').addEventListener('click', () => {
            this.clearSelectedFiles();
        });

        // Close reply
        document.getElementById('closeReply').addEventListener('click', () => {
            this.closeReply();
        });

        // Search functionality
        document.querySelector('.action-btn[title="Rechercher"]').addEventListener('click', () => {
            this.toggleSearchBar();
        });

        document.getElementById('closeSearch').addEventListener('click', () => {
            this.hideSearchBar();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Emoji picker
        document.getElementById('emojiBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEmojiPicker();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-btn')) {
                this.hideEmojiPicker();
            }
        });

        // Emoji category selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.emoji-category')) {
                const category = e.target.closest('.emoji-category').dataset.category;
                this.showEmojiCategory(category);
                
                document.querySelectorAll('.emoji-category').forEach(cat => cat.classList.remove('active'));
                e.target.closest('.emoji-category').classList.add('active');
            }
        });

        // More options menu
        document.getElementById('moreOptionsBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMoreOptionsMenu();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.more-options-menu') && !e.target.closest('#moreOptionsBtn')) {
                this.hideMoreOptionsMenu();
            }
        });

        // More options actions
        document.getElementById('clearChatOption').addEventListener('click', () => {
            this.clearCurrentChat();
            this.hideMoreOptionsMenu();
        });

        document.getElementById('exportChatOption').addEventListener('click', () => {
            this.exportCurrentChat();
            this.hideMoreOptionsMenu();
        });

        // Settings panel
        document.querySelector('.settings-btn').addEventListener('click', () => {
            this.showSettingsPanel();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        // Profile photo change
        document.getElementById('changePhotoBtn').addEventListener('click', () => {
            document.getElementById('profilePhotoInput').click();
        });

        document.getElementById('profilePhotoInput').addEventListener('change', (e) => {
            this.handleProfilePhotoChange(e.target.files[0]);
        });

        // Username change
        document.getElementById('usernameInput').addEventListener('change', (e) => {
            this.updateUsername(e.target.value);
        });

        // Theme selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-option')) {
                const theme = e.target.closest('.theme-option').dataset.theme;
                this.changeTheme(theme);
                
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                e.target.closest('.theme-option').classList.add('active');
            }
        });

        // Background color change
        document.getElementById('backgroundColorPicker').addEventListener('change', (e) => {
            this.changeBackgroundColor(e.target.value);
        });

        // Background image upload
        document.getElementById('uploadBgBtn').addEventListener('click', () => {
            document.getElementById('backgroundImageInput').click();
        });

        document.getElementById('backgroundImageInput').addEventListener('change', (e) => {
            this.handleBackgroundImageChange(e.target.files[0]);
        });

        document.getElementById('removeBgBtn').addEventListener('click', () => {
            this.removeBackgroundImage();
        });

        // Voice recording
        document.getElementById('voiceBtn').addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });

        document.getElementById('cancelRecording').addEventListener('click', () => {
            this.cancelRecording();
        });

        document.getElementById('stopRecording').addEventListener('click', () => {
            this.stopRecording();
        });

        // Overlay click
        document.getElementById('overlay').addEventListener('click', () => {
            this.hideAllModals();
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.message-content')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.message'));
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Context menu actions
        document.getElementById('replyOption').addEventListener('click', () => {
            this.replyToMessage();
            this.hideContextMenu();
        });

        document.getElementById('copyOption').addEventListener('click', () => {
            this.copyMessage();
            this.hideContextMenu();
        });

        document.getElementById('deleteOption').addEventListener('click', () => {
            this.deleteMessage();
            this.hideContextMenu();
        });

        // Conversation actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.conversation-item')) {
                const conversationId = parseInt(e.target.closest('.conversation-item').dataset.conversationId);
                this.switchConversation(conversationId);
            }
            
            if (e.target.closest('.delete-btn')) {
                e.stopPropagation();
                const conversationId = parseInt(e.target.closest('.conversation-item').dataset.conversationId);
                this.deleteConversation(conversationId);
            }

            if (e.target.closest('.edit-btn')) {
                e.stopPropagation();
                const conversationId = parseInt(e.target.closest('.conversation-item').dataset.conversationId);
                this.renameConversation(conversationId);
            }
        });
    }

    loadInitialConversation() {
        this.renderConversations();
        this.switchConversation(1);
    }

    createNewConversation() {
        const newId = Date.now();
        const newConversation = {
            id: newId,
            title: `Discussion ${this.conversations.size + 1}`,
            model: document.getElementById('modelSelect').value,
            messages: [],
            createdAt: new Date()
        };

        this.conversations.set(newId, newConversation);
        this.renderConversations();
        this.switchConversation(newId);
    }

    switchConversation(conversationId) {
        this.currentConversationId = conversationId;
        const conversation = this.conversations.get(conversationId);
        
        if (!conversation) return;

        // Update active conversation in sidebar
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-conversation-id="${conversationId}"]`).classList.add('active');

        // Update model selector
        document.getElementById('modelSelect').value = conversation.model;

        // Update chat header
        document.querySelector('.chat-title').textContent = this.models[conversation.model];

        // Render messages
        this.renderMessages(conversation.messages);

        // Clear reply state
        this.closeReply();
    }

    updateConversationModel(model) {
        const conversation = this.conversations.get(this.currentConversationId);
        if (conversation) {
            conversation.model = model;
            document.querySelector('.chat-title').textContent = this.models[model];
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const messageText = messageInput.value.trim();
        
        if (!messageText && this.selectedFiles.length === 0) return;

        const conversation = this.conversations.get(this.currentConversationId);
        if (!conversation) return;

        // Create user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: messageText,
            files: [...this.selectedFiles],
            timestamp: new Date(),
            replyTo: this.replyingTo ? { ...this.replyingTo } : null
        };

        conversation.messages.push(userMessage);

        // Clear input and files
        messageInput.value = '';
        this.clearSelectedFiles();
        this.closeReply();
        this.autoResizeTextarea();

        // Render messages
        this.renderMessages(conversation.messages);

        // Simulate bot response
        this.simulateBotResponse(conversation, userMessage);

        // Update conversation preview
        this.updateConversationPreview(conversation.id, messageText || '[Fichier joint]');
    }

    simulateBotResponse(conversation, userMessage) {
        // Show typing indicator
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();

            // Generate bot response based on user message
            let botResponse = this.generateBotResponse(userMessage);

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: botResponse,
                timestamp: new Date(),
                replyTo: null
            };

            conversation.messages.push(botMessage);
            this.renderMessages(conversation.messages);
            
            // Update conversation preview
            this.updateConversationPreview(conversation.id, botResponse);
        }, 1000 + Math.random() * 2000);
    }

    generateBotResponse(userMessage) {
        const responses = [
            "Je comprends votre question. Laissez-moi vous aider avec cela.",
            "C'est une excellente question ! Voici ce que je peux vous dire à ce sujet.",
            "Merci pour votre message. Je vais analyser cela et vous donner une réponse détaillée.",
            "Intéressant ! Permettez-moi de vous expliquer ma perspective sur ce sujet.",
            "Je vois que vous vous intéressez à ce domaine. Voici mon analyse.",
            "Excellente observation ! Laissez-moi développer cette idée avec vous."
        ];

        if (userMessage.files && userMessage.files.length > 0) {
            return "J'ai bien reçu vos fichiers. Je peux analyser les images, documents et vidéos que vous avez partagés. Que souhaiteriez-vous que je fasse avec ces éléments ?";
        }

        if (userMessage.voice) {
            return "J'ai écouté votre message vocal. C'est une fonctionnalité intéressante ! Comment puis-je vous aider davantage ?";
        }

        if (userMessage.text.toLowerCase().includes('bonjour') || userMessage.text.toLowerCase().includes('salut')) {
            return "Bonjour ! Je suis Jarvis, votre assistant IA. Comment puis-je vous aider aujourd'hui ?";
        }

        if (userMessage.text.toLowerCase().includes('merci')) {
            return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        const messagesContainer = document.getElementById('messagesContainer');
        
        indicator.style.display = 'flex';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'none';
    }

    renderMessages(messages) {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h3>Bienvenue dans Jarvis Chat</h3>
                    <p>Votre assistant IA intelligent est prêt à vous aider. Posez-moi n'importe quelle question !</p>
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.dataset.messageId = message.id;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Reply section
        if (message.replyTo) {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'reply-to';
            replyDiv.innerHTML = `
                <div class="reply-author">${message.replyTo.type === 'user' ? 'Vous' : 'Jarvis'}</div>
                <div>${message.replyTo.text || '[Fichier joint]'}</div>
            `;
            content.appendChild(replyDiv);
        }

        // Message text
        if (message.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = message.text;
            content.appendChild(textDiv);
        }

        // Voice message
        if (message.voice) {
            const voiceDiv = document.createElement('div');
            voiceDiv.className = 'message-voice';
            voiceDiv.innerHTML = `
                <div class="voice-player">
                    <button class="play-voice-btn" data-audio-url="${message.voice.url}">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="voice-waveform">
                        <div class="voice-duration">${this.formatDuration(message.voice.duration)}</div>
                    </div>
                </div>
            `;
            
            // Add play functionality
            const playBtn = voiceDiv.querySelector('.play-voice-btn');
            playBtn.addEventListener('click', () => {
                this.playVoiceMessage(playBtn, message.voice.url);
            });
            
            content.appendChild(voiceDiv);
        }

        // Message files
        if (message.files && message.files.length > 0) {
            message.files.forEach(file => {
                const fileElement = this.createFileElement(file);
                content.appendChild(fileElement);
            });
        }

        // Message time
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(message.timestamp);
        content.appendChild(timeDiv);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    createFileElement(file) {
        const fileDiv = document.createElement('div');
        
        if (file.type.startsWith('image/')) {
            fileDiv.className = 'message-file image';
            const img = document.createElement('img');
            img.src = file.url;
            img.className = 'message-image';
            img.alt = file.name;
            img.addEventListener('click', () => {
                this.openImageModal(file.url);
            });
            fileDiv.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            fileDiv.className = 'message-file video';
            const video = document.createElement('video');
            video.src = file.url;
            video.controls = true;
            video.className = 'message-video';
            video.style.maxWidth = '300px';
            video.style.borderRadius = '8px';
            fileDiv.appendChild(video);
        } else {
            fileDiv.className = 'message-file';
            fileDiv.innerHTML = `
                <div class="file-icon">
                    <i class="fas fa-file"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            `;
        }

        return fileDiv;
    }

    handleFileSelection(files) {
        this.selectedFiles = [];
        
        Array.from(files).forEach(file => {
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file)
            };
            this.selectedFiles.push(fileData);
        });

        this.renderFilePreview();
    }

    renderFilePreview() {
        const filePreview = document.getElementById('filePreview');
        const filePreviewContent = document.getElementById('filePreviewContent');

        if (this.selectedFiles.length === 0) {
            filePreview.style.display = 'none';
            return;
        }

        filePreview.style.display = 'flex';
        filePreviewContent.innerHTML = '';

        this.selectedFiles.forEach(file => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            if (file.type.startsWith('image/')) {
                previewItem.className += ' image';
                previewItem.innerHTML = `
                    <img src="${file.url}" class="preview-image" alt="${file.name}">
                    <span>${file.name}</span>
                `;
            } else {
                previewItem.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                `;
            }

            filePreviewContent.appendChild(previewItem);
        });
    }

    clearSelectedFiles() {
        this.selectedFiles.forEach(file => {
            URL.revokeObjectURL(file.url);
        });
        this.selectedFiles = [];
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
    }

    showContextMenu(event, messageElement) {
        const contextMenu = document.getElementById('contextMenu');
        const messageId = parseInt(messageElement.dataset.messageId);
        
        this.selectedMessageId = messageId;
        this.selectedMessageElement = messageElement;

        contextMenu.style.display = 'block';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';

        // Position adjustment if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (event.pageX - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (event.pageY - rect.height) + 'px';
        }
    }

    hideContextMenu() {
        document.getElementById('contextMenu').style.display = 'none';
    }

    replyToMessage() {
        const conversation = this.conversations.get(this.currentConversationId);
        const message = conversation.messages.find(m => m.id === this.selectedMessageId);
        
        if (message) {
            this.replyingTo = {
                id: message.id,
                type: message.type,
                text: message.text,
                author: message.type === 'user' ? 'Vous' : 'Jarvis'
            };

            const replyPreview = document.getElementById('replyPreview');
            replyPreview.style.display = 'flex';
            replyPreview.querySelector('.reply-author').textContent = this.replyingTo.author;
            replyPreview.querySelector('.reply-text').textContent = this.replyingTo.text || '[Fichier joint]';

            document.getElementById('messageInput').focus();
        }
    }

    closeReply() {
        this.replyingTo = null;
        document.getElementById('replyPreview').style.display = 'none';
    }

    copyMessage() {
        const conversation = this.conversations.get(this.currentConversationId);
        const message = conversation.messages.find(m => m.id === this.selectedMessageId);
        
        if (message && message.text) {
            navigator.clipboard.writeText(message.text).then(() => {
                this.showNotification('Message copié !');
            });
        }
    }

    deleteMessage() {
        const conversation = this.conversations.get(this.currentConversationId);
        const messageIndex = conversation.messages.findIndex(m => m.id === this.selectedMessageId);
        
        if (messageIndex !== -1) {
            conversation.messages.splice(messageIndex, 1);
            this.renderMessages(conversation.messages);
            this.showNotification('Message supprimé');
        }
    }

    // Search functionality
    toggleSearchBar() {
        const searchBar = document.getElementById('searchBar');
        if (searchBar.style.display === 'none' || !searchBar.style.display) {
            searchBar.style.display = 'block';
            document.getElementById('searchInput').focus();
        } else {
            this.hideSearchBar();
        }
    }

    hideSearchBar() {
        document.getElementById('searchBar').style.display = 'none';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    }

    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        if (!query.trim()) return;

        const conversation = this.conversations.get(this.currentConversationId);
        const results = conversation.messages.filter(message => 
            message.text && message.text.toLowerCase().includes(query.toLowerCase())
        );

        results.forEach(message => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">
                    ${message.type === 'user' ? 'Vous' : 'Jarvis'} - ${this.formatTime(message.timestamp)}
                </div>
                <div>${message.text}</div>
            `;
            resultItem.addEventListener('click', () => {
                this.scrollToMessage(message.id);
                this.hideSearchBar();
            });
            searchResults.appendChild(resultItem);
        });

        if (results.length === 0) {
            searchResults.innerHTML = '<div style="padding: 12px; color: var(--text-secondary); text-align: center;">Aucun résultat trouvé</div>';
        }
    }

    scrollToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.style.background = 'rgba(0, 212, 255, 0.2)';
            setTimeout(() => {
                messageElement.style.background = '';
            }, 2000);
        }
    }

    // Emoji picker functionality
    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker.style.display === 'none' || !emojiPicker.style.display) {
            emojiPicker.style.display = 'block';
            this.showEmojiCategory('smileys');
        } else {
            this.hideEmojiPicker();
        }
    }

    hideEmojiPicker() {
        document.getElementById('emojiPicker').style.display = 'none';
    }

    showEmojiCategory(category) {
        const emojiGrid = document.getElementById('emojiGrid');
        emojiGrid.innerHTML = '';

        this.emojis[category].forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => {
                this.insertEmoji(emoji);
            });
            emojiGrid.appendChild(emojiItem);
        });
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(messageInput.selectionEnd);
        
        messageInput.value = textBefore + emoji + textAfter;
        messageInput.focus();
        messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        
        this.hideEmojiPicker();
        this.autoResizeTextarea();
    }

    // More options menu
    toggleMoreOptionsMenu() {
        const menu = document.getElementById('moreOptionsMenu');
        if (menu.style.display === 'none' || !menu.style.display) {
            menu.style.display = 'block';
        } else {
            this.hideMoreOptionsMenu();
        }
    }

    hideMoreOptionsMenu() {
        document.getElementById('moreOptionsMenu').style.display = 'none';
    }

    clearCurrentChat() {
        if (confirm('Êtes-vous sûr de vouloir effacer cette conversation ?')) {
            const conversation = this.conversations.get(this.currentConversationId);
            conversation.messages = [];
            this.renderMessages([]);
            this.updateConversationPreview(this.currentConversationId, 'Aucun message');
            this.showNotification('Conversation effacée');
        }
    }

    exportCurrentChat() {
        const conversation = this.conversations.get(this.currentConversationId);
        const chatData = {
            title: conversation.title,
            model: conversation.model,
            messages: conversation.messages.map(msg => ({
                type: msg.type,
                text: msg.text,
                timestamp: msg.timestamp.toISOString()
            })),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Conversation exportée');
    }

    // Settings panel
    showSettingsPanel() {
        document.getElementById('settingsPanel').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    hideSettingsPanel() {
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }

    handleProfilePhotoChange(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const currentAvatar = document.querySelector('.current-avatar');
                currentAvatar.innerHTML = `<img src="${e.target.result}" alt="Profile">`;
                
                // Update sidebar avatar
                const sidebarAvatar = document.querySelector('.user-profile .avatar');
                sidebarAvatar.innerHTML = `<img src="${e.target.result}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                
                this.showNotification('Photo de profil mise à jour');
            };
            reader.readAsDataURL(file);
        }
    }

    updateUsername(newUsername) {
        if (newUsername.trim()) {
            document.querySelector('.username').textContent = newUsername.trim();
            this.showNotification('Nom d\'utilisateur mis à jour');
        }
    }

    changeTheme(theme) {
        const root = document.documentElement;
        
        switch(theme) {
            case 'light':
                root.style.setProperty('--primary-bg', '#ffffff');
                root.style.setProperty('--secondary-bg', '#f8fafc');
                root.style.setProperty('--tertiary-bg', '#e2e8f0');
                root.style.setProperty('--text-primary', '#1a202c');
                root.style.setProperty('--text-secondary', '#4a5568');
                break;
            case 'blue':
                root.style.setProperty('--primary-bg', '#1e3a8a');
                root.style.setProperty('--secondary-bg', '#1e40af');
                root.style.setProperty('--tertiary-bg', '#2563eb');
                break;
            case 'purple':
                root.style.setProperty('--primary-bg', '#581c87');
                root.style.setProperty('--secondary-bg', '#7c3aed');
                root.style.setProperty('--tertiary-bg', '#8b5cf6');
                break;
            default: // dark
                root.style.setProperty('--primary-bg', '#0f0f23');
                root.style.setProperty('--secondary-bg', '#1a1a2e');
                root.style.setProperty('--tertiary-bg', '#16213e');
                root.style.setProperty('--text-primary', '#ffffff');
                root.style.setProperty('--text-secondary', '#a0a0b0');
        }
        
        this.showNotification(`Thème ${theme} appliqué`);
    }

    changeBackgroundColor(color) {
        document.documentElement.style.setProperty('--primary-bg', color);
        this.showNotification('Couleur de fond mise à jour');
    }

    handleBackgroundImageChange(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.body.style.backgroundImage = `url(${e.target.result})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                
                document.getElementById('removeBgBtn').style.display = 'block';
                this.showNotification('Image de fond mise à jour');
            };
            reader.readAsDataURL(file);
        }
    }

    removeBackgroundImage() {
        document.body.style.backgroundImage = '';
        document.getElementById('removeBgBtn').style.display = 'none';
        this.showNotification('Image de fond supprimée');
    }

    // Voice recording functionality
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.handleVoiceMessage(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            document.getElementById('voiceBtn').classList.add('recording');
            document.getElementById('voiceModal').style.display = 'flex';
            
            this.startRecordingTimer();
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showNotification('Erreur d\'accès au microphone');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopRecordingTimer();
            
            document.getElementById('voiceBtn').classList.remove('recording');
            document.getElementById('voiceModal').style.display = 'none';
        }
    }

    cancelRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopRecordingTimer();
            this.audioChunks = [];
            
            document.getElementById('voiceBtn').classList.remove('recording');
            document.getElementById('voiceModal').style.display = 'none';
            
            this.showNotification('Enregistrement annulé');
        }
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('recordingTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    handleVoiceMessage(audioBlob) {
        const conversation = this.conversations.get(this.currentConversationId);
        if (!conversation) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);

        const voiceMessage = {
            id: Date.now(),
            type: 'user',
            text: '',
            voice: {
                url: audioUrl,
                duration: duration
            },
            timestamp: new Date(),
            replyTo: this.replyingTo ? { ...this.replyingTo } : null
        };

        conversation.messages.push(voiceMessage);
        this.closeReply();
        this.renderMessages(conversation.messages);
        this.updateConversationPreview(conversation.id, '[Message vocal]');
        
        // Simulate bot response
        this.simulateBotResponse(conversation, voiceMessage);
    }

    hideAllModals() {
        this.hideSettingsPanel();
        this.hideEmojiPicker();
        this.hideMoreOptionsMenu();
        document.getElementById('voiceModal').style.display = 'none';
    }

    deleteConversation(conversationId) {
        if (this.conversations.size <= 1) {
            this.showNotification('Impossible de supprimer la dernière conversation');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
            this.conversations.delete(conversationId);
            
            if (this.currentConversationId === conversationId) {
                // Switch to first available conversation
                const firstConversationId = this.conversations.keys().next().value;
                this.switchConversation(firstConversationId);
            }
            
            this.renderConversations();
            this.showNotification('Conversation supprimée');
        }
    }

    renameConversation(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        const newTitle = prompt('Nouveau nom de la conversation:', conversation.title);
        if (newTitle && newTitle.trim()) {
            conversation.title = newTitle.trim();
            this.renderConversations();
        }
    }

    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        conversationsList.innerHTML = '';

        Array.from(this.conversations.values())
            .sort((a, b) => b.createdAt - a.createdAt)
            .forEach(conversation => {
                const conversationElement = this.createConversationElement(conversation);
                conversationsList.appendChild(conversationElement);
            });
    }

    createConversationElement(conversation) {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.dataset.conversationId = conversation.id;

        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const preview = lastMessage ? 
            (lastMessage.text || '[Fichier joint]') : 
            'Aucun message';

        div.innerHTML = `
            <div class="conversation-info">
                <div class="conversation-title">${conversation.title}</div>
                <div class="conversation-preview">${preview}</div>
            </div>
            <div class="conversation-actions">
                <button class="edit-btn" title="Renommer">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return div;
    }

    updateConversationPreview(conversationId, preview) {
        const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (conversationElement) {
            const previewElement = conversationElement.querySelector('.conversation-preview');
            previewElement.textContent = preview.substring(0, 50) + (preview.length > 50 ? '...' : '');
        }
    }

    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    formatTime(date) {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    playVoiceMessage(button, audioUrl) {
        const audio = new Audio(audioUrl);
        const icon = button.querySelector('i');
        
        if (button.classList.contains('playing')) {
            audio.pause();
            button.classList.remove('playing');
            icon.className = 'fas fa-play';
            return;
        }
        
        // Stop any other playing audio
        document.querySelectorAll('.play-voice-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
            btn.querySelector('i').className = 'fas fa-play';
        });
        
        button.classList.add('playing');
        icon.className = 'fas fa-pause';
        
        audio.play();
        
        audio.onended = () => {
            button.classList.remove('playing');
            icon.className = 'fas fa-play';
        };
        
        audio.onpause = () => {
            button.classList.remove('playing');
            icon.className = 'fas fa-play';
        };
    }

    openImageModal(imageUrl) {
        // Create a simple image modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;

        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        `;

        modal.appendChild(img);
        document.body.appendChild(modal);

        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-green);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the chat application
document.addEventListener('DOMContentLoaded', () => {
    new JarvisChat();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);