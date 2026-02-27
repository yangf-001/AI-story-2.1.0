class MessageRenderer {
    constructor(worldId, storage) {
        this.worldId = worldId;
        this.storage = storage;
        this.currentSceneId = null;
        this.sceneMessages = [];
    }
    
    render(message) {
        const storyMessages = document.getElementById('story-messages');
        if (!storyMessages) return;
        
        console.log('渲染消息:', message);
        
        // 检查是否是新场景的开始
        if (message.type === 'narration') {
            // 保存当前场景的消息
            if (this.sceneMessages.length > 0) {
                this.renderSceneAsCard(this.sceneMessages);
            }
            // 开始新场景
            this.currentSceneId = `scene_${Date.now()}`;
            this.sceneMessages = [message];
            // 立即渲染场景，确保内容能够及时显示
            this.renderSceneAsCard(this.sceneMessages);
            // 清空场景消息，准备下一个场景
            this.sceneMessages = [];
        } else if (message.type === 'character') {
            // 只添加角色对话到当前场景，不添加用户选择
            this.sceneMessages.push(message);
            // 立即渲染场景，确保内容能够及时显示
            this.renderSceneAsCard(this.sceneMessages);
            // 清空场景消息，准备下一个场景
            this.sceneMessages = [];
        } else if (message.type === 'system') {
            // 系统消息更新固定提示栏
            const systemMessageBar = document.getElementById('system-message-bar');
            if (systemMessageBar) {
                const systemMessageContent = systemMessageBar.querySelector('.system-message-content');
                if (systemMessageContent) {
                    systemMessageContent.textContent = message.content;
                }
            }
        }
    }
    
    renderSceneAsCard(messages) {
        const storyMessages = document.getElementById('story-messages');
        if (!storyMessages || messages.length === 0) return;
        
        console.log('渲染场景卡片:', messages);
        
        const cardElement = document.createElement('div');
        
        // 确定场景类型
        let sceneType = 'default';
        const narrationMessage = messages.find(msg => msg.type === 'narration');
        if (narrationMessage && narrationMessage.scene) {
            sceneType = this.getSceneType(narrationMessage.scene);
        }
        
        cardElement.className = `message scene-card scene-${sceneType}`;
        
        let cardContent = '';
        messages.forEach(message => {
            switch (message.type) {
                case 'character':
                    cardContent += this.renderCharacterMessageAsHtml(message);
                    break;
                case 'narration':
                    cardContent += this.renderNarrationMessageAsHtml(message);
                    break;
                // 移除 choice 类型消息的渲染
            }
        });
        
        console.log('卡片内容:', cardContent);
        cardElement.innerHTML = cardContent;
        storyMessages.appendChild(cardElement);
        this.scrollToBottom(storyMessages);
        
        // 保存卡片数据
        this.saveCardData(messages, sceneType, cardContent);
    }
    
    saveCardData(messages, sceneType, cardContent) {
        // 确保当前场景ID存在
        if (!this.currentSceneId) {
            this.currentSceneId = `scene_${Date.now()}`;
        }
        
        // 构建卡片数据
        const cardData = {
            id: this.currentSceneId,
            messages: messages,
            sceneType: sceneType,
            content: cardContent,
            timestamp: new Date().toISOString(),
            scene: messages.find(msg => msg.type === 'narration')?.scene || '未知场景'
        };
        
        console.log('保存卡片数据:', cardData);
        
        // 存储卡片数据到localStorage
        const currentWorldId = this.worldId;
        const storedCards = localStorage.getItem(`story_cards_${currentWorldId}`);
        let cards = [];
        
        if (storedCards) {
            try {
                cards = JSON.parse(storedCards);
            } catch (error) {
                console.error('解析卡片数据失败:', error);
            }
        }
        
        // 检查是否已存在相同ID的卡片
        const existingIndex = cards.findIndex(card => card.id === cardData.id);
        if (existingIndex >= 0) {
            // 更新现有卡片
            cards[existingIndex] = cardData;
        } else {
            // 添加新卡片
            cards.push(cardData);
        }
        
        localStorage.setItem(`story_cards_${currentWorldId}`, JSON.stringify(cards));
    }
    
    getSceneType(sceneName) {
        const sceneMap = {
            '学校': 'school',
            '家里': 'home',
            '公园': 'park',
            '街道': 'street',
            '办公室': 'office',
            '森林': 'forest',
            '海边': 'beach',
            '城市': 'city',
            '乡村': 'village'
        };
        
        for (const [key, value] of Object.entries(sceneMap)) {
            if (sceneName.includes(key)) {
                return value;
            }
        }
        return 'default';
    }
    
    createMessageElement(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.type}`;
        
        switch (message.type) {
            case 'character':
                this.renderCharacterMessage(messageElement, message);
                break;
            case 'system':
                this.renderSystemMessage(messageElement, message);
                break;
            case 'narration':
                this.renderNarrationMessage(messageElement, message);
                break;
            case 'choice':
                this.renderChoiceMessage(messageElement, message);
                break;
            case 'choices':
                this.renderChoicesMessage(messageElement, message);
                break;
            default:
                this.renderDefaultMessage(messageElement, message);
        }
        
        return messageElement;
    }
    
    renderCharacterMessage(element, message) {
        const isMainCharacter = this.isMainCharacter(message.sender);
        const alignmentClass = isMainCharacter ? 'message-content-right' : 'message-content-left';
        const bgColor = isMainCharacter ? 'var(--secondary-color)' : 'var(--bg-color)';
        const textColor = isMainCharacter ? 'white' : 'var(--text-color)';
        
        element.innerHTML = `
            <div class="message-content ${alignmentClass}">
                <div class="message-sender">${message.sender}：</div>
                <div class="message-bubble" style="background-color: ${bgColor}; color: ${textColor};">
                    ${this.escapeHtml(message.content)}
                </div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }
    
    renderSystemMessage(element, message) {
        element.innerHTML = `
            <div class="message-content message-content-center">
                <div class="system-message" style="font-style: italic; color: #666; font-size: 0.9em;">${this.escapeHtml(message.content)}</div>
            </div>
        `;
    }
    
    renderNarrationMessage(element, message) {
        element.innerHTML = `
            <div class="message-content message-content-center">
                <div class="narration-message">${this.escapeHtml(message.content)}</div>
            </div>
        `;
    }
    
    renderChoiceMessage(element, message) {
        element.innerHTML = `
            <div class="message-content message-content-right">
                <div class="message-sender">${message.sender}的选择：</div>
                <div class="message-bubble" style="background-color: var(--primary-light); color: var(--primary-color);">
                    ${this.escapeHtml(message.content)}
                </div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }
    
    renderChoicesMessage(element, message) {
        element.innerHTML = `
            <div class="message-content message-content-center">
                <div class="choices-message">${this.escapeHtml(message.content)}</div>
            </div>
        `;
    }
    
    renderDefaultMessage(element, message) {
        element.innerHTML = `
            <div class="message-content">
                <div class="message-sender">${message.sender}：</div>
                <div class="message-bubble">${this.escapeHtml(message.content)}</div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }
    
    renderCharacterMessageAsHtml(message) {
        const isMainCharacter = this.isMainCharacter(message.sender);
        const alignmentClass = isMainCharacter ? 'message-content-right' : 'message-content-left';
        const bgColor = isMainCharacter ? 'var(--secondary-color)' : 'var(--bg-color)';
        const textColor = isMainCharacter ? 'white' : 'var(--text-color)';
        
        return `
            <div class="message-content ${alignmentClass}">
                <div class="message-sender">${message.sender}：</div>
                <div class="message-bubble" style="background-color: ${bgColor}; color: ${textColor};">
                    ${this.escapeHtml(message.content)}
                </div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }
    
    renderNarrationMessageAsHtml(message) {
        return `
            <div class="message-content message-content-center">
                <div class="narration-message">${this.escapeHtml(message.content)}</div>
            </div>
        `;
    }
    
    renderChoiceMessageAsHtml(message) {
        return `
            <div class="message-content message-content-right">
                <div class="message-sender">${message.sender}的选择：</div>
                <div class="message-bubble" style="background-color: var(--primary-light); color: var(--primary-color);">
                    ${this.escapeHtml(message.content)}
                </div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;
    }
    
    isMainCharacter(senderName) {
        const allCharacters = this.storage.getCharactersByWorldId(this.worldId);
        const mainCharacter = allCharacters.find(c => c.isMain);
        return senderName === (mainCharacter ? mainCharacter.name : '用户');
    }
    
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        // 将换行符转换为HTML换行标签
        return div.innerHTML.replace(/\n/g, '<br>');
    }
    
    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }
    
    clearMessages() {
        const storyMessages = document.getElementById('story-messages');
        if (storyMessages) {
            storyMessages.innerHTML = '';
        }
        // 清空场景相关变量
        this.currentSceneId = null;
        this.sceneMessages = [];
    }
    
    renderMessages(messages) {
        this.clearMessages();
        
        messages.forEach(message => {
            // 只渲染故事相关的消息：角色对话和旁白
            if (message.type === 'character' || message.type === 'narration' || message.type === 'choice') {
                this.render(message);
            }
        });
        
        // 渲染最后一个场景
        if (this.sceneMessages.length > 0) {
            this.renderSceneAsCard(this.sceneMessages);
        }
    }
}