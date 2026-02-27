// 场景小助手模块
import AssistantBase from '../assistant-base.js';

class SceneAssistant extends AssistantBase {
    constructor(worldId) {
        super(worldId);
        this.id = 'scene-assistant';
        this.name = '场景小助手';
        this.color = '#10b981';
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const sceneAssistant = assistants.find(a => a.id === 'scene-assistant');
                if (sceneAssistant && sceneAssistant.settings) {
                    return sceneAssistant.settings;
                }
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        return {
            enabled: true,
            autoUpdate: false,
            sceneTypes: ['室内', '室外', '自然', '城市', '奇幻'],
            atmospheres: ['紧张', '温馨', '神秘', '浪漫', '恐怖']
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

        const index = assistants.findIndex(a => a.id === 'scene-assistant');
        if (index >= 0) {
            assistants[index] = {
                ...assistants[index],
                settings: this.settings
            };
        } else {
            assistants.push({
                id: 'scene-assistant',
                name: '场景小助手',
                description: '管理故事场景的描述和氛围',
                profile: {
                    personality: '细腻、善于描绘、注重细节',
                    background: '我是专门负责管理故事场景的小助手，帮助你创建生动的场景描述和氛围。',
                    tags: ['场景描述', '氛围营造', '细节描写']
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

    // 添加自定义场景类型
    addSceneType(type) {
        if (!this.settings.enabled || !type) return false;

        if (!this.settings.sceneTypes.includes(type)) {
            this.settings.sceneTypes.push(type);
            this.saveSettings();
            return true;
        }
        return false;
    }

    // 添加自定义氛围类型
    addAtmosphere(atmosphere) {
        if (!this.settings.enabled || !atmosphere) return false;

        if (!this.settings.atmospheres.includes(atmosphere)) {
            this.settings.atmospheres.push(atmosphere);
            this.saveSettings();
            return true;
        }
        return false;
    }

    // 生成场景描述
    generateSceneDescription(type, atmosphere, timeOfDay) {
        if (!this.settings.enabled) return null;

        // 确保类型和氛围有效
        const validType = this.settings.sceneTypes.includes(type) ? type : this.settings.sceneTypes[0];
        const validAtmosphere = this.settings.atmospheres.includes(atmosphere) ? atmosphere : this.settings.atmospheres[0];
        const validTimeOfDay = timeOfDay || '白天';

        // 场景描述模板
        const sceneTemplates = {
            '室内': {
                '紧张': `${validTimeOfDay}，房间里的空气仿佛凝固了，每一个细微的声音都被放大。角落里的时钟滴答作响，在寂静中显得格外刺耳。`,
                '温馨': `${validTimeOfDay}，阳光透过窗户洒进房间，照在柔软的沙发上。茶几上放着一杯冒着热气的咖啡，整个空间弥漫着家的温暖。`,
                '神秘': `${validTimeOfDay}，房间里的光线昏暗，角落里的阴影似乎在移动。书架上的古老书籍散发着淡淡的霉味，仿佛隐藏着不为人知的秘密。`,
                '浪漫': `${validTimeOfDay}，房间里点着蜡烛，柔和的光芒映照着墙上的照片。窗外传来远处的音乐声，整个空间充满了浪漫的气息。`,
                '恐怖': `${validTimeOfDay}，房间里的灯光忽明忽暗，墙上的影子扭曲变形。窗外的风声像是有人在哭泣，让人不寒而栗。`
            },
            '室外': {
                '紧张': `${validTimeOfDay}，街道上空无一人，只有远处传来的警笛声。空气中弥漫着不安的气息，仿佛有什么可怕的事情即将发生。`,
                '温馨': `${validTimeOfDay}，公园里充满了孩子们的笑声，老人们在长椅上聊天。阳光明媚，微风轻拂，一切都显得那么和谐美好。`,
                '神秘': `${validTimeOfDay}，雾气笼罩着整个街道，能见度不足几米。远处传来若有若无的脚步声，却看不到任何人的身影。`,
                '浪漫': `${validTimeOfDay}，夕阳西下，天空被染成了绚丽的橙红色。情侣们手牵手漫步在街头，享受着这美好的时刻。`,
                '恐怖': `${validTimeOfDay}，乌云密布，天空一片漆黑。狂风大作，树枝被吹得沙沙作响，仿佛有什么怪物在黑暗中潜伏。`
            },
            '自然': {
                '紧张': `${validTimeOfDay}，森林里静得可怕，只有偶尔传来的鸟叫声打破寂静。树叶沙沙作响，似乎有什么东西在林间移动。`,
                '温馨': `${validTimeOfDay}，阳光透过树叶的缝隙洒在地上，形成斑驳的光影。小溪潺潺流淌，鸟语花香，让人感到心旷神怡。`,
                '神秘': `${validTimeOfDay}，浓雾笼罩着森林，周围的一切都变得模糊不清。远处传来奇怪的声音，让人不禁感到好奇又害怕。`,
                '浪漫': `${validTimeOfDay}，夕阳的余晖洒在湖面，波光粼粼。湖边的草地上开满了鲜花，微风中弥漫着花香。`,
                '恐怖': `${validTimeOfDay}，森林里一片漆黑，只有微弱的月光照亮前方的路。远处传来野兽的嚎叫声，让人毛骨悚然。`
            },
            '城市': {
                '紧张': `${validTimeOfDay}，城市的街道上人来人往，每个人都行色匆匆。远处传来警车的鸣笛声，空气中弥漫着紧张的气息。`,
                '温馨': `${validTimeOfDay}，城市的广场上充满了欢声笑语，孩子们在玩耍，大人们在聊天。阳光明媚，整个城市显得生机勃勃。`,
                '神秘': `${validTimeOfDay}，城市的夜晚霓虹灯闪烁，街头巷尾充满了各种声音。角落里的阴影中，似乎隐藏着不为人知的秘密。`,
                '浪漫': `${validTimeOfDay}，城市的夜景美不胜收，高楼大厦灯火通明。情侣们在街头漫步，享受着这浪漫的夜晚。`,
                '恐怖': `${validTimeOfDay}，城市的夜晚一片寂静，只有路灯发出微弱的光芒。空无一人的街道上，偶尔传来奇怪的声音。`
            },
            '奇幻': {
                '紧张': `${validTimeOfDay}，魔法森林里充满了各种奇怪的生物，空气中弥漫着魔法的气息。远处传来巨龙的咆哮声，让人胆战心惊。`,
                '温馨': `${validTimeOfDay}，精灵的村庄里充满了欢乐的笑声，各种神奇的生物和谐相处。阳光透过魔法树的叶子洒下，整个村庄显得如梦似幻。`,
                '神秘': `${validTimeOfDay}，魔法城堡的周围环绕着云雾，城堡的窗户里透出诡异的光芒。传说中城堡里藏着巨大的宝藏，也藏着可怕的诅咒。`,
                '浪漫': `${validTimeOfDay}，仙境般的花园里开满了各种会发光的花朵，空气中弥漫着甜蜜的香气。远处的湖泊倒映着天空中的彩虹，美不胜收。`,
                '恐怖': `${validTimeOfDay}，黑暗森林里充满了各种可怕的生物，空气中弥漫着邪恶的气息。远处传来女巫的笑声，让人不寒而栗。`
            }
        };

        return sceneTemplates[validType]?.[validAtmosphere] || `这是一个${validType}场景，氛围${validAtmosphere}。`;
    }

    // 分析场景描述
    analyzeSceneDescription(description) {
        if (!this.settings.enabled) return null;

        // 简单的场景分析
        const analysis = {
            length: description.length,
            sceneType: this.detectSceneType(description),
            atmosphere: this.detectAtmosphere(description),
            details: this.countDetails(description)
        };

        return analysis;
    }

    // 检测场景类型
    detectSceneType(description) {
        const typeKeywords = {
            '室内': ['房间', '室内', '客厅', '卧室', '厨房'],
            '室外': ['室外', '街道', '公园', '广场'],
            '自然': ['森林', '草地', '湖泊', '山脉'],
            '城市': ['城市', '高楼', '街道', '广场'],
            '奇幻': ['魔法', '精灵', '巨龙', '仙境']
        };

        for (const [type, keywords] of Object.entries(typeKeywords)) {
            for (const keyword of keywords) {
                if (description.includes(keyword)) {
                    return type;
                }
            }
        }

        return '未知';
    }

    // 检测氛围
    detectAtmosphere(description) {
        const atmosphereKeywords = {
            '紧张': ['紧张', '害怕', '恐惧', '不安'],
            '温馨': ['温馨', '温暖', '舒适', '美好'],
            '神秘': ['神秘', '奇怪', '未知', '秘密'],
            '浪漫': ['浪漫', '甜蜜', '爱情', '美好'],
            '恐怖': ['恐怖', '可怕', '毛骨悚然', '害怕']
        };

        for (const [atmosphere, keywords] of Object.entries(atmosphereKeywords)) {
            for (const keyword of keywords) {
                if (description.includes(keyword)) {
                    return atmosphere;
                }
            }
        }

        return '中性';
    }

    // 计算细节数量
    countDetails(description) {
        const detailKeywords = ['颜色', '声音', '气味', '感觉', '形状', '大小'];
        let count = 0;

        detailKeywords.forEach(keyword => {
            if (description.includes(keyword)) {
                count++;
            }
        });

        return count;
    }

    // 根据时间调整场景描述
    adjustSceneForTime(description, timeOfDay) {
        if (!this.settings.enabled) return description;

        const timeAdjustments = {
            '早晨': '清晨的阳光洒在周围，一切都显得生机勃勃。',
            '上午': '阳光明媚，空气中充满了活力。',
            '中午': '太阳高高挂在天空，阳光炽热。',
            '下午': '阳光开始西斜，温度逐渐降低。',
            '傍晚': '夕阳西下，天空被染成了绚丽的颜色。',
            '夜晚': '夜幕降临，周围一片漆黑，只有微弱的灯光照亮前方。'
        };

        const adjustment = timeAdjustments[timeOfDay] || '';
        return `${description} ${adjustment}`.trim();
    }
    
    // 生成设置面板HTML
    generateSettingsHTML(settings) {
        return `
            <h3 style="color: ${this.color};">${this.name}设置</h3>
            ${this.generateCheckbox('assistant-enabled', `启用${this.name}`, settings.enabled, this.color)}
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">场景类型</h4>
                ${this.generateLabelGroup('scene-type', settings.sceneTypes || ['室内', '室外', '自然', '城市', '奇幻'], this.color)}
                <div style="margin-top: var(--spacing-md);">
                    <label for="custom-scene-type" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500; color: var(--text-color); font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: 0.05em;">添加自定义场景类型:</label>
                    <input type="text" id="custom-scene-type" placeholder="添加自定义场景类型" style="width: 100%; padding: var(--spacing-sm); border: 1px solid #a7f3d0; border-radius: var(--border-radius-md);" />
                    ${this.generateButton('add-scene-type', '添加场景类型', 'margin-top: var(--spacing-sm); background-color: #10b981; color: white; padding: var(--spacing-xs) var(--spacing-sm); border: none; border-radius: var(--border-radius-md);')}
                </div>
            </div>
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">氛围类型</h4>
                ${this.generateLabelGroup('atmosphere-type', settings.atmospheres || ['紧张', '温馨', '神秘', '浪漫', '恐怖'], this.color)}
                <div style="margin-top: var(--spacing-md);">
                    <label for="custom-atmosphere" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500; color: var(--text-color); font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: 0.05em;">添加自定义氛围类型:</label>
                    <input type="text" id="custom-atmosphere" placeholder="添加自定义氛围类型" style="width: 100%; padding: var(--spacing-sm); border: 1px solid #a7f3d0; border-radius: var(--border-radius-md);" />
                    ${this.generateButton('add-atmosphere', '添加氛围类型', 'margin-top: var(--spacing-sm); background-color: #10b981; color: white; padding: var(--spacing-xs) var(--spacing-sm); border: none; border-radius: var(--border-radius-md);')}
                </div>
            </div>
            
            ${this.generateTextInput('assistant-description', '小助手描述', settings.description)}
            ${this.generateButton('save-assistant-settings', '保存小助手设置', 'background-color: #10b981; color: white;')}
        `;
    }
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        // 绑定添加场景类型按钮事件
        const addSceneTypeBtn = document.getElementById('add-scene-type');
        if (addSceneTypeBtn) {
            addSceneTypeBtn.addEventListener('click', () => this.addCustomSceneType());
        }
        
        // 绑定添加氛围类型按钮事件
        const addAtmosphereBtn = document.getElementById('add-atmosphere');
        if (addAtmosphereBtn) {
            addAtmosphereBtn.addEventListener('click', () => this.addCustomAtmosphere());
        }
    }
    
    // 添加自定义场景类型（供设置面板调用）
    addCustomSceneType() {
        const customSceneTypeInput = document.getElementById('custom-scene-type');
        const customSceneType = customSceneTypeInput.value.trim();
        
        if (customSceneType) {
            if (this.addSceneType(customSceneType)) {
                alert('场景类型添加成功！');
                customSceneTypeInput.value = '';
                // 重新渲染设置面板
                const event = new CustomEvent('settingsUpdated');
                document.dispatchEvent(event);
            } else {
                alert('场景类型已存在！');
            }
        }
    }
    
    // 添加自定义氛围类型（供设置面板调用）
    addCustomAtmosphere() {
        const customAtmosphereInput = document.getElementById('custom-atmosphere');
        const customAtmosphere = customAtmosphereInput.value.trim();
        
        if (customAtmosphere) {
            if (this.addAtmosphere(customAtmosphere)) {
                alert('氛围类型添加成功！');
                customAtmosphereInput.value = '';
                // 重新渲染设置面板
                const event = new CustomEvent('settingsUpdated');
                document.dispatchEvent(event);
            } else {
                alert('氛围类型已存在！');
            }
        }
    }
}

// 导出模块
export default SceneAssistant;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneAssistant;
} else if (typeof window !== 'undefined') {
    window.SceneAssistant = SceneAssistant;
}