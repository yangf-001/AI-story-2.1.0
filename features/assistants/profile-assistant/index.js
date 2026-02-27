// 人设小助手模块
import AssistantBase from '../assistant-base.js';

class ProfileAssistant extends AssistantBase {
    constructor(worldId) {
        super(worldId);
        this.id = 'profile-assistant';
        this.name = '人设小助手';
        this.color = '#3b82f6';
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const profileAssistant = assistants.find(a => a.id === 'profile-assistant');
                if (profileAssistant && profileAssistant.settings) {
                    return profileAssistant.settings;
                }
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        return {
            enabled: true,
            autoUpdate: false
        };
    }

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

        const index = assistants.findIndex(a => a.id === 'profile-assistant');
        if (index >= 0) {
            assistants[index] = {
                ...assistants[index],
                settings: this.settings
            };
        } else {
            assistants.push({
                id: 'profile-assistant',
                name: '人设小助手',
                description: '管理角色的性格、背景、标签、物品、事件和数值',
                profile: {
                    personality: '细心、专注、善于分析、有条理、组织性强',
                    background: '我是专门负责管理角色档案的小助手，帮助你打造生动的角色形象，管理角色的物品、事件和属性数值。',
                    tags: ['人设管理', '角色塑造', '性格分析', '物品管理', '事件管理', '数值管理']
                },
                settings: this.settings
            });
        }

