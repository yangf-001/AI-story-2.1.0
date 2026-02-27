// 小助手模块
// 导入小助手模块
import AssistantBase from './assistant-base.js';
import ProfileAssistant from './profile-assistant/index.js';
import TimeAssistant from './time-assistant/index.js';
import EroticAssistant from './erotic-assistant/index.js';
import CharacterGeneratorAssistant from './character-generator-assistant/index.js';
import StoryAssistant from './story-assistant/index.js';
import SceneAssistant from './scene-assistant/index.js';
import SummaryAssistant from './summary-assistant/index.js';

// 为全局对象添加小助手类
window.ProfileAssistant = ProfileAssistant;
window.TimeAssistant = TimeAssistant;
window.EroticAssistant = EroticAssistant;
window.CharacterGeneratorAssistant = CharacterGeneratorAssistant;
window.StoryAssistant = StoryAssistant;
window.SceneAssistant = SceneAssistant;
window.SummaryAssistant = SummaryAssistant;
class AssistantsModule {
    constructor() {
        this.currentWorldId = localStorage.getItem('currentWorldId');
        this.assistantsInstances = {};
        this.init();
    }

    init() {
        if (!this.currentWorldId) {
            // 尝试从localStorage获取currentWorldId
            this.currentWorldId = localStorage.getItem('currentWorldId');
            if (!this.currentWorldId) {
                // 如果仍然没有currentWorldId，跳转到主页面
                window.location.href = '../../main/index.html';
                return;
            }
        }

        this.initializeAssistantInstances();
        this.loadAssistants();
        this.loadCharacters();
        this.bindEvents();
    }

    // 初始化小助手实例
    initializeAssistantInstances() {
        // 初始化各个小助手实例
        if (window.ProfileAssistant) {
            this.assistantsInstances['profile-assistant'] = new ProfileAssistant(this.currentWorldId);
        }
        if (window.TimeAssistant) {
            this.assistantsInstances['time-assistant'] = new TimeAssistant(this.currentWorldId);
        }
        if (window.EroticAssistant) {
            this.assistantsInstances['erotic-assistant'] = new EroticAssistant(this.currentWorldId);
        }
        if (window.CharacterGeneratorAssistant) {
            this.assistantsInstances['character-generator-assistant'] = new CharacterGeneratorAssistant(this.currentWorldId);
        }
        if (window.StoryAssistant) {
            this.assistantsInstances['story-assistant'] = new StoryAssistant(this.currentWorldId);
        }
        if (window.SceneAssistant) {
            this.assistantsInstances['scene-assistant'] = new SceneAssistant(this.currentWorldId);
        }
        if (window.SummaryAssistant) {
            this.assistantsInstances['summary-assistant'] = new SummaryAssistant(this.currentWorldId);
        }
    }

    loadCharacters() {
        // 获取所有角色
        this.characters = storage.getCharactersByWorldId(this.currentWorldId);
        this.renderCharactersList();
    }

    renderCharactersList() {
        const charactersList = document.getElementById('characters-list');
        if (!charactersList) return;

        charactersList.innerHTML = '';

        this.characters.forEach(character => {
            const characterItem = document.createElement('div');
            characterItem.style.padding = 'var(--spacing-sm)';
            characterItem.style.borderBottom = '1px solid var(--border-color)';
            characterItem.style.cursor = 'pointer';
            characterItem.style.transition = 'background-color var(--transition-fast)';
            characterItem.innerHTML = `
                <p style="font-weight: 600;">${character.name} ${character.isMain ? '(主角)' : ''} ${character.isTemporary ? '(临时)' : ''}</p>
            `;
            
            characterItem.addEventListener('mouseenter', () => {
                characterItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            });
            
            characterItem.addEventListener('mouseleave', () => {
                characterItem.style.backgroundColor = 'transparent';
            });
            
            characterItem.addEventListener('click', () => {
                this.showCharacterInfo(character);
            });
            
            charactersList.appendChild(characterItem);
        });
    }

    showCharacterInfo(character) {
        this.selectedCharacter = character;
        
        // 显示角色信息面板，隐藏小助手面板
        document.getElementById('assistant-profile-panel').style.display = 'none';
        document.getElementById('assistant-settings-panel').style.display = 'none';
        document.getElementById('character-info-panel').style.display = 'block';
        
        // 更新角色信息面板
        this.updateCharacterInfoPanel();
    }

    updateCharacterInfoPanel() {
        const characterPanel = document.getElementById('character-info-panel');
        if (!characterPanel || !this.selectedCharacter) return;

        const character = this.selectedCharacter;
        const dynamicProfile = character.dynamicProfile || {};
        const fixedProfile = character.fixedProfile || character.profile || {};
        const profile = dynamicProfile;
        
        // 检查是否是临时角色
        const isTemporary = character.isTemporary || false;
        
        characterPanel.innerHTML = `
            <h3>角色信息</h3>
            <div class="form-group">
                <label for="character-name">角色名称:</label>
                <input type="text" id="character-name" value="${character.name}" />
            </div>
            <div class="form-group">
                <label for="character-type">角色类型:</label>
                <input type="text" id="character-type" value="${character.isMain ? '主角' : '配角'} ${isTemporary ? '(临时)' : ''}" disabled />
            </div>
            ${!isTemporary ? `
            <div class="form-group">
                <label for="character-background">背景:</label>
                <textarea id="character-background">${profile.background || '无'}</textarea>
            </div>
            <div class="form-group">
                <label for="character-relationships">关系:</label>
                <textarea id="character-relationships">${profile.relationships ? JSON.stringify(profile.relationships, null, 2) : '无'}</textarea>
            </div>
            <div class="form-group">
                <label for="character-notes">创作者笔记:</label>
                <textarea id="character-notes">${profile.notes || '无'}</textarea>
            </div>
            ` : ''}
            <div class="form-group">
                <label for="character-description">描述:</label>
                <textarea id="character-description">${profile.description || '无'}</textarea>
            </div>
            <div class="form-group">
                <label for="character-personality">性格:</label>
                <input type="text" id="character-personality" value="${profile.personality || '无'}" />
            </div>
            <div class="form-group">
                <label for="character-tags">标签:</label>
                <input type="text" id="character-tags" value="${profile.tags ? profile.tags.join(', ') : '无'}" />
            </div>
            ${!isTemporary && character.stats && character.stats.length > 0 ? `
            <div class="form-group">
                <label>属性数值:</label>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${character.stats.map(stat => `
                        <div class="stat-item">
                            <label for="stat-${stat.id}">${stat.name}:</label>
                            <input type="number" id="stat-${stat.id}" value="${stat.value}" />
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            ${!isTemporary && character.diaries && character.diaries.length > 0 ? `
            <div class="form-group">
                <label>最近日记:</label>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${character.diaries.slice(-3).map(diary => `
                        <div class="diary-item">
                            <div style="font-size: 0.875rem; font-weight: 500;">${new Date(diary.date).toLocaleDateString()}</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">${diary.content.substring(0, 100)}${diary.content.length > 100 ? '...' : ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            ${!isTemporary ? `
            <div class="form-group">
                <label>物品:</label>
                <div id="items-container" style="max-height: 200px; overflow-y: auto;">
                    ${character.items && character.items.length > 0 ? character.items.map(item => `
                        <div class="item-item" style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
                            <label for="item-name-${item.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">物品名称:</label>
                            <input type="text" id="item-name-${item.id}" value="${item.name}" style="width: 100%; margin-bottom: var(--spacing-xs);" />
                            <label for="item-type-${item.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">类型:</label>
                            <input type="text" id="item-type-${item.id}" value="${item.type || '未知'}" style="width: 100%; margin-bottom: var(--spacing-xs);" />
                            <label for="item-description-${item.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">描述:</label>
                            <textarea id="item-description-${item.id}" style="width: 100%; min-height: 60px; margin-bottom: var(--spacing-xs);">${item.description || ''}</textarea>
                        </div>
                    `).join('') : '<p>暂无物品</p>'}
                </div>
                <button id="add-item" style="margin-top: var(--spacing-sm); background-color: var(--accent-color); color: white;">添加物品</button>
            </div>
            
            <div class="form-group">
                <label>事件:</label>
                <div id="events-container" style="max-height: 200px; overflow-y: auto;">
                    ${character.events ? `
                        ${character.events.pending && character.events.pending.length > 0 ? `
                        <div style="margin-bottom: var(--spacing-sm);">
                            <div style="font-weight: 500; margin-bottom: var(--spacing-xs);">待处理事件:</div>
                            ${character.events.pending.map(event => `
                                <div class="event-item" style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
                                    <label for="event-content-${event.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">内容:</label>
                                    <input type="text" id="event-content-${event.id}" value="${event.content}" style="width: 100%; margin-bottom: var(--spacing-xs);" />
                                    <label for="event-date-${event.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">日期:</label>
                                    <input type="date" id="event-date-${event.id}" value="${event.date}" style="width: 100%; margin-bottom: var(--spacing-xs);" />
                                    <label for="event-priority-${event.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">优先级:</label>
                                    <select id="event-priority-${event.id}" style="width: 100%; margin-bottom: var(--spacing-xs);">
                                        <option value="高" ${event.priority === '高' ? 'selected' : ''}>高</option>
                                        <option value="中" ${event.priority === '中' ? 'selected' : ''}>中</option>
                                        <option value="低" ${event.priority === '低' ? 'selected' : ''}>低</option>
                                    </select>
                                    <button class="complete-event" data-event-id="${event.id}" style="background-color: #10b981; color: white; margin-right: var(--spacing-xs);">标记为完成</button>
                                    <button class="remove-event" data-event-id="${event.id}" style="background-color: #ef4444; color: white;">删除</button>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        ${character.events.completed && character.events.completed.length > 0 ? `
                        <div>
                            <div style="font-weight: 500; margin-bottom: var(--spacing-xs);">已完成事件:</div>
                            ${character.events.completed.map(event => `
                                <div class="event-item completed" style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); opacity: 0.7;">
                                    <label for="event-content-${event.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">内容:</label>
                                    <input type="text" id="event-content-${event.id}" value="${event.content}" style="width: 100%; margin-bottom: var(--spacing-xs);" />
                                    <label for="event-date-${event.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">日期:</label>
                                    <input type="date" id="event-date-${event.id}" value="${event.date}" style="width: 100%; margin-bottom: var(--spacing-xs);" />
                                    <label for="event-priority-${event.id}" style="display: block; font-weight: 500; margin-bottom: var(--spacing-xs);">优先级:</label>
                                    <select id="event-priority-${event.id}" style="width: 100%; margin-bottom: var(--spacing-xs);">
                                        <option value="高" ${event.priority === '高' ? 'selected' : ''}>高</option>
                                        <option value="中" ${event.priority === '中' ? 'selected' : ''}>中</option>
                                        <option value="低" ${event.priority === '低' ? 'selected' : ''}>低</option>
                                    </select>
                                    <button class="remove-event" data-event-id="${event.id}" style="background-color: #ef4444; color: white;">删除</button>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    ` : '<p>暂无事件</p>'}
                </div>
                <button id="add-event" style="margin-top: var(--spacing-sm); background-color: var(--accent-color); color: white;">添加事件</button>
            </div>
            ` : ''}
            <button id="save-character-info" style="background-color: var(--secondary-color); color: white;">保存角色信息</button>
        `;
        
        // 绑定保存按钮事件
        document.getElementById('save-character-info').addEventListener('click', () => this.saveCharacterInfo());
        
        // 绑定添加物品按钮事件
        const addItemButton = document.getElementById('add-item');
        if (addItemButton) {
            addItemButton.addEventListener('click', () => this.addItem());
        }
        
        // 绑定添加事件按钮事件
        const addEventButton = document.getElementById('add-event');
        if (addEventButton) {
            addEventButton.addEventListener('click', () => this.addEvent());
        }
        
        // 绑定标记完成按钮事件
        document.querySelectorAll('.complete-event').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.currentTarget.dataset.eventId;
                this.completeEvent(eventId);
            });
        });
        
        // 绑定删除事件按钮事件
        document.querySelectorAll('.remove-event').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.currentTarget.dataset.eventId;
                this.removeEvent(eventId);
            });
        });
    }

