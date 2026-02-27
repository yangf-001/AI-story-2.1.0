document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('back-btn');
    const addStoryBtn = document.getElementById('add-story-btn');
    const storiesEditor = document.getElementById('stories-editor');
    const storiesTags = document.getElementById('stories-tags');

    let stories = [];

    // 初始化页面
    initPage();

    // 绑定事件
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    if (addStoryBtn) {
        addStoryBtn.addEventListener('click', addStory);
    }

    function initPage() {
        // 获取当前世界ID
        const currentWorldId = localStorage.getItem('currentWorldId');

        // 加载故事记录
        if (currentWorldId) {
            stories = storage.getStoriesByWorldId(currentWorldId) || [];
        } else {
            stories = [];
        }
        if (storiesEditor) {
            renderStories();
        }
        if (storiesTags) {
            renderStoriesTags();
        }
    }
    
    function renderStoriesTags() {
        if (!storiesTags) return;
        
        storiesTags.innerHTML = '';
        
        if (stories.length === 0) {
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
            noStoriesTag.textContent = '暂无故事记录';
            storiesTags.appendChild(noStoriesTag);
            return;
        }
        
        stories.forEach(story => {
            try {
                const name = story.name || '未知故事';
                const date = story.startTime ? new Date(story.startTime).toLocaleDateString('zh-CN') : '未知日期';
                
                // 创建故事记录标签
                const storyTag = document.createElement('div');
                storyTag.style.cssText = `
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
                storyTag.addEventListener('click', function() {
                    // 点击标签时，将故事内容填充到编辑区域
                    fillStoryEditor(story);
                });
                
                // 添加故事名字和日期
                storyTag.textContent = `${name} (${date})`;
                
                // 添加到标签列表
                storiesTags.appendChild(storyTag);
                
                // 渲染故事中的场景标签
                if (story.scenes && story.scenes.length > 0) {
                    story.scenes.forEach(scene => {
                        try {
                            const sceneName = scene.scene || '未知场景';
                            const sceneDate = scene.timestamp ? new Date(scene.timestamp).toLocaleDateString('zh-CN') : '未知日期';
                            
                            // 创建场景标签
                            const sceneTag = document.createElement('div');
                            sceneTag.style.cssText = `
                                display: inline-block;
                                background-color: #e8f5e8;
                                padding: 6px 12px;
                                border-radius: 16px;
                                margin: 2px;
                                font-size: 12px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                position: relative;
                                border: 1px solid #81c784;
                            `;
                            
                            // 为标签添加点击事件
                            sceneTag.addEventListener('click', function() {
                                // 点击标签时，将场景内容填充到编辑区域
                                fillSceneEditor(scene, story);
                            });
                            
                            // 添加场景名字和日期
                            sceneTag.textContent = `${sceneName} (${sceneDate})`;
                            
                            // 添加到标签列表
                            storiesTags.appendChild(sceneTag);
                        } catch (error) {
                            console.error('创建场景标签失败:', error);
                        }
                    });
                }
            } catch (error) {
                console.error('创建故事记录标签失败:', error);
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
                errorTag.textContent = '故事记录加载错误';
                storiesTags.appendChild(errorTag);
            }
        });
    }
    
    function fillSceneEditor(scene, story) {
        if (!storiesEditor) return;
        
        // 清空编辑区域
        storiesEditor.innerHTML = '';
        
        // 构建场景内容
        let sceneContent = '';
        scene.messages.forEach(msg => {
            if (msg.type !== 'system') {
                sceneContent += `${msg.sender}: ${msg.content}\n`;
            }
        });
        
        // 创建编辑表单
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.style.cssText = `
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            padding: var(--spacing-lg);
            margin-bottom: var(--spacing-lg);
            box-shadow: var(--shadow-sm);
            transition: var(--transition-all);
        `;
        storyItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: flex-start;">
                <div style="flex: 1;">
                    <textarea placeholder="故事内容" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); resize: vertical; min-height: 150px;">${sceneContent.trim()}</textarea>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                    <input type="text" placeholder="故事名称" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); width: 200px;" value="${story.name || '未知故事'}">
                    <input type="date" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); width: 200px;" value="${scene.timestamp ? new Date(scene.timestamp).toISOString().split('T')[0] : ''}">
                    <button type="button" class="btn-outline btn-sm delete-story-btn">删除</button>
                    <button type="button" class="btn-primary btn-sm save-story-btn">保存</button>
                </div>
            </div>
        `;
        storiesEditor.appendChild(storyItem);
    }
    
    function fillStoryEditor(story) {
        if (!storiesEditor) return;
        
        // 清空编辑区域
        storiesEditor.innerHTML = '';
        
        // 添加故事编辑表单
        addStory(story);
    }

    function goBack() {
        window.location.href = '../world-management/index.html';
    }

    function saveStories() {
        // 获取当前世界ID
        const currentWorldId = localStorage.getItem('currentWorldId');

        if (!currentWorldId) {
            alert('请先创建或选择一个世界，然后再保存故事记录');
            window.location.href = '../../main/index.html';
            return;
        }

        // 收集故事记录数据
        const updatedStories = getStories();

        // 保存故事记录
        const world = storage.getWorldById(currentWorldId);
        if (world) {
            // 确保world.stories是数组
            if (!world.stories || !Array.isArray(world.stories)) {
                world.stories = [];
            }
            
            // 清除旧的故事记录ID
            world.stories = [];

            // 保存新的故事记录
            updatedStories.forEach(story => {
                storage.saveStory(story);
                world.stories.push(story.id);
            });

            // 保存世界数据
            const worldSaved = storage.saveWorld(world);
            if (worldSaved) {
                alert('故事记录保存成功！');
                // 重新加载故事记录并渲染标签
                stories = storage.getStoriesByWorldId(currentWorldId) || [];
                if (storiesTags) {
                    renderStoriesTags();
                }
                // 不需要重新渲染故事卡片，保持当前DOM状态
                // 不需要跳转到其他页面，保持在当前页面
            } else {
                alert('保存失败，请重试');
            }
        } else {
            alert('世界不存在，请先创建世界');
            window.location.href = '../../main/index.html';
        }
    }

    function renderStories() {
        if (!storiesEditor) return;
        
        storiesEditor.innerHTML = '';

        if (stories.length === 0) {
            addStory();
            return;
        }

        stories.forEach(story => {
            addStory(story);
        });
    }

    function addStory(story = null) {
        if (!storiesEditor) return;
        
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.style.cssText = `
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            padding: var(--spacing-lg);
            margin-bottom: var(--spacing-lg);
            box-shadow: var(--shadow-sm);
            transition: var(--transition-all);
        `;
        storyItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: flex-start;">
                <div style="flex: 1;">
                    <textarea placeholder="故事内容" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); resize: vertical; min-height: 150px;">${story?.messages ? story.messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n') : ''}</textarea>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                    <input type="text" placeholder="故事名称" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); width: 200px;" value="${story?.name || ''}">
                    <input type="date" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); width: 200px;" value="${story?.startTime ? new Date(story.startTime).toISOString().split('T')[0] : ''}">
                    <button type="button" class="btn-outline btn-sm delete-story-btn">删除</button>
                    <button type="button" class="btn-primary btn-sm save-story-btn">保存</button>
                </div>
            </div>
        `;
        storiesEditor.appendChild(storyItem);
    }

    // 事件委托处理按钮点击
    if (storiesEditor) {
        storiesEditor.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-story-btn')) {
                if (confirm('确定要删除这个故事记录吗？此操作不可恢复。')) {
                    e.target.closest('.story-item').remove();
                    // 保存更新后的故事记录
                    saveStories();
                }
            } else if (e.target.classList.contains('save-story-btn')) {
                saveStories();
            }
        });
    }

    function getStories() {
        const stories = [];
        const storyItems = document.querySelectorAll('.story-item');
        storyItems.forEach((item, index) => {
            const nameInput = item.querySelector('input[type="text"]');
            const dateInput = item.querySelector('input[type="date"]');
            const contentInput = item.querySelector('textarea');
            
            // 只收集有故事内容的卡片
            if (contentInput.value.trim()) {
                const story = {
                    id: `story_${Date.now()}_${index}`,
                    name: nameInput.value.trim() || `故事会话 ${index + 1}`,
                    worldId: localStorage.getItem('currentWorldId'),
                    startTime: dateInput.value ? new Date(dateInput.value).toISOString() : new Date().toISOString(),
                    endTime: null,
                    messages: [],
                    narrationSettings: {
                        style: '描述性',
                        format: '段落'
                    }
                };
                
                // 解析故事内容为消息
                const content = contentInput.value.trim();
                if (content) {
                    const lines = content.split('\n');
                    lines.forEach(line => {
                        const parts = line.split(': ');
                        if (parts.length >= 2) {
                            story.messages.push({
                                id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                                sender: parts[0],
                                content: parts.slice(1).join(': '),
                                type: 'character',
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                }
                
                stories.push(story);
            }
        });
        return stories;
    }
});