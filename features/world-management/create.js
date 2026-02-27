document.addEventListener('DOMContentLoaded', function() {
    console.log('Create.js 加载完成');
    console.log('Storage 对象是否存在:', typeof storage !== 'undefined');
    
    const form = document.getElementById('create-world-form');
    console.log('表单元素:', form);

    if (!form) {
        console.error('找不到表单元素 create-world-form');
        return;
    }

    form.addEventListener('submit', function(e) {
        console.log('表单提交事件触发');
        e.preventDefault();

        // 获取表单数据
        const worldName = document.getElementById('world-name').value;
        const worldDescription = document.getElementById('world-description').value;
        const storyBackground = document.getElementById('story-background').value;
        const worldview = document.getElementById('worldview').value;
        const initialTime = document.getElementById('initial-time').value;

        console.log('表单数据:', {
            worldName,
            worldDescription,
            storyBackground,
            worldview,
            initialTime
        });

        // 生成唯一ID
        const worldId = `world_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const characterId = `character_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // 创建世界数据
        const worldData = {
            id: worldId,
            name: worldName,
            description: worldDescription,
            settings: {
                background: storyBackground,
                worldview: worldview,
                outputFormat: '对话式',
                outputStyle: '生动',
                time: initialTime
            },
            characters: [characterId],
            stories: []
        };

        // 创建默认主角角色卡
        const mainCharacter = {
            id: characterId,
            name: '主角',
            isMain: true,
            profile: {
                description: '故事的主人公',
                personality: '勇敢、善良',
                background: '这个世界的主角',
                relationships: [],
                sceneExamples: '主角站在世界的中心，准备开始冒险。',
                notes: '主角是玩家的化身',
                tags: ['主角', '冒险者']
            },
            stats: [
                { id: `stat_${Date.now()}_1`, name: '力量', value: 10 },
                { id: `stat_${Date.now()}_2`, name: '智力', value: 12 },
                { id: `stat_${Date.now()}_3`, name: '敏捷', value: 8 },
                { id: `stat_${Date.now()}_4`, name: '体质', value: 9 },
                { id: `stat_${Date.now()}_5`, name: '魅力', value: 10 }
            ],
            diaries: [],
            items: [],
            events: {
                pending: [],
                completed: []
            }
        };

        // 保存数据
        try {
            console.log('开始保存数据...');
            
            // 检查storage对象
            if (typeof storage === 'undefined') {
                throw new Error('Storage 对象未定义');
            }
            
            console.log('Storage 对象方法:', {
                saveWorld: typeof storage.saveWorld === 'function',
                saveCharacter: typeof storage.saveCharacter === 'function'
            });
            
            // 使用saveWorld方法保存世界数据
            console.log('保存世界数据:', worldData);
            const worldSaved = storage.saveWorld(worldData);
            console.log('世界保存结果:', worldSaved);
            
            // 保存主角角色卡
            console.log('保存角色数据:', mainCharacter);
            const characterSaved = storage.saveCharacter(mainCharacter);
            console.log('角色保存结果:', characterSaved);
            
            if (!worldSaved || !characterSaved) {
                throw new Error('保存数据失败');
            }
            
            console.log('数据保存成功！');
            
            // 验证数据是否真的保存了
            const savedWorlds = storage.getWorlds();
            console.log('保存后的世界列表:', savedWorlds);
            
        } catch (error) {
            console.error('创建世界失败:', error);
            console.error('错误堆栈:', error.stack);
            alert('创建世界失败: ' + error.message + '\n请查看控制台获取详细信息。');
            return;
        }

        // 跳转到主页面
        console.log('跳转到主页面...');
        window.location.href = '../../main/index.html';
    });
});