// 总结小助手模块
import AssistantBase from '../assistant-base.js';

class SummaryAssistant extends AssistantBase {
    constructor(worldId) {
        super(worldId);
        this.id = 'summary-assistant';
        this.name = '总结小助手';
        this.color = '#10b981';
        this.settings = this.loadSettings();
    }
    
    // 加载设置
    loadSettings() {
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const summaryAssistant = assistants.find(a => a.id === 'summary-assistant');
                if (summaryAssistant && summaryAssistant.settings) {
                    return summaryAssistant.settings;
                }
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        return {
            enabled: true,
            autoUpdate: false,
            diarySettings: {
                enabled: true,
                style: '简洁',
                format: '段落',
                wordCount: 200,
                includeCharacters: true,
                includePlot: true,
                includeThemes: false,
                diaryType: '第三人称',
                tone: '客观',
                includeDate: true
            }
        };
    }
    
    // 保存设置
    saveSettings() {
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        let assistants = [];
        if (storedAssistants) {
            try {
                assistants = JSON.parse(storedAssistants);
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        const index = assistants.findIndex(a => a.id === 'summary-assistant');
        if (index >= 0) {
            assistants[index] = {
                ...assistants[index],
                settings: this.settings
            };
        } else {
            assistants.push({
                id: 'summary-assistant',
                name: '总结小助手',
                description: '管理故事卡片和生成故事日记',
                profile: {
                    personality: '客观、全面、善于整理',
                    background: '我是专门负责管理故事卡片和生成故事日记的小助手，帮助你整理故事内容并创建个性化日记。',
                    tags: ['故事卡片', '故事日记', '内容整理']
                },
                settings: this.settings
            });
        }

        localStorage.setItem(`assistants_${this.worldId}`, JSON.stringify(assistants));
    }
    
    // 更新设置
    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        this.saveSettings();
    }

    // 生成故事总结
    async generateSummary(storyContent) {
        try {
            // 构建总结提示
            const prompt = `请为以下故事生成一个详细的总结，包括主要角色、关键情节和故事发展：\n\n${storyContent}`;
            
            // 调用API生成总结
            if (window.api && window.api.config.apiKey) {
                const response = await window.api.callAPI('user', prompt);
                return response;
            }
            return '总结生成失败，请配置API密钥';
        } catch (error) {
            console.error('生成总结失败:', error);
            return '总结生成失败';
        }
    }

    // 从卡片生成剧情总结
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
    
    // 从卡片生成日记
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
        
        // 获取日记设置
        const diarySettings = this.settings.diarySettings || {
            style: '简洁',
            format: '段落',
            wordCount: 200,
            includeCharacters: true,
            includePlot: true,
            includeThemes: false,
            diaryType: '第三人称',
            tone: '客观',
            includeDate: true
        };
        
        // 构建日记内容
        let diaryContent = '';
        
        // 添加日期
        if (diarySettings.includeDate) {
            const today = new Date().toLocaleDateString('zh-CN');
            diaryContent += `**日期:** ${today}\n\n`;
        }
        
        // 添加主要角色
        if (diarySettings.includeCharacters && characters.size > 0) {
            diaryContent += `**主要人物:** ${Array.from(characters).join('、')}\n\n`;
        }
        
        // 添加故事内容（总结形式）
        diaryContent += `**故事内容:**\n\n`;
        
        // 生成故事总结
        if (storyEvents.length > 0) {
            if (diarySettings.diaryType === '第一人称') {
                // 第一人称视角总结
                diaryContent += `今天，我和${Array.from(characters).slice(0, 2).join('、')}一起经历了一段有趣的冒险。`;
                
                // 提取关键事件
                if (storyEvents.length > 0) {
                    diaryContent += `我们从${Array.from(scenes).slice(0, 1)[0] || '某个地方'}开始，`;
                    
                    // 总结主要事件
                    if (storyEvents.length > 1) {
                        diaryContent += `发生了一系列精彩的事情，包括${storyEvents.slice(0, 2).map(event => {
                            if (event.type === 'character') {
                                return `${event.sender}的精彩对话`;
                            } else {
                                return `有趣的场景`;
                            }
                        }).join('和')}等。`;
                    }
                }
            } else {
                // 第三人称视角总结
                diaryContent += `今天，${Array.from(characters).slice(0, 2).join('和')}在${Array.from(scenes).slice(0, 2).join('和')}等地经历了一段精彩的冒险。`;
                
                // 总结主要情节
                if (storyEvents.length > 0) {
                    diaryContent += `故事围绕着他们的经历展开，包含了丰富的对话和场景描写，展现了他们之间的互动和情感。`;
                }
            }
            
            diaryContent += `整个故事充满了趣味性和想象力，`;
        }
        
        // 添加结尾
        diaryContent += `\n\n**日记结尾:**\n`;
        if (diarySettings.tone === '怀旧') {
            diaryContent += `今天的经历让我想起了过去的美好时光，${Array.from(characters).slice(0, 2).join('和')}的身影在我脑海中挥之不去。`;
        } else if (diarySettings.tone === '兴奋') {
            diaryContent += `今天真是令人兴奋的一天！${Array.from(characters).slice(0, 2).join('和')}一起经历了那么多有趣的事情。`;
        } else if (diarySettings.tone === '主观') {
            diaryContent += `我觉得今天的经历非常有意义，${Array.from(characters).slice(0, 2).join('和')}的表现真的很出色。`;
        } else {
            diaryContent += `今天的冒险不仅丰富了${Array.from(characters).slice(0, 2).join('和')}的经历，也让他们之间的关系更加紧密。`;
        }
        diaryContent += `期待未来还有更多有趣的故事发生。`;
        
        // 根据风格调整内容
        if (diarySettings.style === '简洁') {
            // 简洁风格
            diaryContent = diaryContent.split('\n').filter(line => line.trim()).join('\n');
        } else if (diarySettings.style === '文艺') {
            // 文艺风格
            diaryContent = diaryContent.replace(/\n/g, '\n\t');
            diaryContent = `# 故事日记\n\n${diaryContent}`;
        }
        
        // 根据格式调整内容
        if (diarySettings.format === '列表') {
            // 列表格式
            const lines = diaryContent.split('\n');
            diaryContent = lines.map(line => {
                if (line.trim() && !line.startsWith('**') && !line.startsWith('#') && !line.startsWith('###')) {
                    return `- ${line}`;
                }
                return line;
            }).join('\n');
        } else if (diarySettings.format === '标题') {
            // 标题格式
            diaryContent = `# 故事日记\n\n${diaryContent}`;
        }
        
        return diaryContent;
    }

