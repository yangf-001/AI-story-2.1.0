// 全局变量
let charactersList, importBtn, exportBtn, batchDeleteBtn, batchImportBtn, batchExportBtn;
let modal, modalTitle, importContent, exportContent, closeModalBtn, confirmModalBtn;
let importFile, importText, exportText, copyExportBtn, downloadExportBtn;
let currentMode = ''; // 'import' or 'export'
let currentRoleType = ''; // 'permanent' or 'temporary'
let selectedCharacters = [];
let batchDeleteMode = false; // 批量删除模式

// 确保batchDeleteMode在全局范围内可用
window.batchDeleteMode = batchDeleteMode;

document.addEventListener('DOMContentLoaded', function() {
    charactersList = document.getElementById('characters-list');
    importBtn = document.getElementById('import-btn');
    exportBtn = document.getElementById('export-btn');
    batchDeleteBtn = document.getElementById('batch-delete-btn');
    batchImportBtn = document.getElementById('batch-import-btn');
    batchExportBtn = document.getElementById('batch-export-btn');
    modal = document.getElementById('import-export-modal');
    modalTitle = document.getElementById('modal-title');
    importContent = document.getElementById('import-content');
    exportContent = document.getElementById('export-content');
    closeModalBtn = document.getElementById('close-modal-btn');
    confirmModalBtn = document.getElementById('confirm-modal-btn');
    importFile = document.getElementById('import-file');
    importText = document.getElementById('import-text');
    exportText = document.getElementById('export-text');
    copyExportBtn = document.getElementById('copy-export');
    downloadExportBtn = document.getElementById('download-export');

    // 立即显示当前时间作为初始状态
    updateTimeDisplay();

    // 确保loadCharacters函数在全局范围内可用
    window.loadCharacters = function() {
        const permanentCharactersList = document.getElementById('permanent-characters');
        const temporaryCharactersList = document.getElementById('temporary-characters');
        const currentWorldId = localStorage.getItem('currentWorldId');
        console.log('当前世界ID:', currentWorldId);
        
        if (!permanentCharactersList || !temporaryCharactersList) {
            console.error('角色列表元素不存在');
            return;
        }
        
        if (!currentWorldId) {
            permanentCharactersList.innerHTML = '<p>请先选择一个剧情世界</p>';
            temporaryCharactersList.innerHTML = '';
            return;
        }

        if (typeof storage === 'undefined') {
            console.error('存储服务不可用');
            permanentCharactersList.innerHTML = '<p>存储服务不可用</p>';
            temporaryCharactersList.innerHTML = '';
            return;
        }

        try {
            // 重置批量删除模式
            batchDeleteMode = false;
            window.batchDeleteMode = batchDeleteMode;
            if (batchDeleteBtn) {
                batchDeleteBtn.textContent = '批量删除';
            }
            selectedCharacters = [];

            const characters = storage.getCharactersByWorldId(currentWorldId);
            console.log('加载的角色数量:', characters.length);
            console.log('角色列表:', characters);

            permanentCharactersList.innerHTML = '';
            temporaryCharactersList.innerHTML = '';

            if (characters.length === 0) {
                permanentCharactersList.innerHTML = '<div style="display: inline-block; background-color: #f5f5f5; padding: 8px 16px; border-radius: 20px; margin: 4px; font-size: 14px; color: #9e9e9e;">暂无角色</div>';
                temporaryCharactersList.innerHTML = '<div style="display: inline-block; background-color: #f5f5f5; padding: 8px 16px; border-radius: 20px; margin: 4px; font-size: 14px; color: #9e9e9e;">暂无临时角色</div>';
                return;
            }

            const permanentCharacters = characters.filter(c => !c.isTemporary);
            const temporaryCharacters = characters.filter(c => c.isTemporary);

            // 显示固定角色
            if (permanentCharacters.length === 0) {
                permanentCharactersList.innerHTML = '<div style="display: inline-block; background-color: #f5f5f5; padding: 8px 16px; border-radius: 20px; margin: 4px; font-size: 14px; color: #9e9e9e;">暂无固定角色</div>';
            } else {
                permanentCharacters.forEach(character => {
                    console.log('固定角色信息:', character);
                    // 确保角色对象存在
                    if (!character || !character.id) {
                        console.warn('跳过无效角色:', character);
                        return;
                    }
                    
                    try {
                        const name = character.name || '未知角色';
                        const isMain = character.isMain || false;
                        
                        // 创建角色标签
                        const characterTag = document.createElement('div');
                        characterTag.style.cssText = `
                            display: inline-block;
                            background-color: #e3f2fd;
                            padding: 8px 16px;
                            border-radius: 20px;
                            margin: 4px;
                            font-size: 14px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                            border: 1px solid #90caf9;
                        `;
                        
                        // 为标签添加点击事件
                        characterTag.addEventListener('click', function() {
                            if (window.batchDeleteMode) {
                                // 在批量删除模式下，切换选择状态
                                this.classList.toggle('selected');
                                if (this.classList.contains('selected')) {
                                    this.style.backgroundColor = '#ffcdd2';
                                    selectedCharacters.push(character.id);
                                } else {
                                    this.style.backgroundColor = '#e3f2fd';
                                    selectedCharacters = selectedCharacters.filter(id => id !== character.id);
                                }
                            } else {
                                // 正常模式下，跳转到角色详情页面
                                window.location.href = `profile.html?id=${character.id}`;
                            }
                        });
                        
                        // 添加角色名字
                        characterTag.textContent = `${name} ${isMain ? '(主角)' : ''}`;
                        
                        // 添加到列表
                        permanentCharactersList.appendChild(characterTag);
                    } catch (error) {
                        console.error('创建固定角色标签失败:', error);
                        // 创建一个简单的错误标签
                        const errorTag = document.createElement('div');
                        errorTag.style.cssText = `
                            display: inline-block;
                            background-color: #ffebee;
                            padding: 8px 16px;
                            border-radius: 20px;
                            margin: 4px;
                            font-size: 14px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                        `;
                        errorTag.textContent = '角色加载错误';
                        permanentCharactersList.appendChild(errorTag);
                    }
                });
            }

            // 显示临时角色
            if (temporaryCharacters.length === 0) {
                temporaryCharactersList.innerHTML = '<div style="display: inline-block; background-color: #f5f5f5; padding: 8px 16px; border-radius: 20px; margin: 4px; font-size: 14px; color: #9e9e9e;">暂无临时角色</div>';
            } else {
                temporaryCharacters.forEach(character => {
                    console.log('临时角色信息:', character);
                    // 确保角色对象存在
                    if (!character || !character.id) {
                        console.warn('跳过无效角色:', character);
                        return;
                    }
                    
                    try {
                        const name = character.name || '未知角色';
                        
                        // 创建角色标签
                        const characterTag = document.createElement('div');
                        characterTag.style.cssText = `
                            display: inline-block;
                            background-color: #fff3e0;
                            padding: 8px 16px;
                            border-radius: 20px;
                            margin: 4px;
                            font-size: 14px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                            border: 1px dashed #ff9800;
                        `;
                        
                        // 为标签添加点击事件
                        characterTag.addEventListener('click', function() {
                            if (window.batchDeleteMode) {
                                // 在批量删除模式下，切换选择状态
                                this.classList.toggle('selected');
                                if (this.classList.contains('selected')) {
                                    this.style.backgroundColor = '#ffcdd2';
                                    selectedCharacters.push(character.id);
                                } else {
                                    this.style.backgroundColor = '#fff3e0';
                                    selectedCharacters = selectedCharacters.filter(id => id !== character.id);
                                }
                            } else {
                                // 正常模式下，跳转到角色详情页面
                                window.location.href = `profile.html?id=${character.id}`;
                            }
                        });
                        
                        // 添加角色名字
                        characterTag.textContent = `${name} (临时)`;
                        
                        // 添加到列表
                        temporaryCharactersList.appendChild(characterTag);
                    } catch (error) {
                        console.error('创建临时角色标签失败:', error);
                        // 创建一个简单的错误标签
                        const errorTag = document.createElement('div');
                        errorTag.style.cssText = `
                            display: inline-block;
                            background-color: #ffebee;
                            padding: 8px 16px;
                            border-radius: 20px;
                            margin: 4px;
                            font-size: 14px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                        `;
                        errorTag.textContent = '角色加载错误';
                        temporaryCharactersList.appendChild(errorTag);
                    }
                });
            }
        } catch (error) {
            console.error('加载角色失败:', error);
            permanentCharactersList.innerHTML = `<p>加载角色失败: ${error.message}</p>`;
            temporaryCharactersList.innerHTML = '';
        }
    }

    // 绑定事件
    batchDeleteBtn.addEventListener('click', batchDelete);
    batchImportBtn.addEventListener('click', () => {
        const roleType = document.getElementById('batch-role-type').value;
        openModal('import', roleType === 'all' ? '' : roleType);
    });
    batchExportBtn.addEventListener('click', () => {
        const roleType = document.getElementById('batch-role-type').value;
        openModal('export', roleType === 'all' ? '' : roleType);
    });
    closeModalBtn.addEventListener('click', closeModal);
    confirmModalBtn.addEventListener('click', confirmModal);
    copyExportBtn.addEventListener('click', copyExport);
    downloadExportBtn.addEventListener('click', downloadExport);
    importFile.addEventListener('change', handleFileImport);
    
    // 绑定导出相关事件
    const downloadSeparateBtn = document.getElementById('download-separate');
    if (downloadSeparateBtn) {
        downloadSeparateBtn.addEventListener('click', downloadSeparateCharacters);
    }
    
    // 为角色选择添加事件监听
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id && e.target.id.startsWith('character-')) {
            updateExportText();
        }
    });

    // 加载角色列表
    window.loadCharacters();

    // 更新时间显示
    updateTimeDisplay();
    
    // 加载小助手状态
    loadAssistantsStatus();
});

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

