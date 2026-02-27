// 故事档案管理

let currentWorldId = localStorage.getItem('currentWorldId');

// 切换档案项展开/收起状态
function toggleArchiveItem(archiveId) {
    const archiveItem = document.querySelector(`.story-archive-item[data-id="${archiveId}"]`);
    if (archiveItem) {
        const content = archiveItem.querySelector('.story-archive-content');
        const meta = archiveItem.querySelector('.story-archive-meta');
        const icon = archiveItem.querySelector('.expand-icon');
        
        if (content && meta && icon) {
            content.classList.toggle('expanded');
            meta.classList.toggle('expanded');
            icon.classList.toggle('expanded');
        }
    }
}

// 初始化
function init() {
    if (!currentWorldId) {
        window.location.href = '../../main/index.html';
        return;
    }
    
    updateCurrentTime();
    loadStoryArchive();
    bindEvents();
    loadAssistantsStatus();
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

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString('zh-CN');
}

// 编辑时间
function editTime() {
    const now = new Date();
    const formattedTime = now.toISOString().slice(0, 16);
    document.getElementById('time-input').value = formattedTime;
    document.getElementById('time-edit-modal').style.display = 'flex';
}

// 关闭时间编辑模态框
function closeTimeModal() {
    document.getElementById('time-edit-modal').style.display = 'none';
}

// 保存时间
function saveTime() {
    const timeInput = document.getElementById('time-input');
    const selectedTime = new Date(timeInput.value);
    
    if (!isNaN(selectedTime.getTime())) {
        // 这里可以添加时间保存逻辑
        updateCurrentTime();
        closeTimeModal();
    }
}

// 绑定事件
function bindEvents() {
    // 批量删除按钮
    document.getElementById('batch-delete-btn').addEventListener('click', batchDeleteArchive);
    
    // 导出档案按钮
    document.getElementById('batch-export-btn').addEventListener('click', exportArchive);
    
    // 复制导出内容按钮
    document.getElementById('copy-export').addEventListener('click', copyExportContent);
    
    // 下载导出文件按钮
    document.getElementById('download-export').addEventListener('click', downloadExportFile);
    
    // 关闭导出模态框按钮
    document.getElementById('close-export-modal').addEventListener('click', closeExportModal);
}

// 加载故事档案
function loadStoryArchive() {
    const archiveList = document.getElementById('story-archive-list');
    
    // 从存储中获取所有故事
    const stories = storage.getStoriesByWorldId(currentWorldId) || [];
    
    // 收集所有故事档案
        let allArchiveItems = [];
        
        stories.forEach(story => {
            // 确保故事有archive属性
            if (story.archive && story.archive.length > 0) {
                story.archive.forEach(archiveItem => {
                    // 只添加日记类型的档案项
                    if (archiveItem.summary === '故事日记') {
                        allArchiveItems.push({
                            ...archiveItem,
                            storyId: story.id,
                            storyName: story.name || `故事 ${new Date(story.startTime || Date.now()).toLocaleString('zh-CN')}`
                        });
                    }
                });
            }
        });
    
    // 按时间倒序排序
    allArchiveItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (allArchiveItems.length === 0) {
        archiveList.innerHTML = `
            <div class="empty-archive">
                <p>暂无故事档案</p>
            </div>
        `;
    } else {
        // 渲染档案列表
        archiveList.innerHTML = allArchiveItems.map(item => {
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleString('zh-CN');
            
            return `
                <div class="story-archive-item" data-id="${item.id}">
                    <div class="story-archive-header" onclick="toggleArchiveItem('${item.id}')">
                        <div class="story-archive-title">${item.summary}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="story-archive-time">${timeString}</div>
                            <svg class="expand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="story-archive-content">${item.content}</div>
                    <div class="story-archive-meta">
                        <span>来自: ${item.storyName}</span>
                        <button class="btn-sm btn-outline" onclick="deleteArchiveItem('${item.storyId}', '${item.id}')">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 渲染故事档案标签
    renderStoriesTags(allArchiveItems);
}

// 渲染故事档案标签
    function renderStoriesTags(archiveItems) {
        const storiesTags = document.getElementById('stories-tags');
        if (!storiesTags) return;
        
        storiesTags.innerHTML = '';
        
        if (archiveItems.length === 0) {
            const noStoriesTag = document.createElement('div');
            noStoriesTag.style.cssText = `
                display: inline-block;
                background-color: #f5f5f5;
                padding: 8px 16px;
                border-radius: 20px;
                margin: 4px;
                font-size: 14px;
                color: #9e9e9e;
            `;
            noStoriesTag.textContent = '暂无故事档案';
            storiesTags.appendChild(noStoriesTag);
            return;
        }
        
        archiveItems.forEach(item => {
            try {
                const summary = item.summary || '未知档案';
                const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString('zh-CN') : '未知日期';
                
                // 只显示日记类型的标签
                if (summary === '故事日记') {
                    // 创建故事档案标签
                    const archiveTag = document.createElement('div');
                    archiveTag.style.cssText = `
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
                    archiveTag.addEventListener('click', function() {
                        // 点击标签时，滚动到对应的档案项
                        scrollToArchiveItem(item.id);
                    });
                    
                    // 添加档案摘要和日期
                    archiveTag.textContent = `${summary} (${date})`;
                    
                    // 添加到标签列表
                    storiesTags.appendChild(archiveTag);
                }
            } catch (error) {
                console.error('创建故事档案标签失败:', error);
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
                errorTag.textContent = '档案加载错误';
                storiesTags.appendChild(errorTag);
            }
        });
    }

