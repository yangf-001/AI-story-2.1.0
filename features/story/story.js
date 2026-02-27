import AssistantsModule from '../assistants/assistants.js';

class StoryModule {
    constructor() {
        this.currentStoryId = null;
        this.currentStory = null;
        this.currentWorldId = localStorage.getItem('currentWorldId');
        this.selectedCharacters = [];
        this.assistantsStatus = new Map();
        
        // 初始化各个管理器
        this.timeManager = new TimeManager(
            this.currentWorldId,
            storage,
            (date) => { /* 不显示时间更新消息 */ }
        );
        
        this.narrationManager = new NarrationManager();
        this.messageRenderer = new MessageRenderer(this.currentWorldId, storage);
        this.promptBuilder = new PromptBuilder();
        this.sceneAnalyzer = new SceneAnalyzer(this.currentWorldId, storage, window.api);
    }
    
    init() {
        if (!this.currentWorldId) {
            window.location.href = '../../main/index.html';
            return;
        }
        
        this.timeManager.initialize();
        this.bindEvents();
        this.loadCharacters();
        this.loadStoryFromUrl();
        this.loadAssistantsStatus();
    }
    
    loadAssistantsStatus() {
        const assistantsStatusContainer = document.getElementById('assistants-status');
        if (!assistantsStatusContainer) return;
        
        // 获取所有小助手
        const storedAssistants = localStorage.getItem(`assistants_${this.currentWorldId}`);
        let assistants = [];
        
        if (storedAssistants) {
            try {
                assistants = JSON.parse(storedAssistants);
            } catch (error) {
                console.error('解析小助手数据失败:', error);
            }
        }
        
        // 如果没有小助手数据，使用默认小助手
        if (assistants.length === 0) {
            if (AssistantsModule && AssistantsModule.getAssistants) {
                assistants = AssistantsModule.getAssistants(this.currentWorldId);
            } else {
                // 使用默认小助手
                assistants = [
                    { id: 'profile-assistant', name: '人设小助手', settings: { enabled: true } },
                    { id: 'time-assistant', name: '时间小助手', settings: { enabled: true } },
                    { id: 'erotic-assistant', name: '色色小助手', settings: { enabled: true } },
                    { id: 'character-generator-assistant', name: '人物小助手', settings: { enabled: true } },
                    { id: 'story-assistant', name: '故事小助手', settings: { enabled: true } },
                    { id: 'summary-assistant', name: '总结小助手', settings: { enabled: true } }
                ];
            }
        }
        
        // 过滤掉前情提要小助手和场景小助手
        assistants = assistants.filter(assistant => assistant.id !== 'context-assistant' && assistant.id !== 'scene-assistant');
        
        // 清空容器
        assistantsStatusContainer.innerHTML = '';
        
        // 显示每个小助手的状态
        assistants.forEach(assistant => {
            const currentStatus = this.assistantsStatus.get(assistant.id) || (assistant.settings?.enabled ? '' : '已禁用');
            
            const assistantStatus = document.createElement('div');
            assistantStatus.style.display = 'flex';
            assistantStatus.style.alignItems = 'center';
            assistantStatus.style.gap = '4px';
            assistantStatus.style.padding = '4px 10px';
            assistantStatus.style.borderRadius = '12px';
            assistantStatus.style.backgroundColor = 'white';
            assistantStatus.style.border = `1px solid ${assistant.settings?.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`;
            assistantStatus.style.fontSize = '0.65rem';
            assistantStatus.style.fontWeight = '500';
            assistantStatus.style.color = assistant.settings?.enabled ? '#10b981' : '#ef4444';
            assistantStatus.style.margin = '0';
            assistantStatus.style.lineHeight = '1';
            assistantStatus.style.whiteSpace = 'nowrap';
            assistantStatus.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
            
            const statusIndicator = document.createElement('span');
            statusIndicator.style.display = 'inline-block';
            statusIndicator.style.width = '6px';
            statusIndicator.style.height = '6px';
            statusIndicator.style.borderRadius = '50%';
            statusIndicator.style.backgroundColor = assistant.settings?.enabled ? '#10b981' : '#ef4444';
            
            const statusText = document.createElement('span');
            statusText.textContent = currentStatus ? `${assistant.name} ${currentStatus}` : assistant.name;
            
            assistantStatus.appendChild(statusIndicator);
            assistantStatus.appendChild(statusText);
            assistantsStatusContainer.appendChild(assistantStatus);
        });
    }
    
