// 色色小助手模块
import AssistantBase from '../assistant-base.js';

class EroticAssistant extends AssistantBase {
    constructor(worldId) {
        super(worldId);
        this.id = 'erotic-assistant';
        this.name = '色色小助手';
        this.color = '#be185d';
        this.settings = this.loadSettings();
    }

    loadSettings() {
        // 首先尝试从assistants存储中获取（与EroticSettingsModule保持一致）
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const eroticAssistant = assistants.find(a => a.id === 'erotic-assistant');
                if (eroticAssistant && eroticAssistant.settings) {
                    return eroticAssistant.settings;
                }
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        // 其次尝试从旧的erotic_assistant存储中获取
        const storedSettings = localStorage.getItem(`erotic_assistant_${this.worldId}`);
        if (storedSettings) {
            try {
                return JSON.parse(storedSettings);
            } catch (error) {
                console.error('解析erotic_assistant存储失败:', error);
            }
        }

        // 默认设置（空的关键词和数值配置）
        return {
            enabled: true,
            keywords: [],
            stats: []
        };
    }

    saveSettings() {
        // 保存到assistants存储中（与EroticSettingsModule保持一致）
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        let assistants = [];
        if (storedAssistants) {
            try {
                assistants = JSON.parse(storedAssistants);
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        const index = assistants.findIndex(a => a.id === 'erotic-assistant');
        if (index >= 0) {
            // 更新现有助手
            assistants[index] = {
                ...assistants[index],
                settings: this.settings
            };
        } else {
            // 添加新助手
            assistants.push({
                id: 'erotic-assistant',
                name: '色色小助手',
                description: '管理角色的色情内容和CG触发',
                profile: {
                    personality: '性感、挑逗、善于营造氛围',
                    background: '我是专门负责管理角色色情内容的小助手，帮助你创建和触发各种性爱场景。',
                    tags: ['色情内容', 'CG触发', '性爱场景']
                },
                settings: this.settings
            });
        }

        localStorage.setItem(`assistants_${this.worldId}`, JSON.stringify(assistants));
    }

    // 检测故事内容中的关键词
    detectKeywords(message) {
        if (!this.settings.enabled) return null;

        const lowerMessage = message.toLowerCase();
        for (const keyword of this.settings.keywords) {
            // 检查关键词的word属性
            if (lowerMessage.includes(keyword.word.toLowerCase())) {
                return keyword;
            }
            // 检查关键词的触发词属性
            if (keyword.cg && keyword.cg.触发词 && lowerMessage.includes(keyword.cg.触发词.toLowerCase())) {
                return keyword;
            }
        }
        return null;
    }

    // 检测数值触发条件
    detectStatsTrigger(character) {
        if (!this.settings.enabled || !character.stats || character.stats.length === 0) return null;

        for (const statConfig of this.settings.stats) {
            const characterStat = character.stats.find(s => s.name === statConfig.name);
            if (characterStat && characterStat.value !== undefined && characterStat.value !== null) {
                const value = characterStat.value;
                const thresholds = statConfig.thresholds || {};
                
                // 确定触发的等级
                let level = null;
                if (value > (thresholds.极端 || 90)) {
                    level = '极端';
                } else if (value > (thresholds.重度 || 70)) {
                    level = '重度';
                } else if (value > (thresholds.中度 || 50)) {
                    level = '中度';
                } else if (value > (thresholds.轻度 || 30)) {
                    level = '轻度';
                }
                
                if (level && statConfig.玩法库 && statConfig.玩法库[level]) {
                    return {
                        ...statConfig,
                        triggeredLevel: level,
                        triggeredPlays: statConfig.玩法库[level]
                    };
                }
            }
        }
        return null;
    }

    // 随机获取玩法
    getRandomPlay(playLibrary) {
        if (!playLibrary || playLibrary.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * playLibrary.length);
        return playLibrary[randomIndex];
    }

    // 添加关键词
    addKeyword(word, cg) {
        const newKeyword = {
            id: `keyword-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            word: word,
            cg: cg
        };
        this.settings.keywords.push(newKeyword);
        this.saveSettings();
        return newKeyword;
    }

    // 删除关键词
    removeKeyword(keywordId) {
        const index = this.settings.keywords.findIndex(k => k.id === keywordId);
        if (index >= 0) {
            this.settings.keywords.splice(index, 1);
            this.saveSettings();
            return true;
        }
        return false;
    }

    // 添加数值配置
    addStatConfig(name, threshold, playLibrary) {
        const newStatConfig = {
            id: `stat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: name,
            threshold: threshold,
            玩法库: playLibrary
        };
        this.settings.stats.push(newStatConfig);
        this.saveSettings();
        return newStatConfig;
    }

    // 删除数值配置
    removeStatConfig(statId) {
        const index = this.settings.stats.findIndex(s => s.id === statId);
        if (index >= 0) {
            this.settings.stats.splice(index, 1);
            this.saveSettings();
            return true;
        }
        return false;
    }

    // 更新设置
    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        this.saveSettings();
    }

    // 生成CG场景描述
    generateCGScene(keyword, characters) {
        if (!keyword || !keyword.cg) return null;

        const cg = keyword.cg;
        const characterNames = characters.map(c => c.name).join('和');

        return `${characterNames}正在进行${cg.玩法}，${cg.描述}`;
    }

    // 生成数值触发场景
    generateStatScene(statConfig, characters) {
        if (!statConfig || !statConfig.triggeredPlays) return null;

        const play = this.getRandomPlay(statConfig.triggeredPlays);
        const characterNames = characters.map(c => c.name).join('和');
        const thresholds = statConfig.thresholds || {};
        const thresholdValue = thresholds[statConfig.triggeredLevel] || 0;

        return `${characterNames}的${statConfig.name}达到了${statConfig.triggeredLevel}级别（${thresholdValue}），开始了${play}`;
    }
    
    // 生成设置面板HTML
    generateSettingsHTML(settings) {
        return `
            <h3 style="color: ${this.color};">${this.name}设置</h3>
            ${this.generateCheckbox('assistant-enabled', `启用${this.name}`, settings.enabled, this.color)}
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">高级设置</h4>
                <p>点击下面的按钮进入专门的页面管理关键词和数值设置</p>
                ${this.generateButton('open-erotic-settings', '管理关键词和数值设置', 'background-color: #ec4899; color: white; margin-top: var(--spacing-md);')}
            </div>
            
            ${this.generateTextInput('assistant-description', '小助手描述', settings.description)}
            ${this.generateButton('save-assistant-settings', '保存小助手设置', 'background-color: #ec4899; color: white;')}
        `;
    }
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        const openSettingsBtn = document.getElementById('open-erotic-settings');
        if (openSettingsBtn) {
            openSettingsBtn.addEventListener('click', () => this.openEroticSettingsPage());
        }
    }
    
    // 打开专门的设置页面
    openEroticSettingsPage() {
        localStorage.setItem('currentWorldId', this.worldId);
        window.location.href = 'erotic-settings.html';
    }
}

// 导出模块
export default EroticAssistant;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EroticAssistant;
} else if (typeof window !== 'undefined') {
    window.EroticAssistant = EroticAssistant;
}