    // 保存故事到最近记录
    saveToRecentStories(story) {
        storage.addRecentStory({
            id: story.id,
            worldId: story.worldId,
            storySummary: story.storySummary,
            fullStory: story.fullStory || '',
            scenes: story.scenes || [],
            endTime: story.endTime,
            characters: story.characters
        });
    }

    // 集成其他管理功能
    integrateManagement() {
        // 这里可以添加其他管理功能的集成
        console.log('总结小助手集成管理功能');
    }
    
    // 生成设置面板HTML
    generateSettingsHTML(settings) {
        const diarySettings = settings.diarySettings || {
            enabled: true,
            style: '简洁',
            format: '段落',
            wordCount: 200,
            includeCharacters: true,
            includePlot: true,
            includeThemes: false,
            diaryType: '第三人称',
            tone: '客观',
            includeDate: true
        };
        
        return `
            <h3 style="color: ${this.color};">${this.name}设置</h3>
            ${this.generateCheckbox('assistant-enabled', `启用${this.name}`, settings.enabled, this.color)}
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">日记设置</h4>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    ${this.generateCheckbox('diary-enabled', '启用故事日记', diarySettings.enabled)}
                    
                    <div style="margin-top: var(--spacing-sm);">
                        ${this.generateSelect('diary-style', '日记风格', [
                            { value: '简洁', label: '简洁' },
                            { value: '详细', label: '详细' },
                            { value: '文艺', label: '文艺' },
                            { value: '专业', label: '专业' }
                        ], diarySettings.style, this.color)}
                    </div>
                    
                    <div style="margin-top: var(--spacing-sm);">
                        ${this.generateSelect('diary-format', '日记格式', [
                            { value: '段落', label: '段落' },
                            { value: '列表', label: '列表' },
                            { value: '标题', label: '标题' }
                        ], diarySettings.format, this.color)}
                    </div>
                    
                    <div style="margin-top: var(--spacing-sm);">
                        <label for="diary-word-count" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500;">日记字数:</label>
                        <input type="range" id="diary-word-count" min="100" max="1000" value="${diarySettings.wordCount || 200}" style="width: 100%;" />
                        <span id="diary-word-count-value" style="font-size: 0.875rem;">${diarySettings.wordCount || 200}字</span>
                    </div>
                    
                    <div style="margin-top: var(--spacing-sm);">
                        ${this.generateSelect('diary-type', '日记视角', [
                            { value: '第一人称', label: '第一人称' },
                            { value: '第三人称', label: '第三人称' }
                        ], diarySettings.diaryType, this.color)}
                    </div>
                    
                    <div style="margin-top: var(--spacing-sm);">
                        ${this.generateSelect('diary-tone', '日记语气', [
                            { value: '客观', label: '客观' },
                            { value: '主观', label: '主观' },
                            { value: '怀旧', label: '怀旧' },
                            { value: '兴奋', label: '兴奋' }
                        ], diarySettings.tone, this.color)}
                    </div>
                    
                    <div style="margin-top: var(--spacing-sm);">
                        ${this.generateCheckbox('include-date', '包含日期', diarySettings.includeDate, '')}
                    </div>
                    
                    <div style="margin-top: var(--spacing-sm);">
                        <h5 style="margin-bottom: var(--spacing-sm); font-weight: 500;">日记内容包含:</h5>
                        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                            ${this.generateCheckbox('include-characters', '角色', diarySettings.includeCharacters, '')}
                            ${this.generateCheckbox('include-plot', '情节', diarySettings.includePlot, '')}
                            ${this.generateCheckbox('include-themes', '主题', diarySettings.includeThemes, '')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">存档设置</h4>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    ${this.generateCheckbox('auto-save', '自动保存到故事日记', settings.autoUpdate)}
                </div>
            </div>
            
            ${this.generateTextInput('assistant-description', '小助手描述', settings.description)}
            ${this.generateButton('save-assistant-settings', '保存小助手设置', 'background-color: #10b981; color: white;')}
        `;
    }
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        // 绑定日记字数滑块事件
        const wordCountSlider = document.getElementById('diary-word-count');
        const wordCountValue = document.getElementById('diary-word-count-value');
        if (wordCountSlider && wordCountValue) {
            wordCountSlider.addEventListener('input', (e) => {
                wordCountValue.textContent = `${e.target.value}字`;
            });
        }
    }
}

export default SummaryAssistant;