    saveCharacterInfo() {
        if (!this.selectedCharacter) return;

        const name = document.getElementById('character-name').value;
        const personality = document.getElementById('character-personality').value;
        const background = document.getElementById('character-background').value;
        const tags = document.getElementById('character-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);

        const description = document.getElementById('character-description').value;
        const relationshipsText = document.getElementById('character-relationships').value;
        let relationships = [];
        try {
            if (relationshipsText && relationshipsText !== '无') {
                relationships = JSON.parse(relationshipsText);
            }
        } catch (e) {
            console.error('解析关系数据失败:', e);
        }
        const notes = document.getElementById('character-notes').value;

        // 更新角色信息
        this.selectedCharacter.name = name;
        this.selectedCharacter.dynamicProfile = {
            ...this.selectedCharacter.dynamicProfile,
            description,
            personality,
            background,
            relationships,
            notes,
            tags
        };

        // 更新属性数值
        if (this.selectedCharacter.stats) {
            this.selectedCharacter.stats.forEach(stat => {
                const input = document.getElementById(`stat-${stat.id}`);
                if (input) {
                    stat.value = parseInt(input.value) || 0;
                }
            });
        }

        // 更新物品
        if (this.selectedCharacter.items) {
            this.selectedCharacter.items.forEach(item => {
                const nameInput = document.getElementById(`item-name-${item.id}`);
                const typeInput = document.getElementById(`item-type-${item.id}`);
                const descriptionInput = document.getElementById(`item-description-${item.id}`);
                
                if (nameInput) item.name = nameInput.value;
                if (typeInput) item.type = typeInput.value || '未知';
                if (descriptionInput) item.description = descriptionInput.value;
            });
        }

        // 更新事件
        if (this.selectedCharacter.events) {
            // 更新待处理事件
            if (this.selectedCharacter.events.pending) {
                this.selectedCharacter.events.pending.forEach(event => {
                    const contentInput = document.getElementById(`event-content-${event.id}`);
                    const dateInput = document.getElementById(`event-date-${event.id}`);
                    const priorityInput = document.getElementById(`event-priority-${event.id}`);
                    
                    if (contentInput) event.content = contentInput.value;
                    if (dateInput) event.date = dateInput.value;
                    if (priorityInput) event.priority = priorityInput.value;
                });
            }
            
            // 更新已完成事件
            if (this.selectedCharacter.events.completed) {
                this.selectedCharacter.events.completed.forEach(event => {
                    const contentInput = document.getElementById(`event-content-${event.id}`);
                    const dateInput = document.getElementById(`event-date-${event.id}`);
                    const priorityInput = document.getElementById(`event-priority-${event.id}`);
                    
                    if (contentInput) event.content = contentInput.value;
                    if (dateInput) event.date = dateInput.value;
                    if (priorityInput) event.priority = priorityInput.value;
                });
            }
        }

        // 保存到存储
        storage.saveCharacter(this.selectedCharacter);
        
        // 重新加载角色列表和更新面板
        this.loadCharacters();
        this.updateCharacterInfoPanel();
        
        // 显示保存成功消息
        this.showMessage('角色信息保存成功');
    }

    addItem() {
        if (!this.selectedCharacter) return;
        
        // 生成唯一ID
        const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // 创建新物品
        const newItem = {
            id: itemId,
            name: '新物品',
            type: '未知',
            description: '',
            collectedDate: new Date().toISOString().split('T')[0]
        };
        
        // 确保items数组存在
        if (!this.selectedCharacter.items) {
            this.selectedCharacter.items = [];
        }
        
        // 添加新物品
        this.selectedCharacter.items.push(newItem);
        
        // 保存并更新面板
        storage.saveCharacter(this.selectedCharacter);
        this.updateCharacterInfoPanel();
        this.showMessage('物品已添加');
    }

    addEvent() {
        if (!this.selectedCharacter) return;
        
        // 生成唯一ID
        const eventId = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // 创建新事件
        const newEvent = {
            id: eventId,
            content: '新事件',
            date: new Date().toISOString().split('T')[0],
            priority: '中'
        };
        
        // 确保events对象存在
        if (!this.selectedCharacter.events) {
            this.selectedCharacter.events = {
                pending: [],
                completed: []
            };
        }
        
        // 确保pending数组存在
        if (!this.selectedCharacter.events.pending) {
            this.selectedCharacter.events.pending = [];
        }
        
        // 添加新事件到待处理列表
        this.selectedCharacter.events.pending.push(newEvent);
        
        // 保存并更新面板
        storage.saveCharacter(this.selectedCharacter);
        this.updateCharacterInfoPanel();
        this.showMessage('事件已添加');
    }

    completeEvent(eventId) {
        if (!this.selectedCharacter || !this.selectedCharacter.events) return;
        
        // 查找并移除待处理事件
        const pendingIndex = this.selectedCharacter.events.pending?.findIndex(e => e.id === eventId);
        if (pendingIndex !== undefined && pendingIndex >= 0) {
            const event = this.selectedCharacter.events.pending.splice(pendingIndex, 1)[0];
            
            // 确保completed数组存在
            if (!this.selectedCharacter.events.completed) {
                this.selectedCharacter.events.completed = [];
            }
            
            // 添加到已完成列表
            this.selectedCharacter.events.completed.push(event);
            
            // 保存并更新面板
            storage.saveCharacter(this.selectedCharacter);
            this.updateCharacterInfoPanel();
            this.showMessage('事件已标记为完成');
        }
    }

    removeEvent(eventId) {
        if (!this.selectedCharacter || !this.selectedCharacter.events) return;
        
        // 从待处理列表中移除
        if (this.selectedCharacter.events.pending) {
            const pendingIndex = this.selectedCharacter.events.pending.findIndex(e => e.id === eventId);
            if (pendingIndex >= 0) {
                this.selectedCharacter.events.pending.splice(pendingIndex, 1);
                storage.saveCharacter(this.selectedCharacter);
                this.updateCharacterInfoPanel();
                this.showMessage('事件已删除');
                return;
            }
        }
        
        // 从已完成列表中移除
        if (this.selectedCharacter.events.completed) {
            const completedIndex = this.selectedCharacter.events.completed.findIndex(e => e.id === eventId);
            if (completedIndex >= 0) {
                this.selectedCharacter.events.completed.splice(completedIndex, 1);
                storage.saveCharacter(this.selectedCharacter);
                this.updateCharacterInfoPanel();
                this.showMessage('事件已删除');
                return;
            }
        }
    }

    selectAssistant(assistant) {
        this.selectedAssistant = assistant;
        document.getElementById('selected-assistant').textContent = assistant.name;
        
        // 显示小助手面板，隐藏角色信息面板
        document.getElementById('assistant-profile-panel').style.display = 'block';
        document.getElementById('assistant-settings-panel').style.display = 'block';
        document.getElementById('character-info-panel').style.display = 'none';
        
        this.updateAssistantPanels();
    }

    // 静态方法：获取所有小助手
    static getAssistants(worldId) {
        const storedAssistants = localStorage.getItem(`assistants_${worldId}`);
        
        // 默认小助手
        const defaultAssistants = [
            {
                id: 'profile-assistant',
                name: '人设小助手',
                description: '管理角色的性格、背景、标签、物品、事件和数值',
                profile: {
                    personality: '细心、专注、善于分析、有条理、组织性强',
                    background: '我是专门负责管理角色档案的小助手，帮助你打造生动的角色形象，管理角色的物品、事件和属性数值。',
                    tags: ['人设管理', '角色塑造', '性格分析', '物品管理', '事件管理', '数值管理']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false
                }
            },
            {
                id: 'time-assistant',
                name: '时间小助手',
                description: '管理游戏世界的时间流逝和时间相关事件',
                profile: {
                    personality: '精准、有耐心、善于感知时间变化',
                    background: '我是专门负责管理时间的小助手，帮助你控制游戏世界的时间流逝，并根据故事内容智能调整时间。',
                    tags: ['时间管理', '时间控制', '时间感知']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false
                }
            },
            {
                id: 'erotic-assistant',
                name: '色色小助手',
                description: '管理角色的色情内容和CG触发',
                profile: {
                    personality: '性感、挑逗、善于营造氛围',
                    background: '我是专门负责管理角色色情内容的小助手，帮助你创建和触发各种性爱场景。',
                    tags: ['色情内容', 'CG触发', '性爱场景']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false,
                    keywords: [
                        {
                            id: 'keyword-1',
                            word: '尿尿',
                            cg: {
                                玩法: '尿液浇灌',
                                触发词: '尿',
                                描述: '用尿液浇灌对方的阴蒂和肛门'
                            }
                        }
                    ],
                    stats: [
                        {
                            id: 'stat-1',
                            name: '性欲值',
                            threshold: 75,
                           玩法库: [
                                '重度性爱场景',
                                'SM玩法',
                                '多人性爱'
                            ]
                        },
                        {
                            id: 'stat-2',
                            name: '堕落值',
                            threshold: 75,
                           玩法库: [
                                '屈辱玩法',
                                '强制性爱',
                                '公共场合性爱'
                            ]
                        }
                    ]
                }
            },
            {
                id: 'character-generator-assistant',
                name: '人物小助手',
                description: '根据描述快速生成临时角色',
                profile: {
                    personality: '创意、高效、善于总结',
                    background: '我是专门负责生成临时角色的小助手，根据你输入的描述快速创建角色卡。',
                    tags: ['角色生成', '临时角色', '快速创建']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false
                }
            },
            {
                id: 'story-assistant',
                name: '故事小助手',
                description: '管理故事的剧情和发展',
                profile: {
                    personality: '创意、想象力丰富、善于构建剧情',
                    background: '我是专门负责管理故事的小助手，帮助你构建和发展故事情节。',
                    tags: ['故事管理', '剧情构建', '创意生成']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false,
                    storyTypes: ['奇幻', '科幻', '现实', '悬疑', '爱情'],
                    genres: ['冒险', '喜剧', ' drama', '恐怖', '浪漫']
                }
            },
            {
                id: 'summary-assistant',
                name: '总结小助手',
                description: '管理故事总结和存档',
                profile: {
                    personality: '理性、善于分析、总结能力强',
                    background: '我是专门负责管理故事总结的小助手，帮助你总结故事内容并保存到故事档案。',
                    tags: ['故事总结', '剧情分析', '档案管理']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false,
                    summarySettings: {
                        enabled: true,
                        style: '简洁',
                        format: '段落',
                        wordCount: 200,
                        includeCharacters: true,
                        includePlot: true,
                        includeThemes: false
                    }
                }
            },
            {
                id: 'scene-assistant',
                name: '场景小助手',
                description: '管理故事场景的描述和氛围',
                profile: {
                    personality: '细腻、善于描绘、注重细节',
                    background: '我是专门负责管理故事场景的小助手，帮助你创建生动的场景描述和氛围。',
                    tags: ['场景描述', '氛围营造', '细节描写']
                },
                settings: {
                    enabled: true,
                    autoUpdate: false,
                    sceneTypes: ['室内', '室外', '自然', '城市', '奇幻'],
                    atmospheres: ['紧张', '温馨', '神秘', '浪漫', '恐怖']
                }
            }
        ];
        
        if (storedAssistants) {
            try {
                const stored = JSON.parse(storedAssistants);
                // 确保所有默认小助手都存在，合并存储的数据和默认数据
                const mergedAssistants = defaultAssistants.map(defaultAssistant => {
                    const storedAssistant = stored.find(a => a.id === defaultAssistant.id);
                    return storedAssistant ? {
                        ...defaultAssistant,
                        ...storedAssistant,
                        profile: {
                            ...defaultAssistant.profile,
                            ...(storedAssistant.profile || {})
                        },
                        settings: {
                            ...defaultAssistant.settings,
                            ...(storedAssistant.settings || {})
                        }
                    } : defaultAssistant;
                });
                return mergedAssistants;
            } catch (e) {
                console.error('解析小助手数据失败，使用默认数据:', e);
                return defaultAssistants;
            }
        }
        
        return defaultAssistants;
    }

    loadAssistants() {
        // 使用静态方法获取小助手列表
        this.assistants = AssistantsModule.getAssistants(this.currentWorldId);

        this.renderAssistantsList();
    }



    saveAssistantsToStorage() {
        localStorage.setItem(`assistants_${this.currentWorldId}`, JSON.stringify(this.assistants));
    }

    renderAssistantsList() {
        const assistantsList = document.getElementById('assistants-list');
        console.log('渲染小助手列表，assistantsList:', assistantsList);
        if (!assistantsList) return;

        assistantsList.innerHTML = '';
        console.log('小助手列表数据:', this.assistants);

        this.assistants.forEach(assistant => {
            const assistantItem = document.createElement('div');
            assistantItem.style.padding = 'var(--spacing-sm)';
            assistantItem.style.borderBottom = '1px solid var(--border-color)';
            assistantItem.style.cursor = 'pointer';
            assistantItem.style.transition = 'background-color var(--transition-fast)';
            assistantItem.innerHTML = `
                <p style="font-weight: 600;">${assistant.name}</p>
                <p style="font-size: 0.875rem; opacity: 0.7;">${assistant.description}</p>
                <p style="font-size: 0.75rem; opacity: 0.5;">${assistant.settings.enabled ? '已启用' : '已禁用'}</p>
                <div style="display: flex; gap: var(--spacing-xs); margin-top: var(--spacing-xs);">
                    <button class="export-assistant" data-assistant-id="${assistant.id}" style="font-size: 0.75rem; padding: 2px 6px; background-color: #3b82f6; color: white; border: none; border-radius: 4px;">导出</button>
                </div>
            `;
            
            assistantItem.addEventListener('mouseenter', () => {
                assistantItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            });
            
            assistantItem.addEventListener('mouseleave', () => {
                assistantItem.style.backgroundColor = 'transparent';
            });
            
            assistantItem.addEventListener('click', (e) => {
                console.log('点击小助手项:', assistant.name, '目标元素:', e.target);
                // 如果点击的是导出按钮，不触发选择操作
                let isExportButton = false;
                let target = e.target;
                while (target) {
                    if (target.className && target.className.indexOf('export-assistant') !== -1) {
                        isExportButton = true;
                        break;
                    }
                    target = target.parentElement;
                }
                if (!isExportButton) {
                    console.log('调用selectAssistant方法:', assistant.name);
                    this.selectAssistant(assistant);
                }
            });
            
            // 绑定导出按钮事件
            const exportBtn = assistantItem.querySelector('.export-assistant');
            if (exportBtn) {
                exportBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.exportAssistant(assistant.id);
                });
            }
            
            assistantsList.appendChild(assistantItem);
        });
    }



    updateAssistantPanels() {
        if (!this.selectedAssistant) return;

        // 更新小助手人设面板
        this.updateAssistantProfilePanel();
        // 更新小助手设置面板
        this.updateAssistantSettingsPanel();
    }

    updateAssistantProfilePanel() {
        const profilePanel = document.getElementById('assistant-profile-panel');
        if (!profilePanel || !this.selectedAssistant) return;

        const profile = this.selectedAssistant.profile || {};
        profilePanel.innerHTML = `
            <h3>小助手人设管理</h3>
            <div class="form-group">
                <label for="assistant-name">小助手名称:</label>
                <input type="text" id="assistant-name" value="${this.selectedAssistant.name}" />
            </div>
            <div class="form-group">
                <label for="assistant-personality">小助手性格:</label>
                <input type="text" id="assistant-personality" value="${profile.personality || ''}" />
            </div>
            <div class="form-group">
                <label for="assistant-background">小助手背景:</label>
                <textarea id="assistant-background">${profile.background || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="assistant-tags">小助手标签:</label>
                <input type="text" id="assistant-tags" value="${profile.tags ? profile.tags.join(', ') : ''}" />
            </div>
            <button id="save-assistant-profile">保存小助手人设</button>
        `;

        // 绑定保存按钮事件
        document.getElementById('save-assistant-profile').addEventListener('click', () => this.saveAssistantProfile());
    }

    updateAssistantSettingsPanel() {
        const settingsPanel = document.getElementById('assistant-settings-panel');
        if (!settingsPanel || !this.selectedAssistant) return;

        const assistantInstance = this.assistantsInstances[this.selectedAssistant.id];
        if (!assistantInstance) {
            // 默认设置面板
            this.renderDefaultSettingsPanel(settingsPanel, this.selectedAssistant.settings || {});
            return;
        }

        // 生成 HTML
        const settings = this.selectedAssistant.settings || {};
        settingsPanel.innerHTML = assistantInstance.generateSettingsHTML(settings);
        
        // 绑定事件
        assistantInstance.bindSettingsEvents();
        assistantInstance.bindSaveButton(() => this.saveAssistantSettings());
    }
    
    // 渲染默认设置面板
    renderDefaultSettingsPanel(settingsPanel, settings) {
        settingsPanel.innerHTML = `
            <h3>小助手设置</h3>
            <div class="form-group">
                <label for="assistant-enabled" style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <input type="checkbox" id="assistant-enabled" ${settings.enabled ? 'checked' : ''} />
                    启用小助手
                </label>
            </div>
            <div class="form-group">
                <label for="assistant-auto-update" style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <input type="checkbox" id="assistant-auto-update" ${settings.autoUpdate ? 'checked' : ''} />
                    自动更新
                </label>
            </div>
            <div class="form-group">
                <label for="assistant-description">小助手描述:</label>
                <input type="text" id="assistant-description" value="${settings.description || ''}" />
            </div>
            <button id="save-assistant-settings">保存小助手设置</button>
        `;
        
        // 绑定保存按钮事件
        document.getElementById('save-assistant-settings').addEventListener('click', () => this.saveAssistantSettings());
    }

    // 故事小助手方法
    buildStoryPrompt(assistant, context, choice) {
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
        
        // 获取故事总结设置
        const summarySettings = assistant?.settings?.summarySettings || {
            enabled: false,
            style: '简洁',
            format: '段落',
            wordCount: 200,
            includeCharacters: true,
            includePlot: true,
            includeThemes: false
        };
        
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
        
        if (summarySettings.enabled) {
            prompt += `7. 提供一个${summarySettings.style}的剧情总结，`;
            prompt += `字数控制在${summarySettings.wordCount}字左右，`;
            prompt += `使用${summarySettings.format}格式，`;
            
            const includeContent = [];
            if (summarySettings.includeCharacters) includeContent.push('角色');
            if (summarySettings.includePlot) includeContent.push('情节');
            if (summarySettings.includeThemes) includeContent.push('主题');
            
            if (includeContent.length > 0) {
                prompt += `包含${includeContent.join('、')}等内容`;
            }
            prompt += `
`;
        }
        
        prompt += `
请按照以下格式输出:
`;
        prompt += `【故事内容】【故事时间：】
故事正文，像小说一样成段输出，包含场景描述和角色对话

`;
        
        if (summarySettings.enabled) {
            prompt += `【剧情总结】
${summarySettings.style}的剧情总结

`;
        }
        
        prompt += `【选项】
1. 选项1
2. 选项2
3. 选项3
4. 选项4`;
        
        return prompt;
    }

    async generateStoryScene(assistant, context, choice) {
        try {
            // 检查API密钥是否配置
            if (!window.api || !window.api.config || !window.api.config.apiKey) {
                console.error('API密钥未配置');
                return {
                    scene: "请先配置API密钥才能生成故事内容",
                    dialogs: [],
                    choices: ["去配置API密钥"],
                    summary: "API密钥未配置"
                };
            }
            
            const prompt = this.buildStoryPrompt(assistant, context, choice);
            const response = await window.api.callAPI('user', prompt);
            
            // 获取故事总结设置
            const summarySettings = assistant?.settings?.summarySettings || {
                enabled: true
            };
            
            // 处理响应内容，提取故事正文和选项
            let storyContent = response;
            let choices = [];
            let summary = "故事正在进行中";
            
            // 尝试提取【故事内容】【故事时间：】部分
            if (summarySettings.enabled) {
                const storyMatch = storyContent.match(/【故事内容】【故事时间：】\s*([\s\S]*?)\s*【剧情总结】/);
                if (storyMatch && storyMatch[1]) {
                    storyContent = storyMatch[1].trim();
                } else {
                    // 如果没有找到【剧情总结】标记，尝试找到【选项】标记并提取之前的内容
                    const optionsMatch = storyContent.match(/\s*【选项】/);
                    if (optionsMatch) {
                        storyContent = storyContent.substring(0, optionsMatch.index).trim();
                    }
                }
                
                // 尝试提取【剧情总结】部分
                const summaryMatch = response.match(/【剧情总结】\s*([\s\S]*?)\s*【选项】/);
                if (summaryMatch && summaryMatch[1]) {
                    summary = summaryMatch[1].trim();
                }
            } else {
                // 如果故事总结被禁用，直接提取【故事内容】【故事时间：】到【选项】之间的部分
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
                summary = "";
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
            
            // 返回处理后的结果
            return {
                scene: storyContent,
                dialogs: [], // 不再使用对话框格式
                choices: choices,
                summary: summary
            };
        } catch (error) {
            console.error('生成故事场景失败:', error);
            // 根据错误类型返回不同的默认结构
            if (error.message === 'API密钥未配置') {
                return {
                    scene: "请先配置API密钥才能生成故事内容",
                    dialogs: [],
                    choices: ["去配置API密钥"],
                    summary: "API密钥未配置"
                };
            }
            return {
                scene: "生成故事内容时出错，请重试",
                dialogs: [],
                choices: ["重试", "返回上一步", "重新开始", "查看帮助"],
                summary: "生成失败"
            };
        }
    }

    // 渲染关键词列表
    renderKeywordsList() {
        if (!this.selectedAssistant || this.selectedAssistant.id !== 'erotic-assistant') return '';
        
        const settings = this.selectedAssistant.settings || {};
        const keywords = settings.keywords || [];
        
        return keywords.map(keyword => `
            <div style="padding: var(--spacing-md); border: 1px solid #f9a8d4; border-radius: var(--border-radius-md); margin-bottom: var(--spacing-sm); background-color: #fdf2f8;">
                <div style="font-weight: 600; color: #be185d;">${keyword.word}</div>
                <div style="font-size: 0.875rem; margin-top: var(--spacing-xs);">玩法: ${keyword.cg.玩法}</div>
                <div style="font-size: 0.875rem; margin-top: var(--spacing-xs);">触发词: ${keyword.cg.触发词}</div>
                <div style="font-size: 0.875rem; margin-top: var(--spacing-xs);">描述: ${keyword.cg.描述}</div>
                <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                    <button onclick="assistantsModule.editKeyword('${keyword.id}')" style="background-color: #ec4899; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 0.75rem;">编辑</button>
                    <button onclick="assistantsModule.deleteKeyword('${keyword.id}')" style="background-color: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 0.75rem;">删除</button>
                </div>
            </div>
        `).join('');
    }

    // 渲染数值配置列表
    renderStatsList() {
        if (!this.selectedAssistant || this.selectedAssistant.id !== 'erotic-assistant') return '';
        
        const settings = this.selectedAssistant.settings || {};
        const stats = settings.stats || [];
        
        return stats.map(stat => `
            <div style="padding: var(--spacing-md); border: 1px solid #f9a8d4; border-radius: var(--border-radius-md); margin-bottom: var(--spacing-sm); background-color: #fdf2f8;">
                <div style="font-weight: 600; color: #be185d;">${stat.name}</div>
                <div style="font-size: 0.875rem; margin-top: var(--spacing-xs);">阈值: ${stat.threshold}</div>
                <div style="font-size: 0.875rem; margin-top: var(--spacing-xs);">玩法库: ${stat.玩法库.join('、')}</div>
                <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                    <button onclick="assistantsModule.editStat('${stat.id}')" style="background-color: #ec4899; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 0.75rem;">编辑</button>
                    <button onclick="assistantsModule.deleteStat('${stat.id}')" style="background-color: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 0.75rem;">删除</button>
                </div>
            </div>
        `).join('');
    }

    // 打开关键词编辑模态框
    openKeywordEditModal(keywordId = null) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'keyword-edit-modal';
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.zIndex = '1001';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // 查找关键词
        let keyword = null;
        if (keywordId) {
            const settings = this.selectedAssistant.settings || {};
            const keywords = settings.keywords || [];
            keyword = keywords.find(k => k.id === keywordId);
        }
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #FEF2F2, #FEF7FF); padding: var(--spacing-xl); border-radius: var(--border-radius-lg); box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4); max-width: 400px; width: 100%; animation: fadeIn 0.5s ease;">
                <h3 style="color: #be185d;">编辑关键词</h3>
                <div class="form-group">
                    <label for="keyword-word" style="color: #be185d;">关键词</label>
                    <input type="text" id="keyword-word" placeholder="输入关键词..." value="${keyword ? keyword.word : ''}">
                </div>
                <div class="form-group">
                    <label for="keyword-play" style="color: #be185d;">玩法</label>
                    <input type="text" id="keyword-play" placeholder="输入玩法..." value="${keyword ? keyword.cg.玩法 : ''}">
                </div>
                <div class="form-group">
                    <label for="keyword-trigger" style="color: #be185d;">触发词</label>
                    <input type="text" id="keyword-trigger" placeholder="输入触发词..." value="${keyword ? keyword.cg.触发词 : ''}">
                </div>
                <div class="form-group">
                    <label for="keyword-description" style="color: #be185d;">描述</label>
                    <textarea id="keyword-description" placeholder="输入描述..." style="min-height: 80px;">${keyword ? keyword.cg.描述 : ''}</textarea>
                </div>
                <input type="hidden" id="keyword-id" value="${keywordId || ''}">
                <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-lg);">
                    <button id="close-keyword-modal" class="btn-outline">取消</button>
                    <button id="save-keyword" style="background-color: #ec4899; color: white;">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        document.getElementById('close-keyword-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('save-keyword').addEventListener('click', () => {
            this.saveKeyword();
            modal.remove();
            // 重新渲染设置面板
            this.updateAssistantSettingsPanel();
        });
    }

    // 保存关键词
    saveKeyword() {
        const keywordId = document.getElementById('keyword-id').value;
        const word = document.getElementById('keyword-word').value.trim();
        const play = document.getElementById('keyword-play').value.trim();
        const trigger = document.getElementById('keyword-trigger').value.trim();
        const description = document.getElementById('keyword-description').value.trim();
        
        if (!word || !play || !trigger || !description) {
            alert('请填写所有字段');
            return;
        }
        
        const cg = {
            玩法: play,
            触发词: trigger,
            描述: description
        };
        
        if (!this.selectedAssistant.settings) {
            this.selectedAssistant.settings = {};
        }
        
        if (!this.selectedAssistant.settings.keywords) {
            this.selectedAssistant.settings.keywords = [];
        }
        
        if (keywordId) {
            // 更新现有关键词
            const index = this.selectedAssistant.settings.keywords.findIndex(k => k.id === keywordId);
            if (index >= 0) {
                this.selectedAssistant.settings.keywords[index] = {
                    ...this.selectedAssistant.settings.keywords[index],
                    word,
                    cg
                };
            }
        } else {
            // 添加新关键词
            const newKeyword = {
                id: `keyword-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                word: word,
                cg: cg
            };
            this.selectedAssistant.settings.keywords.push(newKeyword);
        }
        
        this.saveAssistantsToStorage();
        this.showMessage('关键词保存成功');
    }

    // 编辑关键词
    editKeyword(keywordId) {
        this.openKeywordEditModal(keywordId);
    }

    // 删除关键词
    deleteKeyword(keywordId) {
        if (confirm('确定要删除这个关键词吗？')) {
            if (this.selectedAssistant.settings && this.selectedAssistant.settings.keywords) {
                const index = this.selectedAssistant.settings.keywords.findIndex(k => k.id === keywordId);
                if (index >= 0) {
                    this.selectedAssistant.settings.keywords.splice(index, 1);
                    this.saveAssistantsToStorage();
                    this.updateAssistantSettingsPanel();
                    this.showMessage('关键词删除成功');
                }
            }
        }
    }

    // 打开数值编辑模态框
    openStatEditModal(statId = null) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'stat-edit-modal';
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.zIndex = '1001';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // 查找数值配置
        let stat = null;
        if (statId) {
            const settings = this.selectedAssistant.settings || {};
            const stats = settings.stats || [];
            stat = stats.find(s => s.id === statId);
        }
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #FEF2F2, #FEF7FF); padding: var(--spacing-xl); border-radius: var(--border-radius-lg); box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4); max-width: 400px; width: 100%; animation: fadeIn 0.5s ease;">
                <h3 style="color: #be185d;">编辑数值配置</h3>
                <div class="form-group">
                    <label for="stat-name" style="color: #be185d;">数值名称</label>
                    <input type="text" id="stat-name" placeholder="输入数值名称..." value="${stat ? stat.name : ''}">
                </div>
                <div class="form-group">
                    <label for="stat-threshold" style="color: #be185d;">阈值</label>
                    <input type="number" id="stat-threshold" placeholder="输入阈值..." min="0" max="100" value="${stat ? stat.threshold : ''}">
                </div>
                <div class="form-group">
                    <label for="stat-plays" style="color: #be185d;">玩法库（每行一个）</label>
                    <textarea id="stat-plays" placeholder="输入玩法，每行一个..." style="min-height: 120px;">${stat ? stat.玩法库.join('\n') : ''}</textarea>
                </div>
                <input type="hidden" id="stat-id" value="${statId || ''}">
                <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-lg);">
                    <button id="close-stat-modal" class="btn-outline">取消</button>
                    <button id="save-stat" style="background-color: #ec4899; color: white;">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        document.getElementById('close-stat-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('save-stat').addEventListener('click', () => {
            this.saveStat();
            modal.remove();
            // 重新渲染设置面板
            this.updateAssistantSettingsPanel();
        });
    }

    // 生成临时角色
    async generateTemporaryCharacter() {
        const description = document.getElementById('character-description').value.trim();
        if (!description) {
            this.showMessage('请输入角色描述');
            return;
        }

        if (typeof storage === 'undefined') {
            this.showMessage('存储服务不可用');
            return;
        }

        try {
            // 显示加载状态
            this.showMessage('正在生成角色，请稍候...');

            // 调用API生成角色
            const characterData = await this.generateCharacterFromAPI(description);

            // 生成临时角色（使用简化模板）
            const character = {
                id: `character_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                name: characterData.name,
                isMain: false,
                isTemporary: true,
                fixedProfile: {
                    description: characterData.description,
                    personality: characterData.personality,
                    background: '临时角色',
                    relationships: [],
                    sceneExamples: '',
                    notes: '自动生成的临时角色',
                    tags: characterData.tags
                },
                dynamicProfile: {
                    description: characterData.description,
                    personality: characterData.personality,
                    background: '临时角色',
                    relationships: [],
                    sceneExamples: '',
                    notes: '自动生成的临时角色',
                    tags: characterData.tags
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
            const saved = storage.saveCharacter(character);
            if (!saved) {
                this.showMessage('生成角色失败');
                return;
            }

            // 将角色添加到当前世界
            const world = storage.getWorldById(this.currentWorldId);
            if (world && !world.characters.includes(character.id)) {
                world.characters.push(character.id);
                storage.saveWorld(world);
            }

            this.showMessage('临时角色生成成功！');
            // 重新加载角色列表
            this.loadCharacters();
        } catch (error) {
            console.error('生成角色失败:', error);
            this.showMessage('生成角色失败，请稍后重试');
        }
    }

    // 调用API生成角色
    async generateCharacterFromAPI(description) {
        try {
            // 获取API配置，优先使用全局配置，然后是api文件配置
            let apiKey, model, temperature, maxTokens;
            
            // 获取全局配置
            const globalConfig = this.getGlobalConfig();
            
            console.log('全局API配置:', globalConfig);
            
            if (globalConfig.apiKey) {
                // 使用全局API配置
                console.log('使用全局API配置');
                apiKey = globalConfig.apiKey;
                model = globalConfig.model || 'deepseek-chat';
                temperature = globalConfig.temperature || 0.7;
                maxTokens = globalConfig.maxTokens || 1000;
            } else if (typeof api !== 'undefined' && api.config && api.config.apiKey) {
                // 使用api文件的配置
                console.log('使用api文件的配置');
                apiKey = api.config.apiKey;
                model = api.config.model || 'deepseek-chat';
                temperature = api.config.parameters ? api.config.parameters.temperature : 0.7;
                maxTokens = api.config.parameters ? api.config.parameters.max_tokens : 1000;
            } else {
                // 没有API配置
                console.error('API密钥未配置');
                this.showMessage('API密钥未配置，使用智能生成');
                return this.generateCharacterIntelligently(description);
            }

            // 获取人物小助手的人设信息
            const assistantProfile = this.selectedAssistant.profile || {};
            const assistantPersonality = assistantProfile.personality || '创意、高效、善于总结';
            const assistantBackground = assistantProfile.background || '我是专门负责生成临时角色的小助手，根据你输入的描述快速创建角色卡。';
            
            // 构建角色生成提示
            const prompt = `你是一个人设生成小助手，性格：${assistantPersonality}。${assistantBackground}

请根据以下描述生成一个完整的临时角色信息：

描述：${description}

请按照以下JSON格式输出角色信息：
{
  "name": "角色名称",
  "description": "详细的角色描述",
  "personality": "角色性格",
  "tags": ["标签1", "标签2", "标签3"]
}

要求：
1. 生成一个合适的角色名称
2. 扩展描述，使其更加详细生动
3. 生成一个符合角色特点的性格
4. 生成2-3个相关的标签
5. 确保JSON格式正确`;

            // 调用API
            console.log('开始调用API生成角色');
            this.showMessage('正在调用API生成角色，请稍候...');
            
            // 直接使用fetch调用API
            const endpoint = 'https://api.deepseek.com/v1/chat/completions';
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            const body = {
                model: model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: temperature,
                max_tokens: maxTokens,
                frequency_penalty: 0,
                presence_penalty: 0
            };
            
            console.log('直接调用API:', {
                endpoint: endpoint,
                headers: {
                    'Content-Type': headers['Content-Type'],
                    'Authorization': 'Bearer ********'
                },
                body: {
                    model: body.model,
                    messages: body.messages,
                    temperature: body.temperature,
                    max_tokens: body.max_tokens
                }
            });
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            console.log('API响应状态:', response.status, response.statusText);
            
            // 读取完整响应内容
            const responseText = await response.text();
            console.log('API响应内容:', responseText);

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}\n响应内容: ${responseText}`);
            }

            const data = JSON.parse(responseText);
            
            console.log('API响应解析结果:', data);
            
            // 检查响应数据结构
            if (!data || !data.choices || data.choices.length === 0) {
                throw new Error('API响应格式错误，缺少choices字段');
            }
            
            if (!data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('API响应格式错误，缺少message.content字段');
            }
            
            const apiResponse = data.choices[0].message.content;
            console.log('API响应内容:', apiResponse);
            
            // 移除Markdown代码块标记
            const cleanResponse = apiResponse.replace(/^```json\n|```$/g, '').trim();
            console.log('清理后的响应内容:', cleanResponse);
            
            // 解析API响应
            try {
                const characterData = JSON.parse(cleanResponse);
                console.log('解析后的角色数据:', characterData);
                this.showMessage('API生成角色成功！');
                return characterData;
            } catch (parseError) {
                console.error('解析API响应失败:', parseError);
                this.showMessage('解析API响应失败，使用智能生成');
                // 解析失败时，使用智能生成作为后备
                return this.generateCharacterIntelligently(description);
            }
        } catch (error) {
            console.error('API调用失败:', error);
            this.showMessage(`API调用失败: ${error.message}，使用智能生成`);
            // API调用失败时，使用智能生成作为后备
            return this.generateCharacterIntelligently(description);
        }
    }

    // 智能生成角色信息
    generateCharacterIntelligently(description) {
        // 智能分析描述，生成完整的角色信息
        // 这里使用模拟的智能分析逻辑，实际项目中会由API处理
        
        // 智能生成角色名称
        const name = this.generateIntelligentName(description);
        
        // 智能生成角色描述
        const generatedDescription = this.generateIntelligentDescription(description);
        
        // 智能生成角色性格
        const personality = this.generateIntelligentPersonality(description);
        
        // 智能生成角色标签
        const tags = this.generateIntelligentTags(description);
        
        return {
            name: name,
            description: generatedDescription,
            personality: personality,
            background: '临时角色背景',
            relationships: [],
            sceneExamples: '',
            tags: tags,
            stats: [],
            items: []
        };
    }

    // 智能生成角色名称
    generateIntelligentName(description) {
        // 模拟智能名称生成
        const names = [
            '神秘人', '陌生人', '过客', '旅人', '访客', '临时角色',
            '游侠', '剑客', '商人', '学者', '医师', '工匠',
            '武者', '智者', '行者', '隐士', '猎人', '渔夫',
            '铁匠', '厨师', '裁缝', '药师', '书童', '仆人',
            '冒险家', '探索者', '守护者', '旅行者', '学者', '艺术家'
        ];
        
        // 基于描述的语义生成更合适的名称
        if (description.includes('神秘') || description.includes('未知')) {
            return '神秘' + names[Math.floor(Math.random() * 5)];
        } else if (description.includes('战斗') || description.includes('格斗')) {
            return '武者' + names[Math.floor(Math.random() * 5)];
        } else if (description.includes('智慧') || description.includes('聪明')) {
            return '智者' + names[Math.floor(Math.random() * 5)];
        } else if (description.includes('医疗') || description.includes('治疗')) {
            return '医师' + names[Math.floor(Math.random() * 5)];
        } else if (description.includes('技术') || description.includes('机械')) {
            return '工匠' + names[Math.floor(Math.random() * 5)];
        } else {
            return names[Math.floor(Math.random() * names.length)];
        }
    }

    // 智能生成角色描述
    generateIntelligentDescription(description) {
        // 模拟智能描述生成
        let generatedDescription = description;
        
        // 基于描述内容扩展
        if (description.includes('神秘')) {
            generatedDescription += ' 这个角色总是给人一种神秘的感觉，他的过去充满了未知，没有人真正了解他的背景。他的行为举止都带着一种神秘感，让人难以捉摸。';
        } else if (description.includes('战斗')) {
            generatedDescription += ' 这个角色是一个战斗高手，身手矫健，反应敏捷。他有着丰富的战斗经验，能够应对各种危险情况。';
        } else if (description.includes('智慧')) {
            generatedDescription += ' 这个角色充满智慧，思维敏捷，善于分析问题。他的知识渊博，总是能够找到解决问题的最佳方法。';
        } else if (description.includes('医疗')) {
            generatedDescription += ' 这个角色是一位医术精湛的医师，有着丰富的医疗经验。他总是能够治愈各种疑难杂症，是团队中的重要支柱。';
        } else if (description.includes('技术')) {
            generatedDescription += ' 这个角色是一位技术专家，精通各种技术领域。他总是能够解决各种技术难题，为团队提供技术支持。';
        } else {
            generatedDescription += ' 这个角色有着独特的个性和经历，是一个充满故事的人物。他的存在为故事增添了丰富的色彩。';
        }
        
        return generatedDescription;
    }

    // 智能生成角色性格
    generateIntelligentPersonality(description) {
        // 模拟智能性格生成
        const personalities = [
            '开朗', '沉默寡言', '沉稳', '热情', '冷静', '幽默', '严肃',
            '勇敢', '谨慎', '聪明', '善良', '正直', '果断', '坚强'
        ];
        
        // 基于描述内容生成更合适的性格
        if (description.includes('神秘') || description.includes('沉默')) {
            return '沉默寡言';
        } else if (description.includes('开朗') || description.includes('活泼')) {
            return '开朗';
        } else if (description.includes('冷静') || description.includes('沉稳')) {
            return '沉稳';
        } else if (description.includes('热情') || description.includes('友好')) {
            return '热情';
        } else if (description.includes('聪明') || description.includes('智慧')) {
            return '聪明';
        } else {
            return personalities[Math.floor(Math.random() * personalities.length)];
        }
    }

    // 智能生成角色标签
    generateIntelligentTags(description) {
        // 模拟智能标签生成
        const tags = [];
        
        // 基于描述内容生成合适的标签
        if (description.includes('神秘') || description.includes('未知')) {
            tags.push('神秘');
        }
        if (description.includes('战斗') || description.includes('格斗')) {
            tags.push('战斗');
        }
        if (description.includes('智慧') || description.includes('聪明')) {
            tags.push('智慧');
        }
        if (description.includes('医疗') || description.includes('治疗')) {
            tags.push('医疗');
        }
        if (description.includes('技术') || description.includes('机械')) {
            tags.push('技术');
        }
        if (description.includes('艺术') || description.includes('创作')) {
            tags.push('艺术');
        }
        if (description.includes('商业') || description.includes('交易')) {
            tags.push('商业');
        }
        
        // 确保至少有一个标签
        if (tags.length === 0) {
            tags.push('临时角色');
        }
        
        // 限制标签数量
        return tags.slice(0, 3);
    }

    // 保存数值配置
    saveStat() {
        const statId = document.getElementById('stat-id').value;
        const name = document.getElementById('stat-name').value.trim();
        const threshold = parseInt(document.getElementById('stat-threshold').value);
        const playsText = document.getElementById('stat-plays').value.trim();
        
        if (!name || isNaN(threshold) || !playsText) {
            alert('请填写所有字段');
            return;
        }
        
        const playLibrary = playsText.split('\n').map(p => p.trim()).filter(Boolean);
        
        if (!this.selectedAssistant.settings) {
            this.selectedAssistant.settings = {};
        }
        
        if (!this.selectedAssistant.settings.stats) {
            this.selectedAssistant.settings.stats = [];
        }
        
        if (statId) {
            // 更新现有数值配置
            const index = this.selectedAssistant.settings.stats.findIndex(s => s.id === statId);
            if (index >= 0) {
                this.selectedAssistant.settings.stats[index] = {
                    ...this.selectedAssistant.settings.stats[index],
                    name,
                    threshold,
                    玩法库: playLibrary
                };
            }
        } else {
            // 添加新数值配置
            const newStat = {
                id: `stat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: name,
                threshold: threshold,
                玩法库: playLibrary
            };
            this.selectedAssistant.settings.stats.push(newStat);
        }
        
        this.saveAssistantsToStorage();
        this.showMessage('数值配置保存成功');
    }

    // 编辑数值配置
    editStat(statId) {
        this.openStatEditModal(statId);
    }

    // 删除数值配置
    deleteStat(statId) {
        if (confirm('确定要删除这个数值配置吗？')) {
            if (this.selectedAssistant.settings && this.selectedAssistant.settings.stats) {
                const index = this.selectedAssistant.settings.stats.findIndex(s => s.id === statId);
                if (index >= 0) {
                    this.selectedAssistant.settings.stats.splice(index, 1);
                    this.saveAssistantsToStorage();
                    this.updateAssistantSettingsPanel();
                    this.showMessage('数值配置删除成功');
                }
            }
        }
    }

    saveAssistantProfile() {
        if (!this.selectedAssistant) return;

        const name = document.getElementById('assistant-name').value;
        const personality = document.getElementById('assistant-personality').value;
        const background = document.getElementById('assistant-background').value;
        const tags = document.getElementById('assistant-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);

        this.selectedAssistant.name = name;
        this.selectedAssistant.profile = {
            ...this.selectedAssistant.profile,
            personality,
            background,
            tags
        };

        this.saveAssistantsToStorage();
        this.renderAssistantsList(); // 更新列表显示
        this.showMessage('小助手人设保存成功');
    }

    saveAssistantSettings() {
        if (!this.selectedAssistant) return;

        const enabled = document.getElementById('assistant-enabled').checked;
        const autoUpdate = document.getElementById('assistant-auto-update') ? document.getElementById('assistant-auto-update').checked : false;
        const description = document.getElementById('assistant-description').value;

        this.selectedAssistant.settings = {
            ...this.selectedAssistant.settings,
            enabled,
            autoUpdate
        };
        
        // 保存故事小助手的剧情比例设置
        if (this.selectedAssistant.id === 'story-assistant') {
            const fixedRatio = document.getElementById('fixed-character-ratio');
            const temporaryRatio = document.getElementById('temporary-character-ratio');
            
            if (fixedRatio && temporaryRatio) {
                this.selectedAssistant.settings.fixedCharacterRatio = parseInt(fixedRatio.value);
                this.selectedAssistant.settings.temporaryCharacterRatio = parseInt(temporaryRatio.value);
            }
            
            // 保存故事总结设置
            const summaryEnabled = document.getElementById('summary-enabled');
            const summaryStyle = document.getElementById('summary-style');
            const summaryFormat = document.getElementById('summary-format');
            const summaryWordCount = document.getElementById('summary-word-count');
            const summaryIncludeCharacters = document.getElementById('summary-include-characters');
            const summaryIncludePlot = document.getElementById('summary-include-plot');
            const summaryIncludeThemes = document.getElementById('summary-include-themes');
            
            if (summaryEnabled) {
                this.selectedAssistant.settings.summarySettings = {
                    enabled: summaryEnabled.checked,
                    style: summaryStyle ? summaryStyle.value : '简洁',
                    format: summaryFormat ? summaryFormat.value : '段落',
                    wordCount: summaryWordCount ? parseInt(summaryWordCount.value) : 200,
                    includeCharacters: summaryIncludeCharacters ? summaryIncludeCharacters.checked : true,
                    includePlot: summaryIncludePlot ? summaryIncludePlot.checked : true,
                    includeThemes: summaryIncludeThemes ? summaryIncludeThemes.checked : false
                };
            }
        }
        
        // 保存时间小助手的时间设置
        if (this.selectedAssistant.id === 'time-assistant') {
            const timeSpeed = document.getElementById('time-speed');
            const timeInterval = document.getElementById('time-interval');
            const timeAutoUpdate = document.getElementById('time-auto-update');
            
            if (timeSpeed) {
                this.selectedAssistant.settings.speed = timeSpeed.value;
            }
            if (timeInterval) {
                this.selectedAssistant.settings.interval = parseInt(timeInterval.value);
            }
            if (timeAutoUpdate) {
                this.selectedAssistant.settings.autoUpdate = timeAutoUpdate.checked;
            }
        }
        
        this.selectedAssistant.description = description;

        this.saveAssistantsToStorage();
        this.renderAssistantsList(); // 更新列表显示
        this.showMessage('小助手设置保存成功');
    }

    bindEvents() {
        // 绑定事件
        this.bindImportExportEvents();
    }

    bindImportExportEvents() {
        console.log('开始绑定导入导出事件');
        
        // 绑定导出所有小助手事件
        const exportBtn = document.getElementById('export-all-assistants');
        console.log('导出按钮:', exportBtn);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                console.log('点击导出所有小助手按钮');
                this.exportAllAssistants();
            });
        }
        
        // 绑定导入小助手事件
        const importBtn = document.getElementById('import-assistants-btn');
        console.log('导入按钮:', importBtn);
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                console.log('点击导入小助手按钮');
                const importInput = document.getElementById('import-assistants');
                console.log('导入输入元素:', importInput);
                if (importInput) {
                    importInput.click();
                }
            });
        }
        
        const importInput = document.getElementById('import-assistants');
        console.log('导入输入:', importInput);
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                console.log('导入文件选择:', e.target.files);
                this.importAssistants(e.target.files);
            });
        }
        
        // 绑定全局配置按钮事件
        const configBtn = document.getElementById('global-config-btn');
        console.log('配置按钮:', configBtn);
        if (configBtn) {
            configBtn.addEventListener('click', () => {
                console.log('点击配置按钮');
                const configPanel = document.getElementById('global-config-panel');
                if (configPanel) {
                    configPanel.style.display = configPanel.style.display === 'none' ? 'block' : 'none';
                    if (configPanel.style.display === 'block') {
                        this.loadGlobalConfig();
                    }
                }
            });
        }
        
        // 绑定保存全局配置事件
        const saveConfigBtn = document.getElementById('save-global-config');
        console.log('保存配置按钮:', saveConfigBtn);
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                console.log('点击保存全局配置按钮');
                this.saveGlobalConfig();
            });
        }
        
        // 绑定测试配置按钮事件
        const testConfigBtn = document.getElementById('test-global-config');
        console.log('测试配置按钮:', testConfigBtn);
        if (testConfigBtn) {
            testConfigBtn.addEventListener('click', () => {
                console.log('点击测试配置按钮');
                this.testGlobalConfig();
            });
        }
    }
    
    // 加载全局配置
    loadGlobalConfig() {
        console.log('加载全局配置');
        const globalConfig = this.getGlobalConfig();
        
        document.getElementById('global-api-key').value = globalConfig.apiKey || '';
        document.getElementById('global-api-model').value = globalConfig.model || 'deepseek-chat';
        document.getElementById('global-api-temperature').value = globalConfig.temperature || 0.7;
        document.getElementById('global-api-max-tokens').value = globalConfig.maxTokens || 1000;
    }
    
    // 保存全局配置
    saveGlobalConfig() {
        console.log('保存全局配置');
        const globalConfig = {
            apiKey: document.getElementById('global-api-key').value,
            model: document.getElementById('global-api-model').value,
            temperature: parseFloat(document.getElementById('global-api-temperature').value) || 0.7,
            maxTokens: parseInt(document.getElementById('global-api-max-tokens').value) || 1000
        };
        
        localStorage.setItem(`globalAssistantConfig_${this.currentWorldId}`, JSON.stringify(globalConfig));
        this.showMessage('全局配置保存成功');
    }
    
    // 获取全局配置
    getGlobalConfig() {
        try {
            const configStr = localStorage.getItem(`globalAssistantConfig_${this.currentWorldId}`);
            return configStr ? JSON.parse(configStr) : {};
        } catch (error) {
            console.error('获取全局配置失败:', error);
            return {};
        }
    }
    
    // 测试全局配置
    async testGlobalConfig() {
        console.log('测试全局配置');
        
        // 获取当前输入的配置（不保存，直接从输入框读取）
        const apiKey = document.getElementById('global-api-key').value;
        const model = document.getElementById('global-api-model').value;
        const temperature = parseFloat(document.getElementById('global-api-temperature').value) || 0.7;
        const maxTokens = parseInt(document.getElementById('global-api-max-tokens').value) || 1000;
        
        if (!apiKey) {
            this.showMessage('API密钥不能为空');
            return;
        }
        
        this.showMessage('正在测试API配置，请稍候...');
        
        try {
            // 构建测试请求
            const endpoint = 'https://api.deepseek.com/v1/chat/completions';
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            const body = {
                model: model,
                messages: [
                    { role: 'user', content: '测试API连接，请返回"测试成功"' }
                ],
                temperature: temperature,
                max_tokens: maxTokens
            };
            
            console.log('测试API请求:', {
                endpoint: endpoint,
                headers: {
                    'Content-Type': headers['Content-Type'],
                    'Authorization': 'Bearer ********'
                },
                body: body
            });
            
            // 发送测试请求
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            console.log('测试API响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('测试API响应数据:', data);
            
            if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                const content = data.choices[0].message.content;
                if (content.includes('测试成功')) {
                    this.showMessage('API配置测试成功！');
                } else {
                    this.showMessage('API配置测试成功，但响应内容不符合预期');
                }
            } else {
                this.showMessage('API配置测试失败: 响应格式错误');
            }
        } catch (error) {
            console.error('测试API配置失败:', error);
            this.showMessage(`API配置测试失败: ${error.message}`);
        }
    }

    // 智能导出单个小助手（包含完整配置）
    exportAssistant(assistantId) {
        console.log('导出单个小助手:', assistantId);
        const assistant = this.assistants.find(a => a.id === assistantId);
        if (!assistant) {
            this.showMessage('小助手不存在');
            return;
        }

        // 确保包含完整配置
        const exportData = {
            ...assistant,
            settings: {
                ...assistant.settings,
                // 确保API配置完整
                apiConfig: assistant.settings.apiConfig || {}
            }
        };

        console.log('导出小助手数据:', exportData);
        const data = JSON.stringify(exportData, null, 2);
        console.log('导出JSON数据长度:', data.length);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assistant.name}_${assistant.id}.json`;
        console.log('创建下载链接:', a);
        a.click();
        URL.revokeObjectURL(url);

        this.showMessage(`小助手 ${assistant.name} 导出成功`);
    }

    // 智能导出所有小助手（包含完整配置）
    exportAllAssistants() {
        console.log('导出所有小助手');
        
        // 确保每个小助手都包含完整配置
        const exportData = this.assistants.map(assistant => ({
            ...assistant,
            settings: {
                ...assistant.settings,
                // 确保API配置完整
                apiConfig: assistant.settings.apiConfig || {}
            }
        }));

        console.log('小助手数据:', exportData);
        const data = JSON.stringify(exportData, null, 2);
        console.log('导出JSON数据长度:', data.length);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assistants_${this.currentWorldId}_${new Date().toISOString().split('T')[0]}.json`;
        console.log('创建下载链接:', a);
        a.click();
        URL.revokeObjectURL(url);

        this.showMessage('所有小助手导出成功');
    }

    // 智能导入小助手
    importAssistants(files) {
        console.log('导入小助手:', files);
        if (!files || files.length === 0) {
            console.log('没有选择文件');
            return;
        }

        const file = files[0];
        console.log('选择的文件:', file);
        const reader = new FileReader();

        reader.onload = (e) => {
            console.log('文件读取完成');
            try {
                const data = JSON.parse(e.target.result);
                console.log('解析后的数据:', data);

                if (Array.isArray(data)) {
                    // 导入多个小助手
                    console.log('导入多个小助手');
                    this.importMultipleAssistants(data);
                } else {
                    // 导入单个小助手
                    console.log('导入单个小助手');
                    this.importSingleAssistant(data);
                }
            } catch (error) {
                console.error('解析导入文件失败:', error);
                this.showMessage('导入失败: 文件格式错误');
            }
        };

        reader.onerror = () => {
            console.error('文件读取错误');
            this.showMessage('导入失败: 文件读取错误');
        };

        console.log('开始读取文件');
        reader.readAsText(file);
    }

    // 智能导入单个小助手
    importSingleAssistant(assistantData) {
        console.log('导入单个小助手:', assistantData);
        if (!assistantData || !assistantData.id) {
            this.showMessage('导入失败: 小助手数据不完整');
            return;
        }

        // 检查是否已存在相同ID的小助手
        const existingIndex = this.assistants.findIndex(a => a.id === assistantData.id);
        console.log('现有小助手索引:', existingIndex);

        if (existingIndex >= 0) {
            // 智能更新现有小助手，合并配置
            console.log('更新现有小助手');
            this.assistants[existingIndex] = {
                ...this.assistants[existingIndex],
                ...assistantData,
                // 智能合并配置，保留现有配置的其他字段
                settings: {
                    ...this.assistants[existingIndex].settings,
                    ...assistantData.settings,
                    // 确保API配置合并
                    apiConfig: {
                        ...(this.assistants[existingIndex].settings?.apiConfig || {}),
                        ...(assistantData.settings?.apiConfig || {})
                    }
                }
            };
        } else {
            // 添加新小助手，确保配置完整
            console.log('添加新小助手');
            const newAssistant = {
                ...assistantData,
                settings: {
                    ...assistantData.settings,
                    enabled: assistantData.settings?.enabled ?? true,
                    apiConfig: assistantData.settings?.apiConfig || {}
                }
            };
            this.assistants.push(newAssistant);
        }

        console.log('保存小助手到存储');
        this.saveAssistantsToStorage();
        console.log('重新渲染小助手列表');
        this.renderAssistantsList();
        this.showMessage(`小助手 ${assistantData.name} 导入成功`);
    }

    // 智能导入多个小助手
    importMultipleAssistants(assistantsData) {
        console.log('导入多个小助手:', assistantsData);
        let importedCount = 0;

        assistantsData.forEach(assistantData => {
            if (assistantData && assistantData.id) {
                const existingIndex = this.assistants.findIndex(a => a.id === assistantData.id);
                
                if (existingIndex >= 0) {
                    // 智能更新现有小助手
                    this.assistants[existingIndex] = {
                        ...this.assistants[existingIndex],
                        ...assistantData,
                        settings: {
                            ...this.assistants[existingIndex].settings,
                            ...assistantData.settings,
                            apiConfig: {
                                ...(this.assistants[existingIndex].settings?.apiConfig || {}),
                                ...(assistantData.settings?.apiConfig || {})
                            }
                        }
                    };
                } else {
                    // 添加新小助手，确保配置完整
                    const newAssistant = {
                        ...assistantData,
                        settings: {
                            ...assistantData.settings,
                            enabled: assistantData.settings?.enabled ?? true,
                            apiConfig: assistantData.settings?.apiConfig || {}
                        }
                    };
                    this.assistants.push(newAssistant);
                }
                importedCount++;
            }
        });

        console.log('保存小助手到存储');
        this.saveAssistantsToStorage();
        console.log('重新渲染小助手列表');
        this.renderAssistantsList();
        this.showMessage(`成功导入 ${importedCount} 个小助手`);
    }

    showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        messageElement.style.padding = 'var(--spacing-sm)';
        messageElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        messageElement.style.border = '1px solid rgba(59, 130, 246, 0.3)';
        messageElement.style.borderRadius = 'var(--border-radius)';
        messageElement.style.margin = 'var(--spacing-sm) 0';
        messageElement.style.textAlign = 'center';

        const container = document.getElementById('message-container') || document.body;
        container.appendChild(messageElement);

        // 3秒后自动移除消息
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// 初始化小助手模块
let assistantsModule;
document.addEventListener('DOMContentLoaded', function() {
    assistantsModule = new AssistantsModule();
    // 暴露到全局，供其他模块使用
    window.assistantsModule = assistantsModule;
    
    // 初始化时间显示
    initTimeDisplay();
    // 加载小助手状态
    loadAssistantsStatus();
});

