class App {
    constructor() {
        this.accessMode = this.detectAccessMode();
        this.worlds = [];
        this.init();
    }

    detectAccessMode() {
        return window.location.protocol === 'http:' || window.location.protocol === 'https:' ? 'http' : 'html';
    }

    async init() {
        console.log('初始化应用...');
        console.log('访问模式:', this.accessMode);
        
        await this.loadWorlds();
        this.renderWorlds();
    }

    async loadWorlds() {
        try {
            // 尝试使用storage对象加载世界数据
            if (typeof storage !== 'undefined') {
                this.worlds = storage.getWorlds();
                if (this.worlds.length === 0) {
                    // 如果没有数据，创建默认世界
                    this.createDefaultWorld();
                }
            } else {
                // 降级方案：直接从localStorage加载
                const worldsData = localStorage.getItem('aichat_worlds');
                if (worldsData) {
                    this.worlds = JSON.parse(worldsData);
                } else {
                    // 如果没有数据，创建默认世界
                    this.createDefaultWorld();
                }
            }
        } catch (error) {
            console.error('加载世界数据失败:', error);
            this.createDefaultWorld();
        }
    }

    createDefaultWorld() {
        const defaultWorld = {
            id: 'world-1',
            name: '魔法世界',
            settings: {
                background: '一个充满魔法的奇幻世界',
                worldview: '魔法是这个世界的核心力量',
                outputFormat: '对话式',
                outputStyle: '生动',
                time: '2026-02-24'
            },
            characters: ['character-1'],
            stories: []
        };

        // 创建默认主角
        const defaultCharacter = {
            id: 'character-1',
            name: '主角',
            isMain: true,
            profile: {
                description: '故事的主人公',
                personality: '勇敢、善良',
                background: '普通村庄的年轻人',
                relationships: [],
                sceneExamples: '主角站在魔法学院门口，充满期待地看着宏伟的建筑。',
                notes: '主角是玩家的化身',
                tags: ['主角', '冒险者']
            },
            stats: [
                { id: 'stat-1', name: '力量', value: 10 },
                { id: 'stat-2', name: '智力', value: 12 },
                { id: 'stat-3', name: '敏捷', value: 8 },
                { id: 'stat-4', name: '体质', value: 9 },
                { id: 'stat-5', name: '魔法', value: 15 }
            ],
            diaries: [],
            items: [],
            events: {
                pending: [],
                completed: []
            }
        };

        this.worlds = [defaultWorld];
        
        // 使用storage对象保存数据
        if (typeof storage !== 'undefined') {
            storage.saveWorld(defaultWorld);
            storage.saveCharacter(defaultCharacter);
        } else {
            // 降级方案：直接保存到localStorage
            localStorage.setItem('aichat_worlds', JSON.stringify(this.worlds));
            localStorage.setItem('aichat_character_character-1', JSON.stringify(defaultCharacter));
        }
    }

    renderWorlds() {
        const worldsList = document.getElementById('worlds-list');
        if (!worldsList) return;

        worldsList.innerHTML = '';

        this.worlds.forEach(world => {
            const worldCard = document.createElement('div');
            worldCard.className = 'world-card';
            worldCard.innerHTML = `
                <h3>${world.name}</h3>
                <p>创建时间: ${world.settings.time}</p>
                <p>最近活动: ${this.getLastActivity(world)}</p>
                <div class="world-card-buttons">
                    <button onclick="app.enterWorld('${world.id}')">进入世界</button>
                    <button onclick="app.deleteWorld('${world.id}')" class="delete-world-btn">删除世界</button>
                </div>
            `;
            worldsList.appendChild(worldCard);
        });
    }

    getLastActivity(world) {
        if (world.stories && world.stories.length > 0) {
            return '最近有故事记录';
        }
        return '暂无活动';
    }

    enterWorld(worldId) {
        // 保存当前选中的世界ID
        localStorage.setItem('currentWorldId', worldId);
        // 跳转到世界页面
        window.location.href = '../features/world-management/index.html';
    }

    deleteWorld(worldId) {
        if (confirm('确定要删除这个剧情世界吗？删除后将无法恢复。')) {
            try {
                // 首先获取世界数据，用于后续删除相关角色
                const world = storage.getWorldById(worldId);
                
                // 删除世界
                const worldDeleted = storage.deleteWorld(worldId);
                
                // 如果世界删除成功，删除相关角色
                if (worldDeleted && world && world.characters) {
                    world.characters.forEach(charId => {
                        storage.deleteCharacter(charId);
                    });
                }
                
                if (worldDeleted) {
                    // 重新加载世界列表
                    this.loadWorlds().then(() => {
                        this.renderWorlds();
                        // 直接显示成功提示，不需要再确认
                        alert('世界删除成功！');
                    });
                } else {
                    alert('世界删除失败！');
                }
            } catch (error) {
                console.error('删除世界失败:', error);
                alert('删除世界失败: ' + error.message);
            }
        }
    }
}

// 初始化应用
const app = new App();