class Storage {
    constructor() {
        this.prefix = 'aichat_';
    }

    // 通用存储方法
    set(key, value) {
        try {
            const storageKey = this.prefix + key;
            localStorage.setItem(storageKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    }

    // 通用读取方法
    get(key) {
        try {
            const storageKey = this.prefix + key;
            const value = localStorage.getItem(storageKey);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }

    // 通用删除方法
    remove(key) {
        try {
            const storageKey = this.prefix + key;
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }

    // 清空所有数据
    clear() {
        try {
            // 只清空本应用的数据
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    // 世界相关方法
    saveWorld(world) {
        const worlds = this.getWorlds();
        const index = worlds.findIndex(w => w.id === world.id);
        
        if (index !== -1) {
            worlds[index] = world;
        } else {
            worlds.push(world);
        }
        
        return this.set('worlds', worlds);
    }

    getWorlds() {
        return this.get('worlds') || [];
    }

    getWorldById(id) {
        const worlds = this.getWorlds();
        return worlds.find(world => world.id === id) || null;
    }

    deleteWorld(id) {
        const worlds = this.getWorlds();
        const filteredWorlds = worlds.filter(world => world.id !== id);
        return this.set('worlds', filteredWorlds);
    }

    // 角色相关方法
    saveCharacter(character) {
        return this.set(`character_${character.id}`, character);
    }

    getCharacterById(id) {
        return this.get(`character_${id}`) || null;
    }

    getCharactersByWorldId(worldId) {
        const world = this.getWorldById(worldId);
        if (!world) return [];
        
        // 确保 characters 数组存在
        if (!world.characters || !Array.isArray(world.characters)) {
            world.characters = [];
            this.saveWorld(world);
            return [];
        }
        
        return world.characters.map(charId => {
            try {
                const character = this.getCharacterById(charId);
                if (!character) {
                    console.warn(`角色ID ${charId} 不存在`);
                }
                return character;
            } catch (error) {
                console.error(`获取角色 ${charId} 失败:`, error);
                return null;
            }
        }).filter(Boolean);
    }

    deleteCharacter(id) {
        // 检查是否为主角
        const character = this.getCharacterById(id);
        if (character && character.isMain) {
            console.error('主角角色卡不可删除');
            return false;
        }
        
        // 从所有世界中移除该角色
        const worlds = this.getWorlds();
        worlds.forEach(world => {
            if (world.characters) {
                world.characters = world.characters.filter(charId => charId !== id);
            }
        });
        this.set('worlds', worlds);
        
        // 删除角色数据
        return this.remove(`character_${id}`);
    }

    // 故事记录相关方法
    saveStory(story) {
        return this.set(`story_${story.id}`, story);
    }

    getStoryById(id) {
        return this.get(`story_${id}`) || null;
    }

    getStoriesByWorldId(worldId) {
        const world = this.getWorldById(worldId);
        if (!world || !world.stories) {
            // 如果世界没有stories数组，尝试从localStorage中直接获取所有故事
            let stories = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('aichat_story_')) {
                    try {
                        const story = JSON.parse(localStorage.getItem(key));
                        if (story.worldId === worldId) {
                            stories.push(story);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
            return stories;
        }
        
        return world.stories.map(storyId => this.getStoryById(storyId)).filter(Boolean);
    }

    deleteStory(id) {
        // 从世界中移除该故事
        const worlds = this.getWorlds();
        worlds.forEach(world => {
            if (world.stories) {
                world.stories = world.stories.filter(storyId => storyId !== id);
            }
        });
        this.set('worlds', worlds);
        
        // 删除故事数据
        return this.remove(`story_${id}`);
    }

    // 导入/导出方法
    exportData() {
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            worlds: this.getWorlds(),
            characters: [],
            stories: []
        };
        
        // 导出所有角色
        const worlds = data.worlds;
        worlds.forEach(world => {
            if (world.characters) {
                world.characters.forEach(charId => {
                    const character = this.getCharacterById(charId);
                    if (character && !data.characters.find(c => c.id === charId)) {
                        data.characters.push(character);
                    }
                });
            }
            
            // 导出所有故事
            if (world.stories) {
                world.stories.forEach(storyId => {
                    const story = this.getStoryById(storyId);
                    if (story && !data.stories.find(s => s.id === storyId)) {
                        data.stories.push(story);
                    }
                });
            }
        });
        
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // 导入世界
            if (data.worlds) {
                data.worlds.forEach(world => {
                    this.saveWorld(world);
                });
            }
            
            // 导入角色
            if (data.characters) {
                data.characters.forEach(character => {
                    this.saveCharacter(character);
                });
            }
            
            // 导入故事
            if (data.stories) {
                data.stories.forEach(story => {
                    this.saveStory(story);
                });
            }
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    // 批量操作方法
    batchDeleteCharacters(ids) {
        let success = true;
        ids.forEach(id => {
            if (!this.deleteCharacter(id)) {
                success = false;
            }
        });
        return success;
    }

    batchImportCharacters(characters) {
        let success = true;
        characters.forEach(character => {
            if (!this.saveCharacter(character)) {
                success = false;
            }
        });
        return success;
    }

    // 配置相关方法
    saveConfig(config) {
        return this.set('config', config);
    }

    getConfig() {
        return this.get('config') || {};
    }

    saveApiConfig(config) {
        return this.set('apiConfig', config);
    }

    getApiConfig() {
        return this.get('apiConfig') || {
            service: 'DeepSeek',
            apiKey: '',
            model: 'deepseek-chat',
            parameters: {
                temperature: 0.7,
                max_tokens: 1024,
                frequency_penalty: 0,
                presence_penalty: 0
            }
        };
    }

    // 小助手状态相关方法
   saveAssistantsStatus(status) {
       return this.set('assistantsStatus', status);
   }

   getAssistantsStatus() {
       return this.get('assistantsStatus') || {};
   }

   // 最近故事记录相关方法
   getRecentStories() {
       return this.get('recentStories') || [];
   }

   addRecentStory(story) {
        const recentStories = this.getRecentStories();
        // 移除已存在的相同故事
        const filteredStories = recentStories.filter(s => s.id !== story.id);
        // 添加到开头
        filteredStories.unshift({
            id: story.id,
            worldId: story.worldId,
            storySummary: story.storySummary,
            fullStory: story.fullStory,
            scenes: story.scenes || [],
            timestamp: story.endTime || new Date().toISOString(),
            characters: story.characters
        });
        // 限制最近故事数量为10个
        const limitedStories = filteredStories.slice(0, 10);
        return this.set('recentStories', limitedStories);
    }

   removeRecentStory(id) {
       const recentStories = this.getRecentStories();
       const filteredStories = recentStories.filter(s => s.id !== id);
       return this.set('recentStories', filteredStories);
   }

   clearRecentStories() {
       return this.remove('recentStories');
   }
 }

// 导出存储实例
const storage = new Storage();

// 在浏览器环境中，将storage挂载到全局对象
if (typeof window !== 'undefined') {
    window.storage = storage;
}