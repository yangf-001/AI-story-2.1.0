document.addEventListener('DOMContentLoaded', function() {
    const characterName = document.getElementById('character-name');
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const importFixedBtn = document.getElementById('import-fixed-btn');
    const exportFixedBtn = document.getElementById('export-fixed-btn');
    const exportDynamicBtn = document.getElementById('export-dynamic-btn');
    
    // 固定人设元素
    const fixedProfileDescription = document.getElementById('fixed-profile-description');
    const fixedProfilePersonality = document.getElementById('fixed-profile-personality');
    const fixedProfileBackground = document.getElementById('fixed-profile-background');
    const fixedProfileRelationships = document.getElementById('fixed-profile-relationships');
    const fixedProfileSceneExamples = document.getElementById('fixed-profile-scene-examples');
    const fixedProfileNotes = document.getElementById('fixed-profile-notes');
    const fixedProfileTags = document.getElementById('fixed-profile-tags');
    
    // 流动人设元素
    const dynamicProfileDescription = document.getElementById('dynamic-profile-description');
    const dynamicProfilePersonality = document.getElementById('dynamic-profile-personality');
    const dynamicProfileBackground = document.getElementById('dynamic-profile-background');
    const dynamicProfileRelationships = document.getElementById('dynamic-profile-relationships');
    const dynamicProfileSceneExamples = document.getElementById('dynamic-profile-scene-examples');
    const dynamicProfileNotes = document.getElementById('dynamic-profile-notes');
    const dynamicProfileTags = document.getElementById('dynamic-profile-tags');
    
    const statsList = document.getElementById('stats-list');
    const diariesList = document.getElementById('diaries-list');
    const itemsList = document.getElementById('items-list');
    const pendingEventsList = document.getElementById('pending-events-list');
    const completedEventsList = document.getElementById('completed-events-list');
    const lastUpdated = document.getElementById('last-updated');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    let currentCharacter = null;

    // 加载角色信息
    loadCharacter();

    // 绑定事件
    console.log('绑定事件...');
    console.log('editBtn:', editBtn);
    console.log('deleteBtn:', deleteBtn);
    console.log('importFixedBtn:', importFixedBtn);
    console.log('exportFixedBtn:', exportFixedBtn);
    console.log('exportDynamicBtn:', exportDynamicBtn);
    
    if (editBtn) {
        editBtn.addEventListener('click', editCharacter);
        console.log('编辑按钮事件绑定成功');
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteCharacter);
        console.log('删除按钮事件绑定成功');
    }
    if (importFixedBtn) {
        importFixedBtn.addEventListener('click', importFixedProfile);
        console.log('导入固定人设按钮事件绑定成功');
    }
    if (exportFixedBtn) {
        exportFixedBtn.addEventListener('click', exportFixedProfile);
        console.log('导出固定人设按钮事件绑定成功');
    }
    if (exportDynamicBtn) {
        exportDynamicBtn.addEventListener('click', exportDynamicProfile);
        console.log('导出流动人设按钮事件绑定成功');
    }

    // 标签页切换
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    function loadCharacter() {
        console.log('开始加载角色信息...');
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('id');
        console.log('角色ID:', characterId);

        if (!characterId) {
            alert('角色ID不存在');
            window.location.href = 'index.html';
            return;
        }

        currentCharacter = storage.getCharacterById(characterId);
        console.log('加载的角色:', currentCharacter);

        if (!currentCharacter) {
            alert('角色不存在');
            window.location.href = 'index.html';
            return;
        }

        // 更新页面标题
        characterName.textContent = currentCharacter.name + (currentCharacter.isTemporary ? ' (临时)' : '');
        console.log('角色是否为临时角色:', currentCharacter.isTemporary);

        // 确保角色数据结构完整
        if (!currentCharacter.fixedProfile) {
            currentCharacter.fixedProfile = {
                description: '',
                personality: '',
                background: '',
                relationships: [],
                sceneExamples: '',
                notes: '',
                tags: []
            };
        }
        if (!currentCharacter.dynamicProfile) {
            currentCharacter.dynamicProfile = {
                description: '',
                personality: '',
                background: '',
                relationships: [],
                sceneExamples: '',
                notes: '',
                tags: []
            };
        }
        if (!currentCharacter.items) {
            currentCharacter.items = [];
        }
        if (!currentCharacter.events) {
            currentCharacter.events = {
                pending: [],
                completed: []
            };
        } else {
            if (!currentCharacter.events.pending) {
                currentCharacter.events.pending = [];
            }
            if (!currentCharacter.events.completed) {
                currentCharacter.events.completed = [];
            }
        }

        // 兼容旧数据结构
        if (currentCharacter.profile && !currentCharacter.fixedProfile.description) {
            currentCharacter.fixedProfile = { ...currentCharacter.profile };
            delete currentCharacter.profile;
        }

        // 检查是否是临时角色
        if (currentCharacter.isTemporary) {
            // 临时角色显示简化界面
            console.log('显示临时角色界面');
            showTemporaryCharacterUI();
        } else {
            // 固定角色显示完整界面
            console.log('显示固定角色界面');
            showPermanentCharacterUI();
        }

        // 更新删除按钮状态
        console.log('更新删除按钮状态，isMain:', currentCharacter.isMain);
        if (deleteBtn) {
            deleteBtn.disabled = currentCharacter.isMain;
            console.log('删除按钮状态:', deleteBtn.disabled);
        }
    }

    function showTemporaryCharacterUI() {
        // 隐藏完整标签页，只显示基本信息
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') !== 'profile') {
                tab.style.display = 'none';
            }
        });

        // 隐藏右侧流动人设
        const dynamicProfileSection = document.querySelector('#profile-tab > div > div:nth-child(2)');
        if (dynamicProfileSection) {
            dynamicProfileSection.style.display = 'none';
        }

        // 调整左侧固定人设宽度
        const fixedProfileSection = document.querySelector('#profile-tab > div > div:nth-child(1)');
        if (fixedProfileSection) {
            fixedProfileSection.style.flex = '1 1 100%';
        }

        // 隐藏不需要的字段
        const collapsibleItems = document.querySelectorAll('.collapsible-item');
        collapsibleItems.forEach(item => {
            const header = item.querySelector('.collapsible-header');
            if (header) {
                // 获取header中的strong元素文本
                const strongElement = header.querySelector('strong');
                if (strongElement) {
                    const text = strongElement.textContent.trim();
                    // 只保留描述、性格和标签字段
                    if (!text.includes('描述:') && !text.includes('性格:') && !text.includes('标签:')) {
                        item.style.display = 'none';
                    }
                }
            }
        });

        // 更新固定人设信息
        fixedProfileDescription.textContent = currentCharacter.fixedProfile.description || '无';
        fixedProfilePersonality.textContent = currentCharacter.fixedProfile.personality || '无';
        fixedProfileTags.textContent = currentCharacter.fixedProfile.tags && currentCharacter.fixedProfile.tags.length > 0 
            ? currentCharacter.fixedProfile.tags.join(', ') 
            : '无';

        // 更新最后更新时间
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleString();
        }
    }

    function showPermanentCharacterUI() {
        // 显示所有标签页
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.style.display = 'inline-block';
        });

        // 显示右侧流动人设
        const dynamicProfileSection = document.querySelector('#profile-tab > div > div:nth-child(2)');
        if (dynamicProfileSection) {
            dynamicProfileSection.style.display = 'block';
        }

        // 恢复左侧固定人设宽度
        const fixedProfileSection = document.querySelector('#profile-tab > div > div:nth-child(1)');
        if (fixedProfileSection) {
            fixedProfileSection.style.flex = '1';
        }

        // 显示所有字段
        const collapsibleItems = document.querySelectorAll('.collapsible-item');
        collapsibleItems.forEach(item => {
            item.style.display = 'block';
        });

        // 更新固定人设信息
        fixedProfileDescription.textContent = currentCharacter.fixedProfile.description || '无';
        fixedProfilePersonality.textContent = currentCharacter.fixedProfile.personality || '无';
        fixedProfileBackground.textContent = currentCharacter.fixedProfile.background || '无';
        fixedProfileRelationships.textContent = currentCharacter.fixedProfile.relationships && currentCharacter.fixedProfile.relationships.length > 0 
            ? currentCharacter.fixedProfile.relationships.join(', ') 
            : '无';
        fixedProfileSceneExamples.textContent = currentCharacter.fixedProfile.sceneExamples || '无';
        fixedProfileNotes.textContent = currentCharacter.fixedProfile.notes || '无';
        fixedProfileTags.textContent = currentCharacter.fixedProfile.tags && currentCharacter.fixedProfile.tags.length > 0 
            ? currentCharacter.fixedProfile.tags.join(', ') 
            : '无';
        
        // 更新流动人设信息
        dynamicProfileDescription.textContent = currentCharacter.dynamicProfile.description || '无';
        dynamicProfilePersonality.textContent = currentCharacter.dynamicProfile.personality || '无';
        dynamicProfileBackground.textContent = currentCharacter.dynamicProfile.background || '无';
        dynamicProfileRelationships.textContent = currentCharacter.dynamicProfile.relationships && currentCharacter.dynamicProfile.relationships.length > 0 
            ? currentCharacter.dynamicProfile.relationships.join(', ') 
            : '无';
        dynamicProfileSceneExamples.textContent = currentCharacter.dynamicProfile.sceneExamples || '无';
        dynamicProfileNotes.textContent = currentCharacter.dynamicProfile.notes || '无';
        dynamicProfileTags.textContent = currentCharacter.dynamicProfile.tags && currentCharacter.dynamicProfile.tags.length > 0 
            ? currentCharacter.dynamicProfile.tags.join(', ') 
            : '无';

        // 更新数值信息
        renderStats();

        // 更新日记信息
        renderDiaries();

        // 更新物品信息
        renderItems();

        // 更新事件信息
        renderEvents();

        // 更新最后更新时间
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleString();
        }
    }

    function renderStats() {
        if (!statsList || !currentCharacter.stats) return;

        statsList.innerHTML = '';

        if (currentCharacter.stats.length === 0) {
            statsList.innerHTML = '<p>暂无数值信息</p>';
            return;
        }

        currentCharacter.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.style.padding = 'var(--spacing-sm)';
            statItem.style.borderBottom = '1px solid var(--border-color)';
            statItem.innerHTML = `<strong>${stat.name}:</strong> ${stat.value}`;
            statsList.appendChild(statItem);
        });
    }

    // 确保toggleDiary函数在DOM加载完成后可用
    window.toggleDiary = function(index) {
        console.log('toggleDiary called with index:', index);
        const content = document.getElementById(`diary-content-${index}`);
        // 修改选择器以匹配实际的onclick属性值
        const button = document.querySelector(`[onclick="window.toggleDiary(${index})"]`);
        
        console.log('Content element:', content);
        console.log('Button element:', button);
        
        if (content && button) {
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
                button.textContent = '收起';
                console.log('Diary expanded');
            } else {
                content.style.display = 'none';
                button.textContent = '展开';
                console.log('Diary collapsed');
            }
        } else {
            console.error('Content or button not found');
        }
    }

    function renderDiaries() {
        if (!diariesList || !currentCharacter.diaries) return;

        diariesList.innerHTML = '';

        if (currentCharacter.diaries.length === 0) {
            diariesList.innerHTML = '<p>暂无日记信息</p>';
            return;
        }

        // 按日期排序，最新的在前
        const sortedDiaries = currentCharacter.diaries.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        sortedDiaries.forEach((diary, index) => {
            const diaryItem = document.createElement('div');
            diaryItem.style.padding = 'var(--spacing-md)';
            diaryItem.style.borderBottom = '1px solid var(--border-color)';
            diaryItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                    <h4>日记</h4>
                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="font-size: var(--font-size-sm); color: var(--text-color); opacity: 0.7;">${diary.date}</span>
                        <button onclick="window.toggleDiary(${index})" class="btn-outline btn-sm" style="padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-sm);">展开</button>
                    </div>
                </div>
                <div id="diary-content-${index}" style="display: none; margin-top: var(--spacing-sm);">
                    <p>${diary.content}</p>
                </div>
            `;
            diariesList.appendChild(diaryItem);
        });
    }

    function renderItems() {
        if (!itemsList || !currentCharacter.items) return;

        itemsList.innerHTML = '';

        if (currentCharacter.items.length === 0) {
            itemsList.innerHTML = '<p>暂无物品信息</p>';
            return;
        }

        currentCharacter.items.forEach(item => {
            const itemItem = document.createElement('div');
            itemItem.style.padding = 'var(--spacing-sm)';
            itemItem.style.borderBottom = '1px solid var(--border-color)';
            itemItem.innerHTML = `
                <strong>${item.name}</strong> (${item.type || '无类型'})
                <p>${item.description || '无描述'}</p>
                ${item.effect ? `<p style="color: #3b82f6; font-style: italic;">特殊效果: ${item.effect}</p>` : ''}
            `;
            itemsList.appendChild(itemItem);
        });
    }

    function renderEvents() {
        if (!pendingEventsList || !completedEventsList || !currentCharacter.events) return;

        // 未完成事件
        pendingEventsList.innerHTML = '';
        if (currentCharacter.events.pending && currentCharacter.events.pending.length > 0) {
            currentCharacter.events.pending.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.style.padding = 'var(--spacing-sm)';
                eventItem.style.borderBottom = '1px solid var(--border-color)';
                eventItem.innerHTML = `
                    <strong>${event.content || '无内容'}</strong>
                    ${event.date ? `<span style="font-size: var(--font-size-sm); color: var(--text-color); opacity: 0.7; margin-left: var(--spacing-md);">${event.date}</span>` : ''}
                `;
                pendingEventsList.appendChild(eventItem);
            });
        } else {
            pendingEventsList.innerHTML = '<p>暂无未完成事件</p>';
        }

        // 已完成事件
        completedEventsList.innerHTML = '';
        if (currentCharacter.events.completed && currentCharacter.events.completed.length > 0) {
            currentCharacter.events.completed.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.style.padding = 'var(--spacing-sm)';
                eventItem.style.borderBottom = '1px solid var(--border-color)';
                eventItem.innerHTML = `
                    <strong>${event.content || '无内容'}</strong>
                    ${event.date ? `<span style="font-size: var(--font-size-sm); color: var(--text-color); opacity: 0.7; margin-left: var(--spacing-md);">${event.date}</span>` : ''}
                `;
                completedEventsList.appendChild(eventItem);
            });
        } else {
            completedEventsList.innerHTML = '<p>暂无已完成事件</p>';
        }
    }

    function editCharacter() {
        if (!currentCharacter) return;
        window.location.href = `card.html?mode=edit&id=${currentCharacter.id}`;
    }

    function deleteCharacter() {
        if (!currentCharacter || currentCharacter.isMain) return;

        if (confirm('确定要删除这个角色吗？')) {
            const success = storage.deleteCharacter(currentCharacter.id);
            if (success) {
                alert('角色删除成功！');
                window.location.href = 'index.html';
            } else {
                alert('角色删除失败');
            }
        }
    }

    function switchTab(tabId) {
        // 更新标签页状态
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');

        // 更新标签页内容
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    // 折叠/展开功能
    window.toggleCollapsible = function(element) {
        console.log('toggleCollapsible called with element:', element);
        const header = element;
        const item = header.parentElement;
        if (item) {
            item.classList.toggle('active');
            header.classList.toggle('active');
            console.log('Collapsible toggled successfully');
        } else {
            console.error('Parent element not found');
        }
    }

    // 导入固定人设
    function importFixedProfile() {
        console.log('开始导入固定人设...');
        if (!currentCharacter) {
            console.error('当前角色不存在');
            alert('当前角色不存在，无法导入');
            return;
        }
        
        console.log('创建文件输入元素...');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none'; // 隐藏文件输入元素
        document.body.appendChild(input); // 将元素添加到DOM中
        
        input.onchange = function(e) {
            console.log('文件选择变化...');
            const file = e.target.files[0];
            if (!file) {
                console.log('未选择文件');
                document.body.removeChild(input);
                return;
            }

            console.log('选择的文件:', file.name);
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('文件读取完成...');
                try {
                    const importedData = JSON.parse(e.target.result);
                    console.log('解析的配置文件:', importedData);
                    
                    // 处理不同格式的JSON文件
                    let importedProfile;
                    if (importedData.characters && Array.isArray(importedData.characters) && importedData.characters.length > 0) {
                        // 格式1: 包含characters数组的完整导出文件
                        console.log('检测到完整导出格式，使用第一个角色的profile');
                        importedProfile = importedData.characters[0].profile;
                    } else if (importedData.description || importedData.personality) {
                        // 格式2: 直接是profile对象
                        console.log('检测到直接profile格式');
                        importedProfile = importedData;
                    } else {
                        throw new Error('无效的人设文件格式');
                    }
                    
                    if (importedProfile) {
                        // 确保relationships字段格式正确
                        if (typeof importedProfile.relationships === 'string') {
                            console.log('将字符串类型的relationships转换为数组');
                            importedProfile.relationships = [importedProfile.relationships];
                        } else if (!Array.isArray(importedProfile.relationships)) {
                            console.log('将非数组类型的relationships转换为空数组');
                            importedProfile.relationships = [];
                        }
                        
                        // 确保tags字段格式正确
                        if (!Array.isArray(importedProfile.tags)) {
                            console.log('将非数组类型的tags转换为空数组');
                            importedProfile.tags = [];
                        }
                        
                        // 更新固定人设
                        currentCharacter.fixedProfile = importedProfile;
                        // 生成空白流动人设
                        currentCharacter.dynamicProfile = {
                            description: '',
                            personality: '',
                            background: '',
                            relationships: [],
                            sceneExamples: '',
                            notes: '',
                            tags: []
                        };
                        // 保存角色数据
                        console.log('保存角色数据...');
                        const saveResult = storage.saveCharacter(currentCharacter);
                        console.log('保存结果:', saveResult);
                        // 重新加载角色信息
                        loadCharacter();
                        alert('固定人设导入成功，已生成绑定的空白流动人设');
                    }
                } catch (error) {
                    console.error('导入失败:', error);
                    alert('导入失败：' + error.message);
                } finally {
                    // 清理文件输入元素
                    document.body.removeChild(input);
                }
            };
            reader.onerror = function(error) {
                console.error('文件读取错误:', error);
                alert('文件读取失败');
                document.body.removeChild(input);
            };
            console.log('开始读取文件...');
            reader.readAsText(file);
        };
        
        // 触发点击事件
        console.log('触发文件选择对话框...');
        try {
            input.click();
            console.log('文件选择对话框已触发');
        } catch (error) {
            console.error('触发文件选择对话框失败:', error);
            alert('无法打开文件选择对话框');
            document.body.removeChild(input);
        }
    }

    // 导出固定人设
    function exportFixedProfile() {
        if (!currentCharacter) return;
        
        const profileData = currentCharacter.fixedProfile;
        const dataStr = JSON.stringify(profileData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentCharacter.name}_固定人设.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 导出流动人设
    function exportDynamicProfile() {
        if (!currentCharacter) return;
        
        const profileData = currentCharacter.dynamicProfile;
        const dataStr = JSON.stringify(profileData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentCharacter.name}_流动人设.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
});