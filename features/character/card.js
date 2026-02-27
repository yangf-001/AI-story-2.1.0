document.addEventListener('DOMContentLoaded', function() {
    const pageTitle = document.getElementById('page-title');
    const backBtn = document.getElementById('back-btn');
    const saveBtn = document.getElementById('save-btn');
    const characterName = document.getElementById('character-name');
    
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
    
    const statsEditor = document.getElementById('stats-editor');
    const diariesEditor = document.getElementById('diaries-editor');
    const itemsEditor = document.getElementById('items-editor');
    const pendingEventsEditor = document.getElementById('pending-events-editor');
    const completedEventsEditor = document.getElementById('completed-events-editor');
    const addStatBtn = document.getElementById('add-stat-btn');
    const addDiaryBtn = document.getElementById('add-diary-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    const addPendingEventBtn = document.getElementById('add-pending-event-btn');
    const addCompletedEventBtn = document.getElementById('add-completed-event-btn');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    let currentCharacter = null;
    let currentMode = ''; // 'create' or 'edit'

    // 初始化页面
    initPage();

    // 绑定事件
    backBtn.addEventListener('click', goBack);
    saveBtn.addEventListener('click', saveCharacter);
    addStatBtn.addEventListener('click', addStat);
    addDiaryBtn.addEventListener('click', addDiary);
    addItemBtn.addEventListener('click', addItem);
    addPendingEventBtn.addEventListener('click', addPendingEvent);
    addCompletedEventBtn.addEventListener('click', addCompletedEvent);
    
    // 绑定临时角色切换事件
    const isTemporaryCheckbox = document.getElementById('character-is-temporary');
    if (isTemporaryCheckbox) {
        isTemporaryCheckbox.addEventListener('change', function() {
            const isTemporary = this.checked;
            document.getElementById('permanent-character-settings').style.display = isTemporary ? 'none' : 'block';
            document.getElementById('temporary-character-settings').style.display = isTemporary ? 'block' : 'none';
        });
    }

    // 标签页切换
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    function initPage() {
        const urlParams = new URLSearchParams(window.location.search);
        currentMode = urlParams.get('mode') || 'create';
        const characterId = urlParams.get('id');

        if (currentMode === 'edit' && characterId) {
            currentCharacter = storage.getCharacterById(characterId);
            if (!currentCharacter) {
                alert('角色不存在');
                window.location.href = 'index.html';
                return;
            }
            pageTitle.textContent = '编辑角色';
            loadCharacterData();
        } else {
            currentMode = 'create';
            pageTitle.textContent = '创建角色';
            initNewCharacter();
        }
    }

    function initNewCharacter() {
        currentCharacter = {
            id: `character_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            name: '',
            isMain: false,
            isTemporary: false,
            fixedProfile: {
                description: '',
                personality: '',
                background: '',
                relationships: [],
                sceneExamples: '',
                notes: '',
                tags: []
            },
            dynamicProfile: {
                description: '',
                personality: '',
                background: '',
                relationships: [],
                sceneExamples: '',
                notes: '',
                tags: []
            },
            stats: [],
            diaries: [],
            items: [],
            events: {
                pending: [],
                completed: []
            }
        };
    }

    function loadCharacterData() {
        if (!currentCharacter) return;

        characterName.value = currentCharacter.name || '';
        document.getElementById('character-is-main').checked = currentCharacter.isMain || false;
        document.getElementById('character-is-temporary').checked = currentCharacter.isTemporary || false;
        
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
        
        // 兼容旧数据结构
        if (currentCharacter.profile && !currentCharacter.fixedProfile.description) {
            currentCharacter.fixedProfile = { ...currentCharacter.profile };
            delete currentCharacter.profile;
        }
        
        // 加载固定人设信息
        fixedProfileDescription.value = currentCharacter.fixedProfile.description || '';
        fixedProfilePersonality.value = currentCharacter.fixedProfile.personality || '';
        fixedProfileBackground.value = currentCharacter.fixedProfile.background || '';
        fixedProfileRelationships.value = currentCharacter.fixedProfile.relationships ? currentCharacter.fixedProfile.relationships.join(', ') : '';
        fixedProfileSceneExamples.value = currentCharacter.fixedProfile.sceneExamples || '';
        fixedProfileNotes.value = currentCharacter.fixedProfile.notes || '';
        fixedProfileTags.value = currentCharacter.fixedProfile.tags ? currentCharacter.fixedProfile.tags.join(', ') : '';
        
        // 加载流动人设信息
        dynamicProfileDescription.value = currentCharacter.dynamicProfile.description || '';
        dynamicProfilePersonality.value = currentCharacter.dynamicProfile.personality || '';
        dynamicProfileBackground.value = currentCharacter.dynamicProfile.background || '';
        dynamicProfileRelationships.value = currentCharacter.dynamicProfile.relationships ? currentCharacter.dynamicProfile.relationships.join(', ') : '';
        dynamicProfileSceneExamples.value = currentCharacter.dynamicProfile.sceneExamples || '';
        dynamicProfileNotes.value = currentCharacter.dynamicProfile.notes || '';
        dynamicProfileTags.value = currentCharacter.dynamicProfile.tags ? currentCharacter.dynamicProfile.tags.join(', ') : '';

        // 加载数值信息
        renderStats();

        // 加载日记信息
        renderDiaries();

        // 加载物品信息
        renderItems();

        // 加载事件信息
        renderEvents();
    }

    function saveCharacter() {
        if (!characterName.value.trim()) {
            alert('请输入角色名称');
            return;
        }

        // 检查storage对象是否存在
        if (typeof storage === 'undefined') {
            alert('存储服务不可用');
            return;
        }

        // 保存基本信息
        currentCharacter.name = characterName.value.trim();
        currentCharacter.isMain = document.getElementById('character-is-main').checked;
        currentCharacter.isTemporary = document.getElementById('character-is-temporary').checked;

        if (currentCharacter.isTemporary) {
            // 临时角色简化设置
            const description = document.getElementById('temporary-profile-description').value.trim();
            const personality = document.getElementById('temporary-profile-personality').value.trim();
            const tags = document.getElementById('temporary-profile-tags').value.trim().split(',').map(t => t.trim()).filter(Boolean);
            
            // 保存简化的人设信息
            currentCharacter.fixedProfile = {
                description: description,
                personality: personality,
                background: '临时角色',
                relationships: [],
                sceneExamples: '',
                notes: '临时角色',
                tags: tags
            };
            
            currentCharacter.dynamicProfile = {
                description: description,
                personality: personality,
                background: '临时角色',
                relationships: [],
                sceneExamples: '',
                notes: '临时角色',
                tags: tags
            };
            
            // 清空其他信息
            currentCharacter.stats = [];
            currentCharacter.diaries = [];
            currentCharacter.items = [];
            currentCharacter.events = {
                pending: [],
                completed: []
            };
        } else {
            // 固定角色详细设置
            // 保存固定人设信息
            currentCharacter.fixedProfile = {
                description: fixedProfileDescription.value.trim(),
                personality: fixedProfilePersonality.value.trim(),
                background: fixedProfileBackground.value.trim(),
                relationships: fixedProfileRelationships.value.trim().split(',').map(r => r.trim()).filter(Boolean),
                sceneExamples: fixedProfileSceneExamples.value.trim(),
                notes: fixedProfileNotes.value.trim(),
                tags: fixedProfileTags.value.trim().split(',').map(t => t.trim()).filter(Boolean)
            };
            
            // 保存流动人设信息
            currentCharacter.dynamicProfile = {
                description: dynamicProfileDescription.value.trim(),
                personality: dynamicProfilePersonality.value.trim(),
                background: dynamicProfileBackground.value.trim(),
                relationships: dynamicProfileRelationships.value.trim().split(',').map(r => r.trim()).filter(Boolean),
                sceneExamples: dynamicProfileSceneExamples.value.trim(),
                notes: dynamicProfileNotes.value.trim(),
                tags: dynamicProfileTags.value.trim().split(',').map(t => t.trim()).filter(Boolean)
            };

            // 保存数值信息
            currentCharacter.stats = getStats();

            // 保存日记信息
            currentCharacter.diaries = getDiaries();

            // 保存物品信息
            currentCharacter.items = getItems();

            // 保存事件信息
            currentCharacter.events = {
                pending: getPendingEvents(),
                completed: getCompletedEvents()
            };
        }

        console.log('准备保存角色:', currentCharacter);
        
        // 保存角色
        const characterSaved = storage.saveCharacter(currentCharacter);
        console.log('角色保存结果:', characterSaved);
        if (!characterSaved) {
            alert('保存角色失败');
            return;
        }

        // 如果是新建角色，将其添加到当前世界
        if (currentMode === 'create') {
            const currentWorldId = localStorage.getItem('currentWorldId');
            console.log('当前世界ID:', currentWorldId);
            if (currentWorldId) {
                const world = storage.getWorldById(currentWorldId);
                console.log('当前世界:', world);
                if (world && !world.characters.includes(currentCharacter.id)) {
                    console.log('添加角色到世界:', currentCharacter.id);
                    world.characters.push(currentCharacter.id);
                    console.log('更新后的世界角色列表:', world.characters);
                    const worldSaved = storage.saveWorld(world);
                    console.log('世界保存结果:', worldSaved);
                    if (!worldSaved) {
                        alert('保存世界信息失败');
                        return;
                    }
                }
            }
        }

        alert('角色保存成功！');
        window.location.href = `profile.html?id=${currentCharacter.id}`;
    }

    function goBack() {
        if (currentMode === 'edit' && currentCharacter) {
            window.location.href = `profile.html?id=${currentCharacter.id}`;
        } else {
            window.location.href = 'index.html';
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

    // 数值相关
    function renderStats() {
        statsEditor.innerHTML = '';

        if (currentCharacter.stats.length === 0) {
            addStat();
            return;
        }

        currentCharacter.stats.forEach(stat => {
            addStat(stat);
        });
    }

    function addStat(stat = null) {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.style.padding = 'var(--spacing-md)';
        statItem.style.borderBottom = '1px solid var(--border-color)';
        statItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-bottom: var(--spacing-sm);">
                <input type="text" placeholder="属性名称" style="flex: 1; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${stat?.name || ''}">
                <input type="number" placeholder="数值" style="width: 100px; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${stat?.value || 0}">
                <button type="button" class="btn-outline btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
            </div>
        `;
        statsEditor.appendChild(statItem);
    }

    function getStats() {
        const stats = [];
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            const nameInput = item.querySelector('input[type="text"]');
            const valueInput = item.querySelector('input[type="number"]');
            if (nameInput.value.trim()) {
                stats.push({
                    id: `stat_${Date.now()}_${index}`,
                    name: nameInput.value.trim(),
                    value: parseInt(valueInput.value) || 0
                });
            }
        });
        return stats;
    }

    // 日记相关
    function renderDiaries() {
        diariesEditor.innerHTML = '';

        if (currentCharacter.diaries.length === 0) {
            addDiary();
            return;
        }

        currentCharacter.diaries.forEach(diary => {
            addDiary(diary);
        });
    }

    function addDiary(diary = null) {
        const diaryItem = document.createElement('div');
        diaryItem.className = 'diary-item';
        diaryItem.style.padding = 'var(--spacing-md)';
        diaryItem.style.borderBottom = '1px solid var(--border-color)';
        diaryItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-bottom: var(--spacing-sm);">
                <input type="date" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${diary?.date || ''}">
                <button type="button" class="btn-outline btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
            </div>
            <textarea placeholder="日记内容" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); resize: vertical; min-height: 100px;">${diary?.content || ''}</textarea>
        `;
        diariesEditor.appendChild(diaryItem);
    }

    function getDiaries() {
        const diaries = [];
        const diaryItems = document.querySelectorAll('.diary-item');
        diaryItems.forEach((item, index) => {
            const dateInput = item.querySelector('input[type="date"]');
            const contentInput = item.querySelector('textarea');
            if (contentInput.value.trim()) {
                diaries.push({
                    id: `diary_${Date.now()}_${index}`,
                    content: contentInput.value.trim(),
                    date: dateInput.value || new Date().toISOString().split('T')[0]
                });
            }
        });
        return diaries;
    }

    // 物品相关
    function renderItems() {
        itemsEditor.innerHTML = '';

        if (currentCharacter.items.length === 0) {
            addItem();
            return;
        }

        currentCharacter.items.forEach(item => {
            addItem(item);
        });
    }

    function addItem(item = null) {
        const itemItem = document.createElement('div');
        itemItem.className = 'item-item';
        itemItem.style.padding = 'var(--spacing-md)';
        itemItem.style.borderBottom = '1px solid var(--border-color)';
        itemItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-bottom: var(--spacing-sm);">
                <input type="text" placeholder="物品名称" style="flex: 1; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${item?.name || ''}">
                <input type="text" placeholder="类型" style="width: 120px; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${item?.type || ''}">
                <button type="button" class="btn-outline btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
            </div>
            <textarea placeholder="物品描述" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); resize: vertical; min-height: 80px; margin-bottom: var(--spacing-sm);">${item?.description || ''}</textarea>
            <textarea placeholder="特殊效果" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); resize: vertical; min-height: 60px;" value="${item?.effect || ''}">${item?.effect || ''}</textarea>
        `;
        itemsEditor.appendChild(itemItem);
    }

    function getItems() {
        const items = [];
        const itemItems = document.querySelectorAll('.item-item');
        itemItems.forEach((item, index) => {
            const nameInput = item.querySelector('input[type="text"]:nth-child(1)');
            const typeInput = item.querySelector('input[type="text"]:nth-child(2)');
            const descriptionInput = item.querySelectorAll('textarea')[0];
            const effectInput = item.querySelectorAll('textarea')[1];
            if (nameInput.value.trim()) {
                items.push({
                    id: `item_${Date.now()}_${index}`,
                    name: nameInput.value.trim(),
                    type: typeInput.value.trim(),
                    description: descriptionInput.value.trim(),
                    effect: effectInput.value.trim()
                });
            }
        });
        return items;
    }

    // 事件相关
    function renderEvents() {
        pendingEventsEditor.innerHTML = '';
        completedEventsEditor.innerHTML = '';

        if (currentCharacter.events.pending.length === 0) {
            addPendingEvent();
        } else {
            currentCharacter.events.pending.forEach(event => {
                addPendingEvent(event);
            });
        }

        if (currentCharacter.events.completed.length === 0) {
            addCompletedEvent();
        } else {
            currentCharacter.events.completed.forEach(event => {
                addCompletedEvent(event);
            });
        }
    }

    function addPendingEvent(event = null) {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.style.padding = 'var(--spacing-md)';
        eventItem.style.borderBottom = '1px solid var(--border-color)';
        eventItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-bottom: var(--spacing-sm);">
                <input type="date" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${event?.date || ''}">
                <button type="button" class="btn-outline btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
            </div>
            <input type="text" placeholder="事件内容" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${event?.content || ''}">
        `;
        pendingEventsEditor.appendChild(eventItem);
    }

    function addCompletedEvent(event = null) {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.style.padding = 'var(--spacing-md)';
        eventItem.style.borderBottom = '1px solid var(--border-color)';
        eventItem.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-bottom: var(--spacing-sm);">
                <input type="date" style="padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${event?.date || ''}">
                <button type="button" class="btn-outline btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
            </div>
            <input type="text" placeholder="事件内容" style="width: 100%; padding: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);" value="${event?.content || ''}">
        `;
        completedEventsEditor.appendChild(eventItem);
    }

    function getPendingEvents() {
        const events = [];
        const eventItems = pendingEventsEditor.querySelectorAll('.event-item');
        eventItems.forEach((item, index) => {
            const dateInput = item.querySelector('input[type="date"]');
            const contentInput = item.querySelector('input[type="text"]');
            if (contentInput.value.trim()) {
                events.push({
                    id: `event_${Date.now()}_pending_${index}`,
                    content: contentInput.value.trim(),
                    date: dateInput.value || new Date().toISOString().split('T')[0]
                });
            }
        });
        return events;
    }

    function getCompletedEvents() {
        const events = [];
        const eventItems = completedEventsEditor.querySelectorAll('.event-item');
        eventItems.forEach((item, index) => {
            const dateInput = item.querySelector('input[type="date"]');
            const contentInput = item.querySelector('input[type="text"]');
            if (contentInput.value.trim()) {
                events.push({
                    id: `event_${Date.now()}_completed_${index}`,
                    content: contentInput.value.trim(),
                    date: dateInput.value || new Date().toISOString().split('T')[0]
                });
            }
        });
        return events;
    }
});