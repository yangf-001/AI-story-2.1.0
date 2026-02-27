class EroticSettingsModule {
    constructor() {
        this.currentWorldId = localStorage.getItem('currentWorldId');
        this.assistant = this.getEroticAssistant();
        this.init();
    }

    init() {
        if (!this.currentWorldId) {
            window.location.href = 'index.html';
            return;
        }

        this.renderKeywordsList();
        this.renderStatsList();
        this.bindEvents();
    }

    getEroticAssistant() {
        const storedAssistants = localStorage.getItem(`assistants_${this.currentWorldId}`);
        if (storedAssistants) {
            const assistants = JSON.parse(storedAssistants);
            return assistants.find(a => a.id === 'erotic-assistant') || this.createDefaultEroticAssistant();
        }
        return this.createDefaultEroticAssistant();
    }

    createDefaultEroticAssistant() {
        const defaultAssistant = {
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
        };

        // 保存到本地存储
        this.saveAssistant(defaultAssistant);
        return defaultAssistant;
    }

    saveAssistant(assistant) {
        const storedAssistants = localStorage.getItem(`assistants_${this.currentWorldId}`);
        let assistants = [];
        if (storedAssistants) {
            assistants = JSON.parse(storedAssistants);
        }

        const index = assistants.findIndex(a => a.id === assistant.id);
        if (index >= 0) {
            assistants[index] = assistant;
        } else {
            assistants.push(assistant);
        }

        localStorage.setItem(`assistants_${this.currentWorldId}`, JSON.stringify(assistants));
    }

    renderKeywordsList() {
        const container = document.getElementById('keywords-container');
        if (!container) return;

        container.innerHTML = '';

        const keywords = this.assistant.settings.keywords || [];
        
        if (keywords.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9CA3AF; font-style: italic;">暂无关键词，点击添加按钮创建</p>';
            return;
        }

        keywords.forEach(keyword => {
            const keywordItem = document.createElement('div');
            keywordItem.className = 'keyword-item';
            keywordItem.innerHTML = `
                <span style="font-weight: 600; color: #BE185D;">${keyword.word}</span>
            `;
            
            // 添加点击事件
            keywordItem.addEventListener('click', (e) => {
                // 如果处于删除模式，切换选择状态
                if (this.currentDeleteMode === 'keywords') {
                    keywordItem.classList.toggle('selected');
                } else {
                    // 跳转到关键词详情页面
                    localStorage.setItem('currentKeywordId', keyword.id);
                    window.location.href = 'erotic-keyword-detail.html';
                }
            });
            
            container.appendChild(keywordItem);
        });
    }

    renderStatsList() {
        const container = document.getElementById('stats-container');
        if (!container) return;

        container.innerHTML = '';

        const stats = this.assistant.settings.stats || [];
        
        if (stats.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9CA3AF; font-style: italic;">暂无数值配置，点击添加按钮创建</p>';
            return;
        }

        stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            statItem.innerHTML = `
                <span style="font-weight: 600; color: #BE185D;">${stat.name}</span>
            `;
            
            // 添加点击事件
            statItem.addEventListener('click', (e) => {
                // 如果处于删除模式，切换选择状态
                if (this.currentDeleteMode === 'stats') {
                    statItem.classList.toggle('selected');
                } else {
                    // 跳转到数值配置详情页面
                    localStorage.setItem('currentStatId', stat.id);
                    window.location.href = 'erotic-stat-detail.html';
                }
            });
            
            container.appendChild(statItem);
        });
    }

    bindEvents() {
        // 添加关键词
        document.getElementById('add-keyword').addEventListener('click', () => this.addKeyword());
        
        // 添加数值配置
        document.getElementById('add-stat').addEventListener('click', () => this.addStat());
        
        // 导入导出功能
        document.getElementById('export-keywords').addEventListener('click', () => this.exportKeywords());
        document.getElementById('import-keywords').addEventListener('click', () => this.importKeywords());
        document.getElementById('export-stats').addEventListener('click', () => this.exportStats());
        document.getElementById('import-stats').addEventListener('click', () => this.importStats());
        document.getElementById('export-all').addEventListener('click', () => this.exportAll());
        document.getElementById('import-all').addEventListener('click', () => this.importAll());
        
        // 删除按钮事件
        document.getElementById('delete-keyword-btn').addEventListener('click', () => this.enterDeleteMode('keywords'));
        document.getElementById('delete-stat-btn').addEventListener('click', () => this.enterDeleteMode('stats'));
        document.getElementById('confirm-keyword-delete').addEventListener('click', () => this.confirmDelete('keywords'));
        document.getElementById('cancel-keyword-delete').addEventListener('click', () => this.exitDeleteMode('keywords'));
        document.getElementById('confirm-stat-delete').addEventListener('click', () => this.confirmDelete('stats'));
        document.getElementById('cancel-stat-delete').addEventListener('click', () => this.exitDeleteMode('stats'));
    }

    addKeyword() {
        const word = document.getElementById('new-keyword-word').value.trim();
        const play = document.getElementById('new-keyword-play').value.trim();
        const trigger = document.getElementById('new-keyword-trigger').value.trim();
        const description = document.getElementById('new-keyword-description').value.trim();

        if (!word || !play || !trigger || !description) {
            alert('请填写所有字段');
            return;
        }

        // 检查触发词唯一性
        const existingKeywords = this.assistant.settings.keywords || [];
        const isDuplicate = existingKeywords.some(keyword => {
            // 检查关键词或触发词是否重复
            return keyword.word.toLowerCase() === word.toLowerCase() || 
                   keyword.cg.触发词.toLowerCase() === trigger.toLowerCase();
        });

        if (isDuplicate) {
            alert('关键词或触发词已存在，请使用不同的关键词或触发词');
            return;
        }

        const cg = {
            玩法: play,
            触发词: trigger,
            描述: description
        };

        if (!this.assistant.settings.keywords) {
            this.assistant.settings.keywords = [];
        }

        // 添加新关键词
        const newKeyword = {
            id: `keyword-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            word: word,
            cg: cg
        };
        this.assistant.settings.keywords.push(newKeyword);

        this.saveAssistant(this.assistant);
        this.renderKeywordsList();
        
        // 清空表单
        document.getElementById('new-keyword-word').value = '';
        document.getElementById('new-keyword-play').value = '';
        document.getElementById('new-keyword-trigger').value = '';
        document.getElementById('new-keyword-description').value = '';
        
        this.showMessage('关键词添加成功');
    }

    deleteKeyword(keywordId) {
        if (confirm('确定要删除这个关键词吗？')) {
            if (this.assistant.settings.keywords) {
                const index = this.assistant.settings.keywords.findIndex(k => k.id === keywordId);
                if (index >= 0) {
                    this.assistant.settings.keywords.splice(index, 1);
                    this.saveAssistant(this.assistant);
                    this.renderKeywordsList();
                    this.showMessage('关键词删除成功');
                }
            }
        }
    }

    addStat() {
        const name = document.getElementById('new-stat-name').value.trim();
        const thresholdLight = parseInt(document.getElementById('new-stat-threshold-light').value) || 30;
        const thresholdMedium = parseInt(document.getElementById('new-stat-threshold-medium').value) || 50;
        const thresholdHeavy = parseInt(document.getElementById('new-stat-threshold-heavy').value) || 70;
        const thresholdExtreme = parseInt(document.getElementById('new-stat-threshold-extreme').value) || 90;

        if (!name) {
            alert('请填写数值名称');
            return;
        }

        const thresholds = {
            轻度: thresholdLight,
            中度: thresholdMedium,
            重度: thresholdHeavy,
            极端: thresholdExtreme
        };

        const playLibrary = {
            轻度: [],
            中度: [],
            重度: [],
            极端: []
        };

        if (!this.assistant.settings.stats) {
            this.assistant.settings.stats = [];
        }

        // 添加新数值配置
        const newStat = {
            id: `stat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: name,
            thresholds,
            玩法库: playLibrary
        };
        this.assistant.settings.stats.push(newStat);

        this.saveAssistant(this.assistant);
        this.renderStatsList();
        
        // 清空表单
        document.getElementById('new-stat-name').value = '';
        document.getElementById('new-stat-threshold-light').value = '30';
        document.getElementById('new-stat-threshold-medium').value = '50';
        document.getElementById('new-stat-threshold-heavy').value = '70';
        document.getElementById('new-stat-threshold-extreme').value = '90';
        
        this.showMessage('数值配置添加成功');
    }

    deleteStat(statId) {
        if (confirm('确定要删除这个数值配置吗？')) {
            if (this.assistant.settings.stats) {
                const index = this.assistant.settings.stats.findIndex(s => s.id === statId);
                if (index >= 0) {
                    this.assistant.settings.stats.splice(index, 1);
                    this.saveAssistant(this.assistant);
                    this.renderStatsList();
                    this.showMessage('数值配置删除成功');
                }
            }
        }
    }

    showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        messageElement.style.padding = 'var(--spacing-sm)';
        messageElement.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
        messageElement.style.border = '1px solid rgba(236, 72, 153, 0.3)';
        messageElement.style.borderRadius = 'var(--border-radius)';
        messageElement.style.margin = 'var(--spacing-sm) 0';
        messageElement.style.textAlign = 'center';
        messageElement.style.color = '#BE185D';

        const container = document.querySelector('.header') || document.body;
        container.appendChild(messageElement);

        // 3秒后自动移除消息
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    // 显示关键词详情
    showKeywordDetail(keyword) {
        this.currentKeywordId = keyword.id;
        const modal = document.getElementById('keyword-detail-modal');
        const content = document.getElementById('keyword-detail-content');
        
        if (!modal || !content) return;
        
        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">关键词:</strong> ${keyword.word}
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">玩法:</strong> ${keyword.cg.玩法}
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">触发词:</strong> ${keyword.cg.触发词}
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">描述:</strong> ${keyword.cg.描述}
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    // 关闭关键词详情模态框
    closeKeywordDetailModal() {
        const modal = document.getElementById('keyword-detail-modal');
        if (!modal) return;
        modal.style.display = 'none';
    }

    // 显示数值配置详情
    showStatDetail(stat) {
        this.currentStatId = stat.id;
        const modal = document.getElementById('stat-detail-modal');
        const content = document.getElementById('stat-detail-content');
        
        if (!modal || !content) return;
        
        const thresholds = stat.thresholds || { 轻度: 30, 中度: 50, 重度: 70, 极端: 90 };
        const playLibrary = stat.玩法库 || {};
        
        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">数值名称:</strong> ${stat.name}
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">阈值设置:</strong>
                <div style="margin-top: var(--spacing-xs);">
                    轻度: ${thresholds.轻度} | 中度: ${thresholds.中度} | 重度: ${thresholds.重度} | 极端: ${thresholds.极端}
                </div>
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">轻度玩法库:</strong>
                <div style="margin-top: var(--spacing-xs); font-size: 0.875rem;">
                    ${playLibrary.轻度 ? playLibrary.轻度.join('、') : '无'}
                </div>
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">中度玩法库:</strong>
                <div style="margin-top: var(--spacing-xs); font-size: 0.875rem;">
                    ${playLibrary.中度 ? playLibrary.中度.join('、') : '无'}
                </div>
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">重度玩法库:</strong>
                <div style="margin-top: var(--spacing-xs); font-size: 0.875rem;">
                    ${playLibrary.重度 ? playLibrary.重度.join('、') : '无'}
                </div>
            </div>
            <div style="margin-bottom: var(--spacing-md);">
                <strong style="color: #BE185D;">极端玩法库:</strong>
                <div style="margin-top: var(--spacing-xs); font-size: 0.875rem;">
                    ${playLibrary.极端 ? playLibrary.极端.join('、') : '无'}
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    // 关闭数值配置详情模态框
    closeStatDetailModal() {
        const modal = document.getElementById('stat-detail-modal');
        if (!modal) return;
        modal.style.display = 'none';
    }

    // 进入删除模式
    enterDeleteMode(type) {
        this.currentDeleteMode = type;
        
        // 显示确认和取消按钮，隐藏删除按钮
        if (type === 'keywords') {
            document.getElementById('delete-keyword-btn').style.display = 'none';
            document.getElementById('confirm-keyword-delete').style.display = 'block';
            document.getElementById('cancel-keyword-delete').style.display = 'block';
        } else if (type === 'stats') {
            document.getElementById('delete-stat-btn').style.display = 'none';
            document.getElementById('confirm-stat-delete').style.display = 'block';
            document.getElementById('cancel-stat-delete').style.display = 'block';
        }
        
        // 重新渲染列表，启用选择功能
        if (type === 'keywords') {
            this.renderKeywordsList();
        } else if (type === 'stats') {
            this.renderStatsList();
        }
        
        this.showMessage('点击项目选择要删除的内容，然后点击确认删除');
    }

    // 退出删除模式
    exitDeleteMode(type) {
        this.currentDeleteMode = null;
        
        // 隐藏确认和取消按钮，显示删除按钮
        if (type === 'keywords') {
            document.getElementById('delete-keyword-btn').style.display = 'block';
            document.getElementById('confirm-keyword-delete').style.display = 'none';
            document.getElementById('cancel-keyword-delete').style.display = 'none';
        } else if (type === 'stats') {
            document.getElementById('delete-stat-btn').style.display = 'block';
            document.getElementById('confirm-stat-delete').style.display = 'none';
            document.getElementById('cancel-stat-delete').style.display = 'none';
        }
        
        // 重新渲染列表，禁用选择功能
        if (type === 'keywords') {
            this.renderKeywordsList();
        } else if (type === 'stats') {
            this.renderStatsList();
        }
    }

    // 确认删除
    confirmDelete(type) {
        // 获取选中的项目
        const selectedItems = document.querySelectorAll(`.${type === 'keywords' ? 'keyword' : 'stat'}-item.selected`);
        const selectedIds = Array.from(selectedItems).map(item => {
            // 从项目内容中找到对应的ID
            const items = type === 'keywords' ? this.assistant.settings.keywords || [] : this.assistant.settings.stats || [];
            const itemText = item.textContent.trim();
            const foundItem = items.find(i => (i.word || i.name) === itemText);
            return foundItem ? foundItem.id : null;
        }).filter(id => id !== null);
        
        if (selectedIds.length === 0) {
            alert('请选择要删除的项目');
            return;
        }
        
        // 执行删除
        if (type === 'keywords') {
            this.assistant.settings.keywords = (this.assistant.settings.keywords || []).filter(keyword => !selectedIds.includes(keyword.id));
        } else if (type === 'stats') {
            this.assistant.settings.stats = (this.assistant.settings.stats || []).filter(stat => !selectedIds.includes(stat.id));
        }
        
        // 保存并更新界面
        this.saveAssistant(this.assistant);
        if (type === 'keywords') {
            this.renderKeywordsList();
        } else if (type === 'stats') {
            this.renderStatsList();
        }
        
        // 退出删除模式
        this.exitDeleteMode(type);
        this.showMessage(`成功删除 ${selectedIds.length} 个项目`);
    }

    // 导出关键词
    exportKeywords() {
        const keywords = this.assistant.settings.keywords || [];
        const dataStr = JSON.stringify(keywords, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `erotic-keywords-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showMessage('关键词导出成功');
    }

    // 导入关键词
    importKeywords() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedKeywords = JSON.parse(event.target.result);
                    if (Array.isArray(importedKeywords)) {
                        const existingKeywords = this.assistant.settings.keywords || [];
                        const existingWords = new Set(existingKeywords.map(k => k.word.toLowerCase()));
                        const existingTriggers = new Set(existingKeywords.map(k => k.cg.触发词.toLowerCase()));
                        
                        // 过滤掉重复的关键词
                        const uniqueKeywords = importedKeywords.filter(keyword => {
                            const wordLower = keyword.word.toLowerCase();
                            const triggerLower = keyword.cg.触发词.toLowerCase();
                            return !existingWords.has(wordLower) && !existingTriggers.has(triggerLower);
                        });
                        
                        if (uniqueKeywords.length === 0) {
                            alert('所有关键词都已存在，没有新关键词可导入');
                            return;
                        }
                        
                        // 为导入的关键词生成新的ID
                        const updatedKeywords = uniqueKeywords.map(keyword => ({
                            ...keyword,
                            id: `keyword-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                        }));
                        
                        // 合并现有关键词和新关键词
                        this.assistant.settings.keywords = [...existingKeywords, ...updatedKeywords];
                        this.saveAssistant(this.assistant);
                        this.renderKeywordsList();
                        this.showMessage(`成功导入 ${updatedKeywords.length} 个新关键词`);
                    } else {
                        throw new Error('无效的关键词数据格式');
                    }
                } catch (error) {
                    alert('导入失败: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // 导出数值配置
    exportStats() {
        const stats = this.assistant.settings.stats || [];
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `erotic-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showMessage('数值配置导出成功');
    }

    // 导入数值配置
    importStats() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedStats = JSON.parse(event.target.result);
                    if (Array.isArray(importedStats)) {
                        // 为导入的数值配置生成新的ID
                        const updatedStats = importedStats.map(stat => ({
                            ...stat,
                            id: `stat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                        }));
                        
                        this.assistant.settings.stats = updatedStats;
                        this.saveAssistant(this.assistant);
                        this.renderStatsList();
                        this.showMessage('数值配置导入成功');
                    } else {
                        throw new Error('无效的数值配置数据格式');
                    }
                } catch (error) {
                    alert('导入失败: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // 导出所有设置
    exportAll() {
        const dataStr = JSON.stringify(this.assistant.settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `erotic-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showMessage('所有设置导出成功');
    }

    // 导入所有设置
    importAll() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedSettings = JSON.parse(event.target.result);
                    
                    // 处理关键词唯一性
                    if (Array.isArray(importedSettings.keywords)) {
                        const existingKeywords = this.assistant.settings.keywords || [];
                        const existingWords = new Set(existingKeywords.map(k => k.word.toLowerCase()));
                        const existingTriggers = new Set(existingKeywords.map(k => k.cg.触发词.toLowerCase()));
                        
                        // 过滤掉重复的关键词
                        const uniqueKeywords = importedSettings.keywords.filter(keyword => {
                            const wordLower = keyword.word.toLowerCase();
                            const triggerLower = keyword.cg.触发词.toLowerCase();
                            return !existingWords.has(wordLower) && !existingTriggers.has(triggerLower);
                        });
                        
                        // 为导入的关键词生成新的ID
                        importedSettings.keywords = uniqueKeywords.map(keyword => ({
                            ...keyword,
                            id: `keyword-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                        }));
                    }
                    
                    // 为导入的数值配置生成新的ID
                    if (Array.isArray(importedSettings.stats)) {
                        importedSettings.stats = importedSettings.stats.map(stat => ({
                            ...stat,
                            id: `stat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                        }));
                    }
                    
                    // 合并设置，保留现有关键词，只添加新的
                    const existingKeywords = this.assistant.settings.keywords || [];
                    this.assistant.settings = {
                        ...importedSettings,
                        keywords: [...existingKeywords, ...(importedSettings.keywords || [])]
                    };
                    
                    this.saveAssistant(this.assistant);
                    this.renderKeywordsList();
                    this.renderStatsList();
                    this.showMessage('所有设置导入成功');
                } catch (error) {
                    alert('导入失败: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}

// 初始化模块
let eroticSettingsModule;
document.addEventListener('DOMContentLoaded', function() {
    eroticSettingsModule = new EroticSettingsModule();
});