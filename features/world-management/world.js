document.addEventListener('DOMContentLoaded', function() {
    // 获取当前世界ID
    const currentWorldId = localStorage.getItem('currentWorldId');

    if (!currentWorldId) {
        // 如果没有世界ID，返回主页面
        window.location.href = '../../main/index.html';
        return;
    }

    // 立即显示最新日记的日期作为初始状态
    updateTimeDisplay(currentWorldId);

    // 加载世界数据
    loadWorldData(currentWorldId);

    // 加载角色列表
    loadCharacters(currentWorldId);

    // 加载故事记录
    loadStories(currentWorldId);

    // 加载统计数据
    loadStats(currentWorldId);

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

function updateTimeDisplay(worldId) {
    // 优先从世界数据中读取保存的时间
    let savedTime = null;
    const world = storage.getWorldById(worldId);
    if (world && world.settings && world.settings.time) {
        savedTime = new Date(world.settings.time);
    }
    
    // 如果没有保存的时间，使用最新日记的日期
    if (!savedTime) {
        const latestDate = getLatestDiaryDate(worldId);
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
    
    // 更新页脚时间
    const footerTimeElement = document.getElementById('footer-time');
    if (footerTimeElement) {
        footerTimeElement.textContent = currentDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
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
    const footerTimeElement = document.getElementById('footer-time');
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
        
        if (footerTimeElement) {
            footerTimeElement.textContent = newDate.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
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

function loadWorldData(worldId) {
    const world = storage.getWorldById(worldId);

    if (!world) {
        console.error('世界数据不存在');
        return;
    }

    // 更新页面标题和世界信息
    document.getElementById('world-name').textContent = world.name;
    document.getElementById('world-name-display').textContent = world.name;
    document.getElementById('world-created').textContent = world.settings.time || '未知';
    document.getElementById('world-time').textContent = world.settings.time || '未知';
    document.getElementById('world-background').textContent = world.settings.background || '无';
    document.getElementById('world-worldview').textContent = world.settings.worldview || '无';
    document.getElementById('world-story-rules').textContent = world.settings.storyRules || '无';
    const footerTimeElement = document.getElementById('footer-time');
    if (footerTimeElement) {
        footerTimeElement.textContent = world.settings.time || '未知';
    }
}

function loadCharacters(worldId) {
    const characters = storage.getCharactersByWorldId(worldId);
    const charactersList = document.getElementById('characters-list');

    if (!charactersList) return;

    charactersList.innerHTML = '';

    if (characters.length === 0) {
        charactersList.innerHTML = '<div style="display: inline-block; background-color: #f5f5f5; padding: 8px 16px; border-radius: 20px; margin: 4px; font-size: 14px; color: #9e9e9e;">暂无角色</div>';
        return;
    }

    characters.forEach(character => {
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
        `;
        
        // 为标签添加点击事件
        characterTag.addEventListener('click', function() {
            window.location.href = `../character/profile.html?id=${character.id}`;
        });
        
        // 添加角色名字
        characterTag.textContent = `${character.name} ${character.isMain ? '(主角)' : ''}`;
        
        // 添加到列表
        charactersList.appendChild(characterTag);
    });

    // 更新角色数量统计
    document.getElementById('stats-characters').textContent = characters.length;
}

function loadStories(worldId) {
    const recentStories = storage.getRecentStories();
    // 过滤当前世界的故事
    const worldStories = recentStories.filter(story => story.worldId === worldId);
    const noStories = document.getElementById('no-stories');
    const storiesList = document.getElementById('stories-list');

    if (!noStories || !storiesList) return;

    // 清空故事列表
    storiesList.innerHTML = '';

    if (worldStories.length === 0) {
        storiesList.innerHTML = '<p id="no-stories">暂无故事记录</p>';
    } else {
        // 按时间倒序排序
        worldStories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // 生成故事记录
        worldStories.forEach(story => {
            const storyItem = document.createElement('div');
            storyItem.style.cssText = `
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
                transition: all 0.3s ease;
            `;

            // 故事标题和时间
            const storyHeader = document.createElement('div');
            storyHeader.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            `;

            const storyTitle = document.createElement('h4');
            storyTitle.style.cssText = `
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
            `;
            storyTitle.textContent = `故事记录 ${new Date(story.timestamp).toLocaleString('zh-CN')}`;

            const storyTime = document.createElement('span');
            storyTime.style.cssText = `
                font-size: 0.8rem;
                color: #6c757d;
            `;
            storyTime.textContent = new Date(story.timestamp).toLocaleString('zh-CN');

            storyHeader.appendChild(storyTitle);
            storyHeader.appendChild(storyTime);

            storyItem.appendChild(storyHeader);
            
            storiesList.appendChild(storyItem);
        });
    }

    // 更新统计数据
    document.getElementById('stats-stories').textContent = worldStories.length;
}

function loadStats(worldId) {
    const characters = storage.getCharactersByWorldId(worldId);
    let diariesCount = 0;
    let eventsCount = 0;

    // 计算日记和事件数量
    characters.forEach(character => {
        if (character.diaries) {
            diariesCount += character.diaries.length;
        }
        if (character.events) {
            eventsCount += (character.events.pending ? character.events.pending.length : 0) + (character.events.completed ? character.events.completed.length : 0);
        }
    });

    // 更新统计数据
    document.getElementById('stats-diaries').textContent = diariesCount;
    document.getElementById('stats-events').textContent = eventsCount;
}

// 确保editStories函数在全局作用域中可用
window.editStories = function() {
    window.location.href = '../story/edit.html';
};

// 世界信息编辑相关函数
function editWorldInfo() {
    // 打开世界信息编辑模态框
    const modal = document.getElementById('world-edit-modal');
    const worldNameInput = document.getElementById('edit-world-name');
    const worldBackgroundInput = document.getElementById('edit-world-background');
    const worldWorldviewInput = document.getElementById('edit-world-worldview');
        const worldStoryRulesInput = document.getElementById('edit-world-story-rules');
        const currentWorldId = localStorage.getItem('currentWorldId');
    
    if (modal && worldNameInput && worldBackgroundInput && worldWorldviewInput && worldStoryRulesInput && currentWorldId) {
        // 获取当前世界数据
        const world = storage.getWorldById(currentWorldId);
        if (world) {
            // 填充表单数据
            worldNameInput.value = world.name || '';
            worldBackgroundInput.value = world.settings?.background || '';
            worldWorldviewInput.value = world.settings?.worldview || '';
            worldStoryRulesInput.value = world.settings?.storyRules || '';
        }
        
        modal.style.display = 'flex';
    }
}

function closeWorldEditModal() {
    // 关闭世界信息编辑模态框
    const modal = document.getElementById('world-edit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveWorldInfo() {
    // 保存编辑的世界信息
    const worldNameInput = document.getElementById('edit-world-name');
    const worldBackgroundInput = document.getElementById('edit-world-background');
    const worldWorldviewInput = document.getElementById('edit-world-worldview');
    const worldStoryRulesInput = document.getElementById('edit-world-story-rules');
    const modal = document.getElementById('world-edit-modal');
    const currentWorldId = localStorage.getItem('currentWorldId');
    
    if (worldNameInput && worldBackgroundInput && worldWorldviewInput && worldStoryRulesInput && currentWorldId) {
        // 获取当前世界数据
        const world = storage.getWorldById(currentWorldId);
        if (world) {
            // 更新世界信息
            world.name = worldNameInput.value.trim() || '未命名世界';
            world.settings = world.settings || {};
            world.settings.background = worldBackgroundInput.value.trim();
            world.settings.worldview = worldWorldviewInput.value.trim();
            world.settings.storyRules = worldStoryRulesInput.value.trim();
            
            // 保存到存储
            storage.saveWorld(world);
            
            // 重新加载世界数据以更新页面显示
            loadWorldData(currentWorldId);
        }
    }
    
    if (modal) {
        modal.style.display = 'none';
    }
}

// 确保编辑函数在全局作用域中可用
window.editWorldInfo = editWorldInfo;
window.closeWorldEditModal = closeWorldEditModal;
window.saveWorldInfo = saveWorldInfo;

// 展开/收起功能
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
};

// 下拉菜单展开/收起功能
window.toggleDropdown = function(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};