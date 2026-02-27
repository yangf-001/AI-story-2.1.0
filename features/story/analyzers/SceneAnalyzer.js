class SceneAnalyzer {
    constructor(worldId, storage, api) {
        this.worldId = worldId;
        this.storage = storage;
        this.api = api;
    }
    
    async analyze(userMessage) {
        if (typeof this.api === 'undefined') {
            return this.getDefaultAnalysis();
        }
        
        try {
            const characters = this.getAvailableCharacters();
            if (characters.length === 0) {
                return this.getDefaultAnalysis();
            }
            
            const characterInfo = this.buildCharacterInfo(characters);
            const prompt = this.buildSceneAnalysisPrompt(userMessage, characterInfo);
            const response = await this.api.callAPI('user', prompt);
            return this.parseResponse(response, characters);
        } catch (error) {
            console.error('分析场景失败:', error);
            return this.getDefaultAnalysis();
        }
    }
    
    getAvailableCharacters() {
        const allCharacters = this.storage.getCharactersByWorldId(this.worldId);
        return allCharacters.filter(c => !c.isMain);
    }
    
    buildCharacterInfo(characters) {
        let characterInfo = '';
        characters.forEach(character => {
            characterInfo += `${character.name}: ${character.profile?.background || '无背景信息'}\n`;
            if (character.profile?.personality) {
                characterInfo += `  性格: ${character.profile.personality}\n`;
            }
            if (character.profile?.tags) {
                characterInfo += `  标签: ${character.profile.tags.join(', ')}\n`;
            }
            characterInfo += '\n';
        });
        return characterInfo;
    }
    
    buildSceneAnalysisPrompt(userMessage, characterInfo) {
        let prompt = `请分析用户的消息内容，确定当前场景，并根据角色的背景、性格和标签，判断哪些角色最适合在这个场景中参与对话。\n\n`;
        prompt += `用户消息: ${userMessage}\n\n`;
        prompt += `可用角色信息:\n${characterInfo}\n\n`;
        prompt += `请按照以下格式输出:\n`;
        prompt += `场景: [分析出的当前场景，如学校、家里、公园等]\n`;
        prompt += `适合角色: [角色1, 角色2, ...]\n\n`;
        prompt += `要求:\n`;
        prompt += `1. 分析要基于用户消息内容，不使用关键词匹配，而是理解场景的实际含义\n`;
        prompt += `2. 考虑角色的背景和性格，确保推荐的角色在该场景中出现是合理的\n`;
        prompt += `3. 不要推荐在该场景中不可能出现的角色\n`;
        prompt += `4. 输出要简洁明了，只包含指定格式的内容`;
        
        return prompt;
    }
    
    parseResponse(response, characters) {
        const lines = response.split('\n');
        let scene = '';
        let suitableCharacterNames = [];
        
        for (const line of lines) {
            if (line.startsWith('场景: ')) {
                scene = line.substring(4).trim();
            } else if (line.startsWith('适合角色: ')) {
                const charactersStr = line.substring(6).trim();
                if (charactersStr) {
                    suitableCharacterNames = charactersStr.split(',').map(c => c.trim());
                }
            }
        }
        
        const suitableCharacterIds = characters
            .filter(c => suitableCharacterNames.includes(c.name))
            .map(c => c.id);
        
        return {
            scene,
            characterIds: suitableCharacterIds.length > 0 ? suitableCharacterIds : characters.map(c => c.id)
        };
    }
    
    getDefaultAnalysis() {
        const characters = this.getAvailableCharacters();
        return {
            scene: '默认场景',
            characterIds: characters.map(c => c.id)
        };
    }
}