    updateAssistantStatus(assistantId, status) {
        this.assistantsStatus.set(assistantId, status);
        this.loadAssistantsStatus();
    }
    

    
    bindEvents() {
        // 开始故事
        const startStoryBtn = document.getElementById('start-story');
        if (startStoryBtn) {
            startStoryBtn.addEventListener('click', () => this.startStory());
        }
        
        // 结束故事
        const endStoryBtn = document.getElementById('end-story');
        if (endStoryBtn) {
            endStoryBtn.addEventListener('click', () => this.endStory());
        }
        

        
        // 回车键发送选择
        const choiceInput = document.getElementById('choice-input');
        if (choiceInput) {
            choiceInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChoice();
                }
            });
        }
        
        // 旁白设置
        const narrationSettingsBtn = document.getElementById('narration-settings');
        if (narrationSettingsBtn) {
            narrationSettingsBtn.addEventListener('click', () => this.narrationManager.openModal());
        }
        
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.narrationManager.closeModal());
        }
        
        const saveNarrationBtn = document.getElementById('save-narration');
        if (saveNarrationBtn) {
            saveNarrationBtn.addEventListener('click', () => this.narrationManager.saveFromModal());
        }
        
        const narrationOutputSelect = document.getElementById('narration-output');
        if (narrationOutputSelect) {
            narrationOutputSelect.addEventListener('change', (e) => {
                const customOutputGroup = document.getElementById('custom-output-group');
                if (customOutputGroup) {
                    customOutputGroup.style.display = e.target.value === '自定义' ? 'block' : 'none';
                }
            });
        }
        
        // 时间编辑
        const currentTimeElement = document.querySelector('#currentTime');
        if (currentTimeElement) {
            const timeDisplay = currentTimeElement.parentElement;
            if (timeDisplay) {
                timeDisplay.addEventListener('click', () => this.timeManager.editTime());
            }
        }
        
        const closeTimeModalBtn = document.getElementById('close-time-modal');
        if (closeTimeModalBtn) {
            closeTimeModalBtn.addEventListener('click', () => this.timeManager.closeTimeModal());
        }
        
        const saveTimeBtn = document.getElementById('save-time');
        if (saveTimeBtn) {
            saveTimeBtn.addEventListener('click', () => this.timeManager.saveTime());
        }
        
        // 切换滑动模式
        const toggleScrollBtn = document.getElementById('toggle-scroll');
        if (toggleScrollBtn) {
            toggleScrollBtn.addEventListener('click', () => this.toggleScrollMode());
        }
        
        // 滑动控制按钮
        const scrollLeftBtn = document.getElementById('scroll-left');
        if (scrollLeftBtn) {
            scrollLeftBtn.addEventListener('click', () => this.scrollLeft());
        }
        
        const scrollRightBtn = document.getElementById('scroll-right');
        if (scrollRightBtn) {
            scrollRightBtn.addEventListener('click', () => this.scrollRight());
        }
        

    }
    
    loadStoryFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = urlParams.get('storyId');
        
        if (storyId) {
            this.loadStory(storyId);
        } else {
            this.showCharacterSelection();
        }
    }
    
    showCharacterSelection() {
        const characterSelection = document.getElementById('character-selection');
        if (characterSelection) {
            characterSelection.style.display = 'block';
        }
        
        const choiceInput = document.getElementById('choice-input');
        if (choiceInput) {
            choiceInput.disabled = true;
        }
        
        const sendChoice = document.getElementById('send-choice');
        if (sendChoice) {
            sendChoice.disabled = true;
        }
        
        const endStory = document.getElementById('end-story');
        if (endStory) {
            endStory.disabled = true;
        }
    }
    
    loadCharacters() {
        const characterList = document.getElementById('character-list');
        if (!characterList) return;
        
        characterList.innerHTML = '';
        
        const allCharacters = storage.getCharactersByWorldId(this.currentWorldId);
        console.log('所有角色:', allCharacters);
        
        // 加载所有角色，包括主角
        allCharacters.forEach(character => {
            const characterItem = document.createElement('div');
            characterItem.className = 'character-item';
            if (character.isMain) {
                characterItem.innerHTML = `
                    <div class="character-tag main-character">
                        <span>${character.name} (主角)</span>
                    </div>
                `;
            } else {
                characterItem.innerHTML = `
                    <div class="character-tag" data-character-id="${character.id}">
                        <span>${character.name}</span>
                    </div>
                `;
                
                const characterTag = characterItem.querySelector('.character-tag');
                if (characterTag) {
                    characterTag.addEventListener('click', () => {
                        if (this.selectedCharacters.includes(character.id)) {
                            this.selectedCharacters = this.selectedCharacters.filter(id => id !== character.id);
                            characterTag.classList.remove('selected');
                        } else {
                            this.selectedCharacters.push(character.id);
                            characterTag.classList.add('selected');
                        }
                    });
                }
            }
            
            characterList.appendChild(characterItem);
        });
        
        // 如果没有角色，显示提示信息
        if (allCharacters.length === 0) {
            characterList.innerHTML = '<p>暂无角色，请先在角色管理中创建角色</p>';
        }
    }
    
    async startStory() {
        if (this.selectedCharacters.length === 0) {
            this.addSystemMessage('请先选择至少一个角色');
            return;
        }
        
        // 更新小助手状态
        this.updateAssistantStatus('story-assistant', '开始故事');
        this.updateAssistantStatus('profile-assistant', '加载角色数据');
        
        this.currentStoryId = `story_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        
        this.currentStory = {
            id: this.currentStoryId,
            worldId: this.currentWorldId,
            characters: this.selectedCharacters,
            scenes: [],
            archive: [],
            storySummary: '',
            narrationSettings: this.narrationManager.getSettings(),
            startTime: new Date().toISOString(),
            endTime: null
        };
        
        storage.saveStory(this.currentStory);
        this.updateWorldStories();
        
        this.timeManager.adjustTimeToLatestDiary();
        
        this.enableStoryUI();
        this.messageRenderer.clearMessages();
        
        await this.generateInitialScene();
        
        // 更新小助手状态
        this.updateAssistantStatus('story-assistant', '故事已开始');
        this.updateAssistantStatus('profile-assistant', '角色数据加载完成');
        
        const characterNames = this.getSelectedCharacterNames().join('、');
        this.addSystemMessage(`故事已开始，参与角色：${characterNames}。`);
    }
    
    updateWorldStories() {
        const world = storage.getWorldById(this.currentWorldId);
        if (world && !world.stories) {
            world.stories = [];
        }
        if (world && !world.stories.includes(this.currentStoryId)) {
            world.stories.push(this.currentStoryId);
            storage.saveWorld(world);
        }
    }
    
    enableStoryUI() {
        const startStory = document.getElementById('start-story');
        if (startStory) {
            startStory.disabled = true;
        }
        
        const endStory = document.getElementById('end-story');
        if (endStory) {
            endStory.disabled = false;
        }
        
        const choiceInput = document.getElementById('choice-input');
        if (choiceInput) {
            choiceInput.disabled = false;
        }
        
        const sendChoice = document.getElementById('send-choice');
        if (sendChoice) {
            sendChoice.disabled = false;
        }
        
        const characterSelection = document.getElementById('character-selection');
        if (characterSelection) {
            characterSelection.style.display = 'none';
        }
    }
    
    getSelectedCharacterNames() {
        const allCharacters = storage.getCharactersByWorldId(this.currentWorldId);
        return this.selectedCharacters.map(id => {
            const character = allCharacters.find(c => c.id === id);
            return character ? character.name : '';
        }).filter(Boolean);
    }
    
    async sendChoice() {
        const choiceInput = document.getElementById('choice-input');
        const choiceContent = choiceInput.value.trim();
        
        if (!choiceContent) return;
        
        if (!this.currentStory) {
            await this.startStory();
        }
        
        this.timeManager.analyzeTimeContent(choiceContent);
        this.timeManager.detectTimePassage(choiceContent);
        
        this.addUserChoice(choiceContent);
        choiceInput.value = '';
        
        storage.saveStory(this.currentStory);
        
        await this.generateNextScene(choiceContent);
        
        storage.saveStory(this.currentStory);
    }
    
    addUserChoice(content) {
        // 不渲染用户选择，只处理选择逻辑
        console.log('用户选择:', content);
        // 这里不再创建和渲染 choice 类型的消息
    }
    
    addCharacterDialog(characterName, content) {
        const message = {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            sender: characterName,
            content: content,
            type: 'character',
            timestamp: new Date().toISOString()
        };
        
        if (this.currentStory.scenes.length === 0) {
            this.currentStory.scenes.push({
                id: `scene_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                messages: [message],
                timestamp: new Date().toISOString()
            });
        } else {
            const currentScene = this.currentStory.scenes[this.currentStory.scenes.length - 1];
            currentScene.messages.push(message);
        }
        
        this.messageRenderer.render(message);
    }
    
    addSystemMessage(content) {
        const message = {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            sender: '系统',
            content: content,
            type: 'system',
            timestamp: new Date().toISOString()
        };
        
        if (this.currentStory && this.currentStory.scenes.length > 0) {
            const currentScene = this.currentStory.scenes[this.currentStory.scenes.length - 1];
            currentScene.messages.push(message);
        }
        this.messageRenderer.render(message);
    }
    
    // 重新添加选项按钮渲染方法
    renderChoiceButtons(choices) {
        const choicesGrid = document.getElementById('choices-grid');
        if (!choicesGrid) return;
        
        // 清空现有选项
        choicesGrid.innerHTML = '';
        
        // 生成四个选项按钮
        choices.forEach((choice, index) => {
            const choiceOption = document.createElement('div');
            choiceOption.className = 'choice-option';
            choiceOption.textContent = choice;
            choiceOption.addEventListener('click', () => {
                this.selectChoice(choice);
            });
            choicesGrid.appendChild(choiceOption);
        });
    }
    
    selectChoice(choice) {
        const choiceInput = document.getElementById('choice-input');
        if (choiceInput) {
            choiceInput.value = choice;
            this.sendChoice();
        }
    }
    
    async generateInitialScene() {
        if (typeof window.api === 'undefined') return;
        
        try {
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '生成初始场景');
            this.updateAssistantStatus('scene-assistant', '构建场景描述');
            
            // 获取故事小助手设置
            const storyAssistant = this.getStoryAssistant();
            const context = this.buildStoryContext();
            
            // 使用故事小助手生成初始场景
            const response = await this.generateStorySceneWithAssistant({
                context: context,
                type: 'initial',
                assistant: storyAssistant
            });
            
            if (response && response.scene) {
                // 分析场景内容，确定场景类型
                const sceneAnalysis = await this.sceneAnalyzer.analyze(response.scene);
                
                // 将故事内容作为旁白消息添加，以便应用背景匹配
                const message = {
                    id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    sender: '旁白',
                    content: response.scene,
                    type: 'narration',
                    scene: sceneAnalysis.scene,
                    timestamp: new Date().toISOString()
                };
                
                if (this.currentStory.scenes.length === 0) {
                    this.currentStory.scenes.push({
                        id: `scene_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                        messages: [message],
                        scene: sceneAnalysis.scene,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    const currentScene = this.currentStory.scenes[this.currentStory.scenes.length - 1];
                    currentScene.messages.push(message);
                    currentScene.scene = sceneAnalysis.scene;
                }
                
                this.messageRenderer.render(message);
            }
            
            if (response && response.choices) {
                // 渲染选项按钮，但不在卡片中显示选项
                this.renderChoiceButtons(response.choices);
            }
            

            
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '初始场景生成完成');
            this.updateAssistantStatus('scene-assistant', '场景描述构建完成');
        } catch (error) {
            console.error('生成初始场景失败:', error);
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '生成初始场景失败');
            this.updateAssistantStatus('scene-assistant', '构建场景描述失败');
        }
    }
    
    async generateNextScene(choice) {
        if (typeof window.api === 'undefined') return;
        
        try {
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '生成后续场景');
            this.updateAssistantStatus('scene-assistant', '构建场景描述');
            
            // 获取故事小助手设置
            const storyAssistant = this.getStoryAssistant();
            const context = this.buildStoryContext();
            
            // 使用故事小助手生成后续场景
            const response = await this.generateStorySceneWithAssistant({
                context: context,
                choice: choice,
                type: 'continue',
                assistant: storyAssistant
            });
            
            if (response && response.scene) {
                // 分析场景内容，确定场景类型
                const sceneAnalysis = await this.sceneAnalyzer.analyze(response.scene);
                
                // 将故事内容作为旁白消息添加，以便应用背景匹配
                const message = {
                    id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    sender: '旁白',
                    content: response.scene,
                    type: 'narration',
                    scene: sceneAnalysis.scene,
                    timestamp: new Date().toISOString()
                };
                
                if (this.currentStory.scenes.length === 0) {
                    this.currentStory.scenes.push({
                        id: `scene_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                        messages: [message],
                        scene: sceneAnalysis.scene,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    const currentScene = this.currentStory.scenes[this.currentStory.scenes.length - 1];
                    currentScene.messages.push(message);
                    currentScene.scene = sceneAnalysis.scene;
                }
                
                this.messageRenderer.render(message);
            }
            
            if (response && response.choices) {
                // 渲染选项按钮，但不在卡片中显示选项
                this.renderChoiceButtons(response.choices);
            }
            

            
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '后续场景生成完成');
            this.updateAssistantStatus('scene-assistant', '场景描述构建完成');
        } catch (error) {
            console.error('生成后续场景失败:', error);
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '生成后续场景失败');
            this.updateAssistantStatus('scene-assistant', '构建场景描述失败');
        }
    }
    
    getStoryAssistant() {
        // 从localStorage获取小助手设置
        const storedAssistants = localStorage.getItem(`assistants_${this.currentWorldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const storyAssistant = assistants.find(a => a.id === 'story-assistant');
                return storyAssistant || null;
            } catch (error) {
                console.error('解析小助手数据失败:', error);
                return null;
            }
        }
        return null;
    }
    


    async generateStorySceneWithAssistant(data) {
        const { context, choice, type, assistant } = data;
        
        try {
            // 检查是否存在AssistantsModule实例
            if (window.assistantsModule) {
                // 使用assistants.js中的故事小助手方法
                const result = await window.assistantsModule.generateStoryScene(assistant, context, choice);
                
                // 只返回scene和choices，不返回summary，确保不显示格式总结
                return {
                    scene: result.scene,
                    choices: result.choices || []
                };
            } else {
                // 后备方案：如果AssistantsModule不存在，使用本地实现
                console.warn('AssistantsModule不存在，使用本地实现');
                
                let prompt = `你是故事小助手，负责生成精彩的故事内容。

`;
                
                // 添加小助手的性格和背景
                if (assistant && assistant.profile) {
                    prompt += `性格: ${assistant.profile.personality || '创意、想象力丰富、善于构建剧情'}
`;
                    prompt += `背景: ${assistant.profile.background || '我是专门负责管理故事的小助手，帮助你构建和发展故事情节。'}

`;
                }
                
                prompt += `上下文:
${context}

`;
                
                if (choice) {
                    prompt += `用户选择:
${choice}

`;
                }
                
                prompt += `要求:
`;
                prompt += `1. 生成一个生动的故事段落，像小说一样成段输出
`;
                prompt += `2. 包含场景描述、角色对话和情节发展
`;
                prompt += `3. 对话要符合角色性格，自然融入故事中
`;
                prompt += `4. 故事内容要符合角色的性格特点和背景故事
`;
                prompt += `5. 结尾提供4个故事走向选项，供用户选择
`;
                prompt += `6. 选项要与当前剧情相关，有明确的故事发展方向
`;
                prompt += `7. 直接生成完整的剧情，不要包含任何旁白内容
`;
                prompt += `8. 不要生成任何剧情总结或格式总结
`;
                prompt += `
`;
                prompt += `请按照以下格式输出:
`;
                prompt += `【故事内容】【故事时间：】
故事正文，像小说一样成段输出，包含场景描述和角色对话

`;
                prompt += `【选项】
1. 选项1
2. 选项2
3. 选项3
4. 选项4`;
                
                // 检查API密钥是否配置
                if (!window.api.config.apiKey) {
                    console.error('API密钥未配置');
                    return {
                        scene: "请先配置API密钥才能生成故事内容",
                        choices: ["去配置API密钥"]
                    };
                }
                
                const response = await window.api.callAPI('user', prompt);
                
                // 处理响应内容，提取故事正文和选项
                let storyContent = response;
                let choices = [];
                
                // 尝试提取【故事内容】【故事时间：】部分
                const storyMatch = storyContent.match(/【故事内容】【故事时间：】\s*([\s\S]*?)\s*【选项】/);
                if (storyMatch && storyMatch[1]) {
                    storyContent = storyMatch[1].trim();
                } else {
                    // 如果没有找到【故事内容】【故事时间：】标记，尝试找到【选项】标记并提取之前的内容
                    const optionsMatch = storyContent.match(/\s*【选项】/);
                    if (optionsMatch) {
                        storyContent = storyContent.substring(0, optionsMatch.index).trim();
                    }
                }
                
                // 尝试提取【选项】部分
                const choicesMatch = response.match(/【选项】\s*([\s\S]*)/);
                if (choicesMatch && choicesMatch[1]) {
                    const choicesText = choicesMatch[1];
                    // 提取选项列表
                    const choiceLines = choicesText.split('\n').filter(line => line.trim());
                    choices = choiceLines.map(line => {
                        // 移除选项编号
                        return line.replace(/^\d+\.\s*/, '').trim();
                    }).filter(Boolean).slice(0, 4);
                }
                
                // 如果没有提取到选项，使用默认选项
                if (choices.length === 0) {
                    choices = ["继续前进", "探索周围", "与角色交流", "休息调整"];
                }
                
                // 分析故事内容，提取新角色并生成临时人物卡
                await this.analyzeStoryContentForNewCharacters(storyContent);
                
                // 调用其他小助手进行处理
                await this.integrateOtherAssistants(storyContent);
                
                // 返回处理后的结果
                return {
                    scene: storyContent,
                    choices: choices
                };
            }
        } catch (error) {
            console.error('生成故事场景失败:', error);
            // 根据错误类型返回不同的默认结构
            if (error.message === 'API密钥未配置') {
                    return {
                        scene: "请先配置API密钥才能生成故事内容",
                        choices: ["去配置API密钥"]
                    };
                }
                // 如果生成失败，返回一个默认结构
                return {
                    scene: "故事继续发展...",
                    choices: ["继续前进", "探索周围", "与角色交流", "休息调整"]
                };
        }
    }
    
    async analyzeStoryContentForNewCharacters(storyContent) {
        try {
            // 检查是否存在AssistantsModule实例
            if (window.assistantsModule) {
                // 提取故事中可能的新角色
                const newCharacters = this.extractPotentialCharacters(storyContent);
                
                for (const characterName of newCharacters) {
                    // 检查角色是否已存在
                    const existingCharacters = storage.getCharactersByWorldId(this.currentWorldId);
                    const characterExists = existingCharacters.some(c => c.name === characterName);
                    
                    if (!characterExists) {
                        // 使用人物小助手生成临时角色
                        await this.generateTemporaryCharacterFromStory(characterName, storyContent);
                    }
                }
            }
        } catch (error) {
            console.error('分析故事内容提取新角色失败:', error);
        }
    }
    
    extractPotentialCharacters(storyContent) {
        // 简单的角色提取逻辑，实际应用中可能需要更复杂的NLP处理
        const lines = storyContent.split('\n');
        const characterNames = [];
        const namePattern = /^([^：:]+)[：:]/;
        
        lines.forEach(line => {
            const match = line.match(namePattern);
            if (match) {
                const name = match[1].trim();
                // 排除常见的旁白和系统角色
                if (name !== '旁白' && name !== '系统' && name !== '你' && name.length > 1) {
                    characterNames.push(name);
                }
            }
        });
        
        // 去重
        return [...new Set(characterNames)];
    }
    
    async generateTemporaryCharacterFromStory(characterName, storyContent) {
        try {
            // 提取角色在故事中的描述
            const characterDescription = this.extractCharacterDescription(characterName, storyContent);
            
            if (window.assistantsModule) {
                // 调用人物小助手生成临时角色
                // 这里需要在AssistantsModule中添加一个方法来处理这个功能
                // 暂时使用直接调用API的方式
                const prompt = `请根据以下故事内容，为角色 ${characterName} 生成一个详细的人物描述：\n\n${characterDescription}`;
                
                const response = await window.api.callAPI('user', prompt);
                
                // 生成临时角色
                const character = {
                    id: `character_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    name: characterName,
                    isMain: false,
                    isTemporary: true,
                    fixedProfile: {
                        description: response,
                        personality: '未知',
                        background: '故事中出现的临时角色',
                        relationships: [],
                        sceneExamples: '',
                        notes: '从故事中自动生成的临时角色',
                        tags: ['临时角色']
                    },
                    dynamicProfile: {
                        description: response,
                        personality: '未知',
                        background: '故事中出现的临时角色',
                        relationships: [],
                        sceneExamples: '',
                        notes: '从故事中自动生成的临时角色',
                        tags: ['临时角色']
                    },
                    stats: [],
                    diaries: [],
                    items: [],
                    events: {
                        pending: [],
                        completed: []
                    }
                };
                
                // 保存角色
                storage.saveCharacter(character);
                
                // 将角色添加到当前世界
                const world = storage.getWorldById(this.currentWorldId);
                if (world && !world.characters.includes(character.id)) {
                    world.characters.push(character.id);
                    storage.saveWorld(world);
                }
                
                console.log(`临时角色 ${characterName} 生成成功`);
            }
        } catch (error) {
            console.error('生成临时角色失败:', error);
        }
    }
    
    extractCharacterDescription(characterName, storyContent) {
        // 提取角色在故事中的描述
        const lines = storyContent.split('\n');
        const characterLines = [];
        
        lines.forEach(line => {
            if (line.includes(characterName)) {
                characterLines.push(line);
            }
        });
        
        return characterLines.join('\n');
    }
    
    async integrateOtherAssistants(storyContent) {
        try {
            // 集成人设小助手（更新角色档案）
            await this.updateCharacterProfiles(storyContent);
            
            // 集成物品小助手（分析物品）
            await this.analyzeItemsInStory(storyContent);
            
            // 集成事件小助手（分析事件）
            await this.analyzeEventsInStory(storyContent);
            
            // 集成场景小助手（分析场景）
            await this.analyzeScenesInStory(storyContent);
        } catch (error) {
            console.error('集成其他小助手失败:', error);
        }
    }
    
    async updateCharacterProfiles(storyContent) {
        // 更新角色档案
        const allCharacters = storage.getCharactersByWorldId(this.currentWorldId);
        const selectedCharacters = allCharacters.filter(character => 
            this.currentStory && this.currentStory.characters.includes(character.id)
        );
        
        for (const character of selectedCharacters) {
            try {
                // 调用人设小助手的方法来更新角色档案
                if (window.assistantsModule && window.assistantsModule.assistantsInstances['profile-assistant']) {
                    // 调用updateCharacterProfileFromStory方法更新角色档案
                    window.assistantsModule.assistantsInstances['profile-assistant'].updateCharacterProfileFromStory(character, storyContent);
                    // 保存更新后的角色
                    storage.saveCharacter(character);
                } else {
                    // 暂时使用简单的更新方式
                    if (!character.dynamicProfile) {
                        character.dynamicProfile = {};
                    }
                    
                    // 更新角色的最近故事经历
                    character.dynamicProfile.recentStory = storyContent.substring(0, 500) + '...';
                    storage.saveCharacter(character);
                }
            } catch (error) {
                console.error('更新角色档案失败:', error);
            }
        }
    }
    
    async analyzeItemsInStory(storyContent) {
        // 分析故事中的物品
        // 这里可以调用物品小助手的方法
        console.log('分析故事中的物品:', storyContent);
    }
    
    async analyzeEventsInStory(storyContent) {
        // 分析故事中的事件
        // 这里可以调用事件小助手的方法
        console.log('分析故事中的事件:', storyContent);
    }
    
    async analyzeScenesInStory(storyContent) {
        // 分析故事中的场景
        // 这里可以调用场景小助手的方法
        console.log('分析故事中的场景:', storyContent);
    }

    buildStoryContext() {
        const allCharacters = storage.getCharactersByWorldId(this.currentWorldId);
        const selectedCharacters = allCharacters.filter(character => 
            !character.isMain && (this.currentStory ? this.currentStory.characters.includes(character.id) : this.selectedCharacters.includes(character.id))
        );
        
        // 获取主角信息
        const mainCharacter = allCharacters.find(character => character.isMain);
        
        const formattedTime = this.timeManager.formatCurrentTime();
        
        let context = `当前时间: ${formattedTime}\n`;
        
        // 添加主角信息
        if (mainCharacter) {
            const dynamicProfile = mainCharacter.dynamicProfile || {};
            const fixedProfile = mainCharacter.fixedProfile || mainCharacter.profile || {};
            
            context += `你是${mainCharacter.name}，`;
            context += `性格: ${dynamicProfile.personality || fixedProfile.personality || '无'}\n`;
            context += `背景: ${dynamicProfile.background || fixedProfile.background || '无'}\n`;
            
            if (dynamicProfile.tags && dynamicProfile.tags.length > 0) {
                context += `标签: ${dynamicProfile.tags.join(', ')}\n`;
            } else if (fixedProfile.tags && fixedProfile.tags.length > 0) {
                context += `标签: ${fixedProfile.tags.join(', ')}\n`;
            }
        } else {
            context += `这是一个故事生成场景，你作为主角参与其中，`;
        }
        
        if (selectedCharacters.length > 0) {
            context += `其他参与角色有: ${selectedCharacters.map(c => c.name).join('、')}。`;
        }
        
        // 添加其他角色信息
        selectedCharacters.forEach(character => {
            const dynamicProfile = character.dynamicProfile || {};
            const fixedProfile = character.fixedProfile || character.profile || {};
            
            context += `\n\n${character.name}的人设:\n`;
            context += `性格: ${dynamicProfile.personality || fixedProfile.personality || '无'}\n`;
            context += `背景: ${dynamicProfile.background || fixedProfile.background || '无'}\n`;
            
            if (dynamicProfile.tags && dynamicProfile.tags.length > 0) {
                context += `标签: ${dynamicProfile.tags.join(', ')}\n`;
            } else if (fixedProfile.tags && fixedProfile.tags.length > 0) {
                context += `标签: ${fixedProfile.tags.join(', ')}\n`;
            }
        });
        
        // 添加之前的日记内容
        const previousDiaries = this.getPreviousDiaries();
        if (previousDiaries.length > 0) {
            context += '\n\n之前的故事日记:\n';
            previousDiaries.forEach((diary, index) => {
                context += `\n${index + 1}. ${diary.content.substring(0, 500)}${diary.content.length > 500 ? '...' : ''}\n`;
            });
        }
        
        if (this.currentStory && this.currentStory.scenes.length > 0) {
            context += '\n\n最近的故事场景:\n';
            const recentScenes = this.currentStory.scenes.slice(-3);
            recentScenes.forEach(scene => {
                scene.messages.forEach(msg => {
                    if (msg.type !== 'system') {
                        context += `${msg.sender}: ${msg.content}\n`;
                    }
                });
            });
        }
        
        if (this.currentStory && this.currentStory.storySummary) {
            context += `\n\n故事概要: ${this.currentStory.storySummary}`;
        }
        
        return context;
    }
    
    // 获取之前的日记内容
    getPreviousDiaries() {
        const stories = storage.getStoriesByWorldId(this.currentWorldId) || [];
        let diaries = [];
        
        stories.forEach(story => {
            if (story.archive && story.archive.length > 0) {
                story.archive.forEach(archiveItem => {
                    if (archiveItem.summary === '故事日记') {
                        diaries.push(archiveItem);
                    }
                });
            }
        });
        
        // 按时间倒序排序，取最近的3篇日记
        diaries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return diaries.slice(0, 3);
    }
    
    async endStory() {
        if (!this.currentStory) return;
        
        // 更新小助手状态
        this.updateAssistantStatus('story-assistant', '结束故事');
        this.updateAssistantStatus('profile-assistant', '更新角色档案');
        this.updateAssistantStatus('scene-assistant', '分析故事场景');
        this.updateAssistantStatus('summary-assistant', '生成故事总结');
        
        this.currentStory.endTime = new Date().toISOString();
        
        // 生成故事总结
        await this.generateStorySummary();
        
        // 集成其他小助手处理
        const lastScene = this.currentStory.scenes[this.currentStory.scenes.length - 1];
        if (lastScene) {
            const lastSceneContent = lastScene.messages
                .filter(msg => msg.type !== 'system')
                .map(msg => `${msg.sender}: ${msg.content}`)
                .join('\n');
            
            await this.integrateOtherAssistants(lastSceneContent);
        }
        
        // 保存场景到故事档案
        this.currentStory.archive = this.currentStory.scenes.map(scene => {
            // 构建场景内容
            let sceneContent = '';
            scene.messages.forEach(msg => {
                if (msg.type !== 'system') {
                    sceneContent += `${msg.sender}: ${msg.content}\n`;
                }
            });
            
            return {
                id: scene.id,
                summary: `场景: ${scene.scene || '未知场景'}`,
                content: sceneContent.trim(),
                timestamp: scene.timestamp,
                scene: scene.scene
            };
        });
        
        // 从localStorage读取所有卡片数据
        const storedCards = localStorage.getItem(`story_cards_${this.currentWorldId}`);
        let cards = [];
        if (storedCards) {
            try {
                cards = JSON.parse(storedCards);
            } catch (error) {
                console.error('解析卡片数据失败:', error);
            }
        }
        
        // 根据卡片内容生成第三人称日记
        if (cards.length > 0) {
            // 调用总结小助手生成第三人称日记
            let diaryContent = '';
            if (window.assistantsModule && window.assistantsModule.assistantsInstances['summary-assistant'] && window.assistantsModule.assistantsInstances['summary-assistant'].generateDiaryFromCards) {
                diaryContent = window.assistantsModule.assistantsInstances['summary-assistant'].generateDiaryFromCards(cards);
            } else {
                diaryContent = this.generateDiaryFromCards(cards);
            }
            
            // 清空之前的剧情总结（如果存在）
            this.currentStory.archive = this.currentStory.archive.filter(item => item.summary !== '剧情总结');
            
            // 将日记添加到故事档案
            this.currentStory.archive.push({
                id: `diary_${Date.now()}`,
                summary: '故事日记',
                content: diaryContent,
                timestamp: new Date().toISOString(),
                scene: '故事日记'
            });
        }
        
        // 构建完整的剧情内容
        let fullStoryContent = '';
        const individualScenes = [];
        
        this.currentStory.scenes.forEach((scene, index) => {
            let sceneContent = `场景 ${index + 1}:\n`;
            scene.messages.forEach(msg => {
                if (msg.type !== 'system') {
                    const messageContent = `${msg.sender}: ${msg.content}`;
                    sceneContent += messageContent + '\n';
                    fullStoryContent += messageContent + '\n';
                }
            });
            individualScenes.push(sceneContent.trim());
        });
        
        // 保存修改后的故事
        storage.saveStory(this.currentStory);
        
        // 将故事添加到最近故事记录
        if (window.assistantsModule && window.assistantsModule.assistantsInstances['summary-assistant']) {
            window.assistantsModule.assistantsInstances['summary-assistant'].saveToRecentStories({
                id: this.currentStory.id,
                worldId: this.currentStory.worldId,
                storySummary: this.currentStory.storySummary,
                fullStory: fullStoryContent,
                scenes: individualScenes,
                endTime: this.currentStory.endTime,
                characters: this.currentStory.characters
            });
        } else {
            storage.addRecentStory({
                id: this.currentStory.id,
                worldId: this.currentStory.worldId,
                storySummary: this.currentStory.storySummary,
                fullStory: fullStoryContent,
                scenes: individualScenes,
                endTime: this.currentStory.endTime,
                characters: this.currentStory.characters
            });
        }
        
        // 集成其他管理功能
        if (window.assistantsModule && window.assistantsModule.assistantsInstances['summary-assistant']) {
            window.assistantsModule.assistantsInstances['summary-assistant'].integrateManagement();
        }
        
        this.addSystemMessage('故事已结束。');
        
        // 更新小助手状态
        this.updateAssistantStatus('story-assistant', '故事已结束');
        this.updateAssistantStatus('profile-assistant', '角色档案已更新');
        this.updateAssistantStatus('scene-assistant', '场景分析完成');
        this.updateAssistantStatus('time-assistant', '时间记录完成');
        this.updateAssistantStatus('character-generator-assistant', '角色分析完成');
        this.updateAssistantStatus('summary-assistant', '总结完成');
        
        const endStory = document.getElementById('end-story');
        if (endStory) {
            endStory.disabled = true;
        }
        
        const choiceInput = document.getElementById('choice-input');
        if (choiceInput) {
            choiceInput.disabled = true;
        }
        
        const sendChoice = document.getElementById('send-choice');
        if (sendChoice) {
            sendChoice.disabled = true;
        }
    }
    
    async generateStorySummary() {
        if (!this.currentStory || this.currentStory.scenes.length === 0) return;
        
        try {
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '生成故事总结');
            
            // 构建故事内容
            let storyContent = '';
            this.currentStory.scenes.forEach(scene => {
                scene.messages.forEach(msg => {
                    if (msg.type !== 'system') {
                        storyContent += `${msg.sender}: ${msg.content}\n`;
                    }
                });
            });
            
            // 构建总结提示
            const prompt = `请为以下故事生成一个详细的总结，包括主要角色、关键情节和故事发展：\n\n${storyContent}`;
            
            // 调用API生成总结
            if (window.api && window.api.config.apiKey) {
                const response = await window.api.callAPI('user', prompt);
                this.currentStory.storySummary = response;
            }
            
            // 更新小助手状态
            this.updateAssistantStatus('story-assistant', '故事总结生成完成');
        } catch (error) {
            console.error('生成故事总结失败:', error);
            this.updateAssistantStatus('story-assistant', '生成故事总结失败');
        }
    }
    
    generatePlotSummaryFromCards(cards) {
        // 按时间排序卡片
        const sortedCards = [...cards].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // 提取所有角色
        const characters = new Set();
        sortedCards.forEach(card => {
            card.messages.forEach(msg => {
                if (msg.sender && msg.sender !== '旁白' && msg.sender !== '系统') {
                    characters.add(msg.sender);
                }
            });
        });
        
        // 提取主要场景
        const scenes = new Set();
        sortedCards.forEach(card => {
            if (card.scene && card.scene !== '未知场景') {
                scenes.add(card.scene);
            }
        });
        
        // 构建剧情发展
        let plotDevelopment = '';
        sortedCards.forEach((card, index) => {
            if (card.messages.length > 0) {
                const firstMessage = card.messages[0];
                if (firstMessage.type === 'narration') {
                    plotDevelopment += `\n${index + 1}. ${firstMessage.content.substring(0, 100)}...`;
                }
            }
        });
        
        // 生成剧情总结
        const summary = `# 剧情总结\n\n## 主要角色\n${Array.from(characters).map(char => `- ${char}`).join('\n')}\n\n## 主要场景\n${Array.from(scenes).map(scene => `- ${scene}`).join('\n')}\n\n## 剧情发展${plotDevelopment}\n\n## 故事结局\n故事讲述了一段关于${Array.from(characters).slice(0, 2).join('和')}的冒险经历，他们在${Array.from(scenes).slice(0, 2).join('和')}等地发生了一系列有趣的故事。`;
        
        return summary;
    }
    
    generateDiaryFromCards(cards) {
        // 按时间排序卡片
        const sortedCards = [...cards].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // 提取所有角色
        const characters = new Set();
        sortedCards.forEach(card => {
            card.messages.forEach(msg => {
                if (msg.sender && msg.sender !== '旁白' && msg.sender !== '系统') {
                    characters.add(msg.sender);
                }
            });
        });
        
        // 提取主要场景
        const scenes = new Set();
        sortedCards.forEach(card => {
            if (card.scene && card.scene !== '未知场景') {
                scenes.add(card.scene);
            }
        });
        
        // 提取故事主要内容和情节
        let storyEvents = [];
        sortedCards.forEach(card => {
            card.messages.forEach(msg => {
                if (msg.type === 'narration' || msg.type === 'character') {
                    storyEvents.push({
                        sender: msg.sender,
                        content: msg.content,
                        type: msg.type
                    });
                }
            });
        });
        
        // 构建日记内容
        let diaryContent = `# 故事日记\n\n`;
        
        // 添加日期
        const today = new Date().toLocaleDateString('zh-CN');
        diaryContent += `**日期:** ${today}\n\n`;
        
        // 添加主要角色
        diaryContent += `**主要人物:** ${Array.from(characters).join('、')}\n\n`;
        
        // 添加故事内容（总结形式）
        diaryContent += `**故事内容:**\n\n`;
        
        // 生成故事总结
        if (storyEvents.length > 0) {
            // 第三人称视角总结
            diaryContent += `今天，${Array.from(characters).slice(0, 2).join('和')}在${Array.from(scenes).slice(0, 2).join('和')}等地经历了一段精彩的冒险。`;
            
            // 总结主要情节
            if (storyEvents.length > 0) {
                diaryContent += `故事围绕着他们的经历展开，包含了丰富的对话和场景描写，展现了他们之间的互动和情感。`;
            }
            
            diaryContent += `整个故事充满了趣味性和想象力，`;
        }
        
        // 添加结尾
        diaryContent += `\n\n**日记结尾:**\n`;
        diaryContent += `今天的冒险不仅丰富了${Array.from(characters).slice(0, 2).join('和')}的经历，也让他们之间的关系更加紧密。`;
        diaryContent += `期待未来还有更多有趣的故事发生。`;
        
        return diaryContent;
    }
    

    
    loadStory(storyId) {
        const story = storage.getStoryById(storyId);
        if (!story) return;
        
        this.currentStoryId = storyId;
        this.currentStory = story;
        
        // 确保故事档案存在
        if (!this.currentStory.archive) {
            this.currentStory.archive = [];
        }
        
        this.narrationManager.loadSettings();
        
        this.enableStoryUI();
        
        const characterSelection = document.getElementById('character-selection');
        if (characterSelection) {
            characterSelection.style.display = 'none';
        }
        
        // 渲染所有场景的消息
        story.scenes.forEach(scene => {
            scene.messages.forEach(message => {
                this.messageRenderer.render(message);
            });
        });
        

    }
    

    
    toggleScrollMode() {
        const storyMessages = document.getElementById('story-messages');
        const toggleScrollBtn = document.getElementById('toggle-scroll');
        
        if (storyMessages && toggleScrollBtn) {
            if (storyMessages.classList.contains('horizontal-scroll')) {
                // 切换到上下滑动
                storyMessages.classList.remove('horizontal-scroll');
                toggleScrollBtn.textContent = '左右滑动';
            } else {
                // 切换到左右滑动
                storyMessages.classList.add('horizontal-scroll');
                toggleScrollBtn.textContent = '上下滑动';
            }
        }
    }
    
    scrollLeft() {
        const storyMessages = document.getElementById('story-messages');
        if (storyMessages && storyMessages.classList.contains('horizontal-scroll')) {
            storyMessages.scrollBy({ left: -700, behavior: 'smooth' });
        }
    }
    
    scrollRight() {
        const storyMessages = document.getElementById('story-messages');
        if (storyMessages && storyMessages.classList.contains('horizontal-scroll')) {
            storyMessages.scrollBy({ left: 700, behavior: 'smooth' });
        }
    }
    

}

// 初始化故事模块
let storyModule;
document.addEventListener('DOMContentLoaded', function() {
    storyModule = new StoryModule();
    storyModule.init();
});