// 时间编辑功能
function editTime() {
    const modal = document.getElementById('time-edit-modal');
    const timeInput = document.getElementById('time-input');
    
    // 设置当前时间为默认值
    const now = new Date();
    const formattedTime = now.toISOString().slice(0, 16); // 格式：YYYY-MM-DDTHH:MM
    timeInput.value = formattedTime;
    
    modal.style.display = 'flex';
}

function closeTimeModal() {
    const modal = document.getElementById('time-edit-modal');
    modal.style.display = 'none';
}

function saveTime() {
    const modal = document.getElementById('time-edit-modal');
    const timeInput = document.getElementById('time-input');
    const currentTimeElement = document.getElementById('currentTime');
    
    const selectedTime = timeInput.value;
    if (selectedTime) {
        const date = new Date(selectedTime);
        currentTimeElement.textContent = date.toLocaleString();
    }
    
    modal.style.display = 'none';
}

// 加载小助手状态
function loadAssistantsStatus() {
    try {
        const statusContainer = document.getElementById('assistants-status');
        if (!statusContainer) return;
        
        // 获取当前世界ID
        const currentWorldId = localStorage.getItem('currentWorldId');
        if (!currentWorldId) return;
        
        // 获取所有小助手
        const storedAssistants = localStorage.getItem(`assistants_${currentWorldId}`);
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
            // 尝试获取默认小助手
            assistants = [
                { id: 'profile-assistant', name: '人设小助手', settings: { enabled: true } },
                { id: 'time-assistant', name: '时间小助手', settings: { enabled: true } },
                { id: 'erotic-assistant', name: '色色小助手', settings: { enabled: true } },
                { id: 'character-generator-assistant', name: '人物小助手', settings: { enabled: true } },
                { id: 'story-assistant', name: '故事小助手', settings: { enabled: true } },
                { id: 'summary-assistant', name: '总结小助手', settings: { enabled: true } }
            ];
        }
        
        // 过滤掉前情提要小助手和场景小助手
        assistants = assistants.filter(assistant => assistant.id !== 'context-assistant' && assistant.id !== 'scene-assistant');
        
        // 清空容器
        statusContainer.innerHTML = '';
        
        // 显示每个小助手的状态
        assistants.forEach(assistant => {
            const currentStatus = assistant.settings?.enabled ? '' : '已禁用';
            
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
            statusContainer.appendChild(assistantStatus);
        });
    } catch (error) {
        console.error('加载小助手状态失败:', error);
    }
}

// 初始化时间显示
function initTimeDisplay() {
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
        const now = new Date();
        currentTimeElement.textContent = now.toLocaleString();
    }
}

// 导出AssistantsModule类
export default AssistantsModule;

// 暴露loadAssistantsStatus函数到全局作用域
if (typeof window !== 'undefined') {
    window.loadAssistantsStatus = loadAssistantsStatus;
}