function updateTimeDisplay() {
    const currentWorldId = localStorage.getItem('currentWorldId');
    if (!currentWorldId) return;
    
    // 优先从世界数据中读取保存的时间
    let savedTime = null;
    const world = storage.getWorldById(currentWorldId);
    if (world && world.settings && world.settings.time) {
        savedTime = new Date(world.settings.time);
    }
    
    // 如果没有保存的时间，使用最新日记的日期
    if (!savedTime) {
        const latestDate = getLatestDiaryDate(currentWorldId);
        savedTime = latestDate || new Date();
    }
    
    const currentDate = savedTime;
    
    // 更新时间显示
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = currentDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

function getLatestDiaryDate(worldId) {
    // 获取所有角色的日记
    const allCharacters = storage.getCharactersByWorldId(worldId);
    let latestDate = null;
    
    // 查找最新的日记日期
    allCharacters.forEach(character => {
        if (character.diaries && character.diaries.length > 0) {
            character.diaries.forEach(diary => {
                const diaryDate = new Date(diary.date);
                if (!latestDate || diaryDate > latestDate) {
                    latestDate = diaryDate;
                }
            });
        }
    });
    
    return latestDate;
}

// 时间编辑相关函数
function editTime() {
    // 打开时间编辑模态框
    const modal = document.getElementById('time-edit-modal');
    const timeInput = document.getElementById('time-input');
    const currentTimeElement = document.getElementById('currentTime');
    
    if (modal && timeInput && currentTimeElement) {
        // 设置当前时间为默认值
        const currentTime = currentTimeElement.textContent;
        const currentDate = new Date(currentTime);
        const isoString = currentDate.toISOString().slice(0, 16); // 格式化为YYYY-MM-DDTHH:MM
        timeInput.value = isoString;
        
        modal.style.display = 'flex';
    }
}

function closeTimeModal() {
    // 关闭时间编辑模态框
    const modal = document.getElementById('time-edit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveTime() {
    // 保存编辑的时间
    const timeInput = document.getElementById('time-input');
    const modal = document.getElementById('time-edit-modal');
    const currentTimeElement = document.getElementById('currentTime');
    const currentWorldId = localStorage.getItem('currentWorldId');
    
    if (timeInput && timeInput.value && currentWorldId) {
        const newDate = new Date(timeInput.value);
        const formattedTime = newDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        if (currentTimeElement) {
            currentTimeElement.textContent = formattedTime;
        }
        
        // 保存时间到世界数据中
        const world = storage.getWorldById(currentWorldId);
        if (world) {
            world.settings = world.settings || {};
            world.settings.time = newDate.toISOString();
            storage.saveWorld(world);
        }
    }
    
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示消息函数
function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        padding: 10px;
        background-color: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
        color: #2563eb;
        font-size: 14px;
    `;

    const container = document.querySelector('.main-content') || document.body;
    container.appendChild(messageElement);

    // 3秒后自动移除消息
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// 确保deleteCharacter函数在全局范围内可用
window.deleteCharacter = function(id) {
    if (typeof storage === 'undefined') {
        showMessage('存储服务不可用');
        return;
    }
    
    if (confirm('确定要删除这个角色吗？')) {
        const success = storage.deleteCharacter(id);
        if (success) {
            showMessage('角色删除成功！');
            window.loadCharacters();
        } else {
            showMessage('角色删除失败，可能是因为这是主角角色卡。');
        }
    }
}

function batchDelete() {
    const currentWorldId = localStorage.getItem('currentWorldId');
    if (!currentWorldId) return;

    if (typeof storage === 'undefined') {
        alert('存储服务不可用');
        return;
    }

    const roleType = document.getElementById('batch-role-type').value;
    let characters = storage.getCharactersByWorldId(currentWorldId);
    
    // 根据角色类型筛选
    if (roleType === 'permanent') {
        characters = characters.filter(c => !c.isTemporary);
    } else if (roleType === 'temporary') {
        characters = characters.filter(c => c.isTemporary);
    }
    
    const nonMainCharacters = characters.filter(c => !c.isMain);

    if (nonMainCharacters.length === 0) {
        let message = '没有可删除的角色（主角角色卡不可删除）';
        if (roleType === 'permanent') {
            message = '没有可删除的固定角色（主角角色卡不可删除）';
        } else if (roleType === 'temporary') {
            message = '没有可删除的临时角色';
        }
        alert(message);
        return;
    }

    // 切换批量删除模式
    batchDeleteMode = !batchDeleteMode;
    window.batchDeleteMode = batchDeleteMode;

    if (batchDeleteMode) {
        // 进入批量删除模式
        batchDeleteBtn.textContent = '确认删除';
        selectedCharacters = [];
        let message = '请点击选择要删除的角色，然后再次点击"确认删除"按钮';
        if (roleType === 'permanent') {
            message = '请点击选择要删除的固定角色，然后再次点击"确认删除"按钮';
        } else if (roleType === 'temporary') {
            message = '请点击选择要删除的临时角色，然后再次点击"确认删除"按钮';
        }
        showMessage(message);
    } else {
        // 退出批量删除模式，执行删除
        if (selectedCharacters.length === 0) {
            showMessage('请选择要删除的角色');
            batchDeleteBtn.textContent = '批量删除';
            return;
        }

        // 过滤掉主角角色和不符合类型的角色
        const filteredSelectedCharacters = selectedCharacters.filter(id => {
            const character = storage.getCharacterById(id);
            if (!character || character.isMain) return false;
            
            // 根据角色类型筛选
            if (roleType === 'permanent' && character.isTemporary) return false;
            if (roleType === 'temporary' && !character.isTemporary) return false;
            
            return true;
        });

        if (filteredSelectedCharacters.length === 0) {
            let message = '没有可删除的角色（主角角色卡不可删除）';
            if (roleType === 'permanent') {
                message = '没有可删除的固定角色（主角角色卡不可删除）';
            } else if (roleType === 'temporary') {
                message = '没有可删除的临时角色';
            }
            showMessage(message);
            batchDeleteBtn.textContent = '批量删除';
            return;
        }

        // 获取选中角色的名字
        const characterNames = filteredSelectedCharacters.map(id => {
            const character = storage.getCharacterById(id);
            return character ? character.name : '未知角色';
        }).join(', ');

        if (confirm(`确定要删除以下角色吗？\n${characterNames}`)) {
            const success = storage.batchDeleteCharacters(filteredSelectedCharacters);
            if (success) {
                showMessage('角色删除成功！');
                window.loadCharacters();
            } else {
                showMessage('角色删除失败');
            }
        }

        // 恢复按钮文本
        batchDeleteBtn.textContent = '批量删除';
    }
}

function openModal(mode, roleType = '') {
    currentMode = mode;
    currentRoleType = roleType;
    
    let title = mode === 'import' ? '导入' : '导出';
    if (roleType === 'permanent') {
        title += '固定角色';
    } else if (roleType === 'temporary') {
        title += '临时角色';
    } else {
        title += '角色';
    }
    
    modalTitle.textContent = title;
    importContent.style.display = mode === 'import' ? 'block' : 'none';
    exportContent.style.display = mode === 'export' ? 'block' : 'none';

    if (mode === 'export') {
        exportCharacters(roleType);
    } else {
        // 重置导入区域
        importFile.value = '';
        importText.value = '';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

async function confirmModal() {
    if (currentMode === 'import') {
        await importCharacters();
    } else if (currentMode === 'export') {
        // 导出已经在openModal时处理了
    }
    closeModal();
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            importText.value = e.target.result;
        };
        reader.readAsText(file);
    }
}

async function importCharacters() {
    const currentWorldId = localStorage.getItem('currentWorldId');
    if (!currentWorldId) {
        showMessage('请先选择一个剧情世界');
        return;
    }

    if (typeof storage === 'undefined') {
        showMessage('存储服务不可用');
        return;
    }

    let jsonData = importText.value.trim();
    if (!jsonData) {
        showMessage('请输入或选择要导入的JSON数据');
        return;
    }

    try {
        const data = JSON.parse(jsonData);
        // 支持多种导入格式
        let characters = [];
        if (data.characters) {
            characters = data.characters;
        } else if (Array.isArray(data)) {
            characters = data;
        } else {
            characters = [data];
        }

        const world = storage.getWorldById(currentWorldId);
        if (!world) {
            showMessage('剧情世界不存在');
            return;
        }

        let importedCount = 0;
        for (const character of characters) {
            // 生成新的ID以避免冲突
            character.id = `character_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            character.isMain = false; // 导入的角色默认为非主角
            
            // 根据当前角色类型设置isTemporary属性
            if (currentRoleType === 'permanent') {
                character.isTemporary = false;
            } else if (currentRoleType === 'temporary') {
                character.isTemporary = true;
            }
            
            // 确保角色对象结构完整
            if (!character.profile) {
                character.profile = {
                    description: '无描述',
                    personality: '无',
                    background: '无',
                    relationships: [],
                    sceneExamples: '无',
                    notes: '无',
                    tags: []
                };
            } else {
                // 确保profile的必要属性存在
                character.profile.description = character.profile.description || '无描述';
                character.profile.personality = character.profile.personality || '无';
                character.profile.background = character.profile.background || '无';
                character.profile.relationships = character.profile.relationships || [];
                character.profile.sceneExamples = character.profile.sceneExamples || '无';
                character.profile.notes = character.profile.notes || '无';
                character.profile.tags = character.profile.tags || [];
            }

            // 保存角色
            const saved = storage.saveCharacter(character);
            if (!saved) {
                throw new Error('保存角色失败');
            }

            // 将角色添加到世界
            if (!world.characters.includes(character.id)) {
                world.characters.push(character.id);
            }

            importedCount++;
        }

        // 保存世界
        const worldSaved = storage.saveWorld(world);
        if (!worldSaved) {
            throw new Error('保存世界失败');
        }

        let roleTypeText = '';
        if (currentRoleType === 'permanent') {
            roleTypeText = '固定';
        } else if (currentRoleType === 'temporary') {
            roleTypeText = '临时';
        }
        
        showMessage(`成功导入 ${importedCount} 个${roleTypeText}角色`);
        window.loadCharacters();
    } catch (error) {
        console.error('导入失败:', error);
        showMessage('导入失败，请检查JSON格式是否正确');
    }
}