        localStorage.setItem(`assistants_${this.worldId}`, JSON.stringify(assistants));
    }

    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        this.saveSettings();
    }

    // 管理角色档案
    manageCharacterProfile(character) {
        if (!this.settings.enabled) return null;
        
        // 可以添加角色档案管理的逻辑
        return character;
    }

    // 管理角色物品
    manageCharacterItems(character) {
        if (!this.settings.enabled) return null;
        
        // 确保物品数组存在
        if (!character.items) {
            character.items = [];
        }
        
        return character.items;
    }

    // 管理角色事件
    manageCharacterEvents(character) {
        if (!this.settings.enabled) return null;
        
        // 确保事件对象存在
        if (!character.events) {
            character.events = {
                pending: [],
                completed: []
            };
        }
        
        return character.events;
    }

    // 管理角色数值
    manageCharacterStats(character) {
        if (!this.settings.enabled) return null;
        
        // 确保数值数组存在
        if (!character.stats) {
            character.stats = [];
        }
        
        return character.stats;
    }
    
    // 根据剧情更新角色档案
    updateCharacterProfileFromStory(character, storyContent) {
        if (!this.settings.enabled) return character;
        
        // 分析剧情内容，提取与角色相关的信息
        const characterInfo = this.analyzeStoryForCharacter(character, storyContent);
        
        // 更新临时人设
        this.updateTemporaryProfile(character, characterInfo);
        
        // 更新角色数值
        this.updateCharacterStatsFromStory(character, characterInfo);
        
        // 更新角色物品
        this.updateCharacterItemsFromStory(character, characterInfo);
        
        // 更新角色事件
        this.updateCharacterEventsFromStory(character, characterInfo);
        
        return character;
    }
    
    // 分析剧情内容，提取与角色相关的信息
    analyzeStoryForCharacter(character, storyContent) {
        // 提取角色相关的对话和行动
        const characterMentions = [];
        const lines = storyContent.split('\n');
        
        lines.forEach(line => {
            if (line.includes(character.name)) {
                characterMentions.push(line);
            }
        });
        
        // 提取可能的物品
        const items = this.extractItemsFromStory(storyContent, character.name);
        
        // 提取可能的事件
        const events = this.extractEventsFromStory(storyContent, character.name);
        
        // 提取可能的数值变化
        const statsChanges = this.extractStatsChangesFromStory(storyContent, character.name);
        
        return {
            mentions: characterMentions,
            items: items,
            events: events,
            statsChanges: statsChanges
        };
    }
    
    // 从剧情中提取物品
    extractItemsFromStory(storyContent, characterName) {
        // 简单的物品提取逻辑，实际应用中可能需要更复杂的NLP处理
        const items = [];
        const itemPatterns = [
            /获得了([^，。！？]+)/,
            /拿到了([^，。！？]+)/,
            /得到了([^，。！？]+)/,
            /拥有了([^，。！？]+)/
        ];
        
        itemPatterns.forEach(pattern => {
            const matches = storyContent.match(new RegExp(pattern.source, 'g'));
            if (matches) {
                matches.forEach(match => {
                    const itemMatch = match.match(pattern);
                    if (itemMatch && itemMatch[1]) {
                        items.push(itemMatch[1].trim());
                    }
                });
            }
        });
        
        return items;
    }
    
    // 从剧情中提取事件
    extractEventsFromStory(storyContent, characterName) {
        // 简单的事件提取逻辑
        const events = [];
        const eventPatterns = [
            /(遇到了|经历了|发生了)([^，。！？]+)/,
            /(去了|到了|抵达了)([^，。！？]+)/,
            /(做了|完成了|执行了)([^，。！？]+)/
        ];
        
        eventPatterns.forEach(pattern => {
            const matches = storyContent.match(new RegExp(pattern.source, 'g'));
            if (matches) {
                matches.forEach(match => {
                    const eventMatch = match.match(pattern);
                    if (eventMatch && eventMatch[2]) {
                        events.push({
                            type: eventMatch[1],
                            description: eventMatch[2].trim(),
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            }
        });
        
        return events;
    }
    
    // 从剧情中提取数值变化
    extractStatsChangesFromStory(storyContent, characterName) {
        // 简单的数值变化提取逻辑
        const statsChanges = [];
        const statsPatterns = [
            /(力量|体力|智力|敏捷|勇气|信心)增加了(\d+)/,
            /(力量|体力|智力|敏捷|勇气|信心)减少了(\d+)/,
            /(力量|体力|智力|敏捷|勇气|信心)提升了(\d+)/,
            /(力量|体力|智力|敏捷|勇气|信心)下降了(\d+)/
        ];
        
        statsPatterns.forEach(pattern => {
            const matches = storyContent.match(new RegExp(pattern.source, 'g'));
            if (matches) {
                matches.forEach(match => {
                    const statsMatch = match.match(pattern);
                    if (statsMatch && statsMatch[1] && statsMatch[2]) {
                        statsChanges.push({
                            stat: statsMatch[1],
                            change: parseInt(statsMatch[2]),
                            type: match.includes('增加') || match.includes('提升') ? 'increase' : 'decrease'
                        });
                    }
                });
            }
        });
        
        return statsChanges;
    }
    
    // 更新临时人设
    updateTemporaryProfile(character, characterInfo) {
        // 确保临时人设存在
        if (!character.dynamicProfile) {
            character.dynamicProfile = { ...character.fixedProfile };
        }
        
        // 根据剧情更新性格和背景
        if (characterInfo.mentions.length > 0) {
            // 简单的性格更新逻辑，实际应用中可能需要更复杂的NLP处理
            character.dynamicProfile.recentExperiences = characterInfo.mentions.slice(0, 3);
        }
    }
    
    // 根据剧情更新角色数值
    updateCharacterStatsFromStory(character, characterInfo) {
        // 确保数值数组存在
        if (!character.stats) {
            character.stats = [];
        }
        
        // 更新数值
        characterInfo.statsChanges.forEach(change => {
            let stat = character.stats.find(s => s.name === change.stat);
            if (!stat) {
                stat = {
                    name: change.stat,
                    value: 50, // 默认值
                    max: 100
                };
                character.stats.push(stat);
            }
            
            if (change.type === 'increase') {
                stat.value = Math.min(stat.value + change.change, stat.max);
            } else {
                stat.value = Math.max(stat.value - change.change, 0);
            }
        });
    }
    
    // 根据剧情更新角色物品
    updateCharacterItemsFromStory(character, characterInfo) {
        // 确保物品数组存在
        if (!character.items) {
            character.items = [];
        }
        
        // 添加新物品
        characterInfo.items.forEach(itemName => {
            // 检查物品是否已存在
            const existingItem = character.items.find(item => item.name === itemName);
            if (!existingItem) {
                character.items.push({
                    id: `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    name: itemName,
                    type: '普通物品',
                    description: `${character.name}获得的物品`,
                    obtainedAt: new Date().toISOString()
                });
            }
        });
    }
    
    // 根据剧情更新角色事件
    updateCharacterEventsFromStory(character, characterInfo) {
        // 确保事件对象存在
        if (!character.events) {
            character.events = {
                pending: [],
                completed: []
            };
        }
        
        // 添加新事件
        characterInfo.events.forEach(event => {
            character.events.completed.push({
                id: `event_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                type: event.type,
                description: event.description,
                timestamp: event.timestamp,
                status: 'completed'
            });
        });
    }
    
    // 为角色生成第一人称日记
    generateCharacterDiary(character, storyContent) {
        // 分析角色在剧情中的表现
        const characterInfo = this.analyzeStoryForCharacter(character, storyContent);
        
        // 构建日记内容
        let diaryContent = `# ${character.name}的日记\n\n`;
        
        // 添加日期
        const today = new Date().toLocaleDateString('zh-CN');
        diaryContent += `**日期:** ${today}\n\n`;
        
        // 添加日记内容
        diaryContent += `**今日经历:**\n\n`;
        
        if (characterInfo.mentions.length > 0) {
            diaryContent += `今天，我${characterInfo.mentions[0].replace(character.name, '').trim()}\n\n`;
            
            if (characterInfo.mentions.length > 1) {
                diaryContent += `之后，我还${characterInfo.mentions[1].replace(character.name, '').trim()}\n\n`;
            }
        } else {
            diaryContent += `今天是平凡的一天，但也有一些值得记录的事情。\n\n`;
        }
        
        // 添加获得的物品
        if (characterInfo.items.length > 0) {
            diaryContent += `**获得的物品:**\n`;
            characterInfo.items.forEach(item => {
                diaryContent += `- ${item}\n`;
            });
            diaryContent += `\n`;
        }
        
        // 添加事件
        if (characterInfo.events.length > 0) {
            diaryContent += `**发生的事件:**\n`;
            characterInfo.events.forEach(event => {
                diaryContent += `- ${event.type}${event.description}\n`;
            });
            diaryContent += `\n`;
        }
        
        // 添加结尾
        diaryContent += `**日记结尾:**\n`;
        diaryContent += `今天的经历让我成长了许多，我期待明天会有更多的冒险。`;
        
        return diaryContent;
    }
    
    // 生成设置面板HTML
    generateSettingsHTML(settings) {
        return `
            <h3 style="color: ${this.color};">${this.name}设置</h3>
            ${this.generateCheckbox('assistant-enabled', `启用${this.name}`, settings.enabled, this.color)}
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">角色档案管理</h4>
                <p>人设小助手负责管理角色的性格、背景、标签、物品、事件和数值</p>
                <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                    ${this.generateCheckbox('manage-profile', '人设管理', true, '')}
                    ${this.generateCheckbox('manage-items', '物品管理', true, '')}
                    ${this.generateCheckbox('manage-events', '事件管理', true, '')}
                    ${this.generateCheckbox('manage-stats', '数值管理', true, '')}
                </div>
            </div>
            
            ${this.generateCheckbox('assistant-auto-update', '自动更新角色档案', settings.autoUpdate)}
            ${this.generateTextInput('assistant-description', '小助手描述', settings.description)}
            ${this.generateButton('save-assistant-settings', '保存小助手设置', 'background-color: #3b82f6; color: white;')}
        `;
    }
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        // 人设小助手不需要额外的事件绑定
    }
}

// 导出模块
export default ProfileAssistant;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileAssistant;
} else if (typeof window !== 'undefined') {
    window.ProfileAssistant = ProfileAssistant;
}