// 滚动到对应的档案项
function scrollToArchiveItem(archiveId) {
    const archiveItem = document.querySelector(`.story-archive-item[data-id="${archiveId}"]`);
    if (archiveItem) {
        archiveItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 添加高亮效果
        archiveItem.style.backgroundColor = '#e3f2fd';
        setTimeout(() => {
            archiveItem.style.backgroundColor = '';
        }, 1000);
    }
}

// 刷新档案
function refreshArchive() {
    loadStoryArchive();
}

// 清空日记
function clearArchive() {
    if (confirm('确定要清空所有故事日记吗？此操作不可恢复。')) {
        // 从所有故事中移除日记类型的档案
        const stories = storage.getStoriesByWorldId(currentWorldId) || [];
        
        stories.forEach(story => {
            if (story.archive) {
                // 只保留非日记类型的档案项
                story.archive = story.archive.filter(item => item.summary !== '故事日记');
                storage.saveStory(story);
            }
        });
        
        loadStoryArchive();
        alert('所有故事日记已清空');
    }
}

// 批量删除日记
function batchDeleteArchive() {
    if (confirm('确定要批量删除故事日记吗？此操作不可恢复。')) {
        // 这里可以实现批量删除逻辑
        // 例如，让用户选择要删除的日记
        alert('批量删除功能开发中');
    }
}

// 删除单个日记
function deleteArchiveItem(storyId, archiveId) {
    if (confirm('确定要删除这个故事日记吗？此操作不可恢复。')) {
        const story = storage.getStoryById(storyId);
        if (story && story.archive) {
            story.archive = story.archive.filter(item => item.id !== archiveId);
            storage.saveStory(story);
            loadStoryArchive();
        }
    }
}

// 导出日记
function exportArchive() {
    // 从存储中获取所有故事
    const stories = storage.getStoriesByWorldId(currentWorldId) || [];
    
    // 收集所有故事日记
    let allArchiveItems = [];
    
    stories.forEach(story => {
        if (story.archive && story.archive.length > 0) {
            story.archive.forEach(archiveItem => {
                // 只导出日记类型的档案项
                if (archiveItem.summary === '故事日记') {
                    allArchiveItems.push({
                        ...archiveItem,
                        storyId: story.id,
                        storyName: `故事 ${new Date(story.startTime).toLocaleString('zh-CN')}`,
                        storyStartTime: story.startTime,
                        storyEndTime: story.endTime
                    });
                }
            });
        }
    });
    
    // 按时间倒序排序
    allArchiveItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 转换为JSON字符串
    const exportData = JSON.stringify(allArchiveItems, null, 2);
    
    // 显示导出模态框
    document.getElementById('export-text').value = exportData;
    document.getElementById('export-modal').style.display = 'flex';
}

// 复制导出内容
function copyExportContent() {
    const exportText = document.getElementById('export-text');
    exportText.select();
    document.execCommand('copy');
    alert('已复制到剪贴板');
}

// 下载导出文件
function downloadExportFile() {
    const exportText = document.getElementById('export-text').value;
    const blob = new Blob([exportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 关闭导出模态框
function closeExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

// 初始化
init();