function exportCharacters(roleType = '') {
    const currentWorldId = localStorage.getItem('currentWorldId');
    if (!currentWorldId) {
        showMessage('请先选择一个剧情世界');
        return;
    }

    if (typeof storage === 'undefined') {
        showMessage('存储服务不可用');
        return;
    }

    const characters = storage.getCharactersByWorldId(currentWorldId);
    let filteredCharacters = characters;
    
    // 根据角色类型筛选
    if (roleType === 'permanent') {
        filteredCharacters = characters.filter(c => !c.isTemporary);
    } else if (roleType === 'temporary') {
        filteredCharacters = characters.filter(c => c.isTemporary);
    }
    
    // 生成角色选择界面
    const characterListElement = document.getElementById('character-list');
    if (characterListElement) {
        characterListElement.innerHTML = '';
        
        if (filteredCharacters.length === 0) {
            characterListElement.innerHTML = '<p>暂无角色可导出</p>';
            return;
        }
        
        filteredCharacters.forEach(character => {
            const characterItem = document.createElement('div');
            characterItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm);
                border-bottom: 1px solid var(--border-color);
            `;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `character-${character.id}`;
            checkbox.value = character.id;
            checkbox.checked = true;
            
            const label = document.createElement('label');
            label.htmlFor = `character-${character.id}`;
            label.textContent = `${character.name} ${character.isTemporary ? '(临时)' : ''} ${character.isMain ? '(主角)' : ''}`;
            
            characterItem.appendChild(checkbox);
            characterItem.appendChild(label);
            characterListElement.appendChild(characterItem);
        });
    }
    
    // 默认导出所有筛选后的角色
    updateExportText();
}

function updateExportText() {
    const selectedCharacterIds = getSelectedCharacterIds();
    if (selectedCharacterIds.length === 0) {
        exportText.value = '请选择要导出的角色';
        return;
    }
    
    const characters = selectedCharacterIds.map(id => storage.getCharacterById(id)).filter(Boolean);
    
    const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        characters: characters
    };

    exportText.value = JSON.stringify(exportData, null, 2);
}

function getSelectedCharacterIds() {
    const checkboxes = document.querySelectorAll('#character-list input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function downloadSeparateCharacters() {
    const selectedCharacterIds = getSelectedCharacterIds();
    if (selectedCharacterIds.length === 0) {
        showMessage('请选择要导出的角色');
        return;
    }
    
    selectedCharacterIds.forEach(id => {
        const character = storage.getCharacterById(id);
        if (character) {
            const exportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                character: character
            };
            
            const content = JSON.stringify(exportData, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `character_${character.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    });
    
    showMessage(`成功下载 ${selectedCharacterIds.length} 个角色文件`);
}

function copyExport() {
    exportText.select();
    document.execCommand('copy');
    showMessage('已复制到剪贴板');
}

function downloadExport() {
    const content = exportText.value;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characters_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}