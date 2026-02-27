class PromptBuilder {
    constructor() {
        this.sceneKeywords = {
            '购物场景': ['购物', '超市', '买东西', '商场', '逛街'],
            '吃饭场景': ['吃饭', '餐厅', '食物', '饭店', '聚餐'],
            '家里场景': ['回家', '家里', '房间', '卧室', '客厅'],
            '学校场景': ['学校', '上课', '教室', '校园', '学习'],
            '公园场景': ['公园', '散步', '游玩', '户外', '休闲'],
            '工作场景': ['工作', '办公室', '上班', '会议', '加班']
        };
    }
    
    detectScene(messages) {
        if (messages.length === 0) {
            return { scene: '未知场景', topic: '日常对话' };
        }
        
        const latestMessages = messages.slice(-5);
        const latestContent = latestMessages
            .map(msg => msg.content)
            .join(' ')
            .toLowerCase();
        
        for (const [scene, keywords] of Object.entries(this.sceneKeywords)) {
            if (keywords.some(keyword => latestContent.includes(keyword))) {
                const topic = scene.replace('场景', '');
                return { scene, topic };
            }
        }
        
        return { scene: '未知场景', topic: '日常对话' };
    }
    
    buildDialoguePrompt(character, context, options) {
        const { scene, topic, dialogueCount, situation } = options;
        
        let prompt = `你是${character.name}，请根据以下上下文生成自然的对话：\n\n`;
        prompt += `${context}\n\n`;
        prompt += `当前场景：${scene}\n`;
        prompt += `当前主题：${topic}\n`;
        prompt += `情境：${situation}\n`;
        prompt += `当前是第${dialogueCount}轮对话。\n\n`;
        
        prompt += `要求：\n`;
        prompt += `1. 生成1句对话，要与之前的对话保持连贯\n`;
        prompt += `2. 对话必须完全符合${character.name}的性格和说话方式\n`;
        prompt += `3. 语言要生动，有画面感\n`;
        prompt += `4. 不要使用旁白，直接生成角色的对话和动作\n`;
        prompt += `5. 对话要开放性，邀请用户回应\n`;
        prompt += `6. 请只输出一句对话内容，不要添加任何其他文字。\n`;
        
        return prompt;
    }
    
    buildCharacterUpdatePrompt(character, storyContent, assistant) {
        let prompt = `你是${assistant.name}，${assistant.profile.background}。\n\n`;
        prompt += `根据以下故事内容，分析${character.name}的描述、性格、背景、关系、创作者笔记和标签变化，并生成更新建议。\n\n`;
        prompt += `故事内容:\n${storyContent}\n\n`;
        prompt += `请按照以下格式输出:\n`;
        prompt += `描述: [更新后的角色描述]\n`;
        prompt += `性格: [更新后的性格描述]\n`;
        prompt += `背景: [更新后的背景描述]\n`;
        prompt += `关系: [角色1:关系类型, 角色2:关系类型]\n`;
        prompt += `创作者笔记: [更新后的创作者笔记]\n`;
        prompt += `标签: [标签1, 标签2, 标签3]\n\n`;
        prompt += `要求:\n`;
        prompt += `1. 基于故事内容分析角色的各个方面变化\n`;
        prompt += `2. 保持角色原有信息的连贯性，只添加新的信息\n`;
        prompt += `3. 关系要反映角色与其他角色的互动\n`;
        prompt += `4. 创作者笔记要记录重要的角色发展点\n`;
        prompt += `5. 标签要反映角色的特点和故事中的表现\n`;
        prompt += `6. 分析要符合你作为${assistant.name}的性格和专业领域`;
        
        return prompt;
    }
    
    buildDiaryPrompt(character, storyContent, assistant) {
        let prompt = `你是${assistant.name}，${assistant.profile.background}。\n\n`;
        prompt += `根据以下故事内容，为${character.name}生成一篇日记。\n\n`;
        prompt += `故事内容:\n${storyContent}\n\n`;
        prompt += `请以${character.name}的视角，记录这次故事的重要内容和感受。\n\n`;
        prompt += `要求:\n`;
        prompt += `1. 日记要符合${character.name}的性格和说话方式\n`;
        prompt += `2. 记录故事中的关键事件和情感变化\n`;
        prompt += `3. 语言要自然，符合日记的格式\n`;
        prompt += `4. 分析要符合你作为${assistant.name}的性格和专业领域`;
        
        return prompt;
    }
    
    buildSceneAnalysisPrompt(userMessage, characterInfo) {
        let prompt = `请分析用户的消息内容，确定当前场景，并根据角色的背景、性格和标签，判断哪些角色最适合在这个场景中参与故事。\n\n`;
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
    
    buildContextSummaryPrompt(context) {
        let prompt = `请基于以下上下文内容，生成一个简洁的前情提要：\n\n`;
        prompt += `${context}\n\n`;
        prompt += `要求：\n`;
        prompt += `1. 提取关键信息，包括角色关系、最近事件等\n`;
        prompt += `2. 保持语言简洁，突出重点\n`;
        prompt += `3. 不要添加任何不存在的信息`;
        
        return prompt;
    }
    
    buildSystemSuggestionPrompt(context) {
        let prompt = `请基于以下上下文内容，给出符合角色性格和背景的故事发展建议：\n\n`;
        prompt += `${context}\n\n`;
        prompt += `要求：\n`;
        prompt += `1. 提供3-5个故事发展建议\n`;
        prompt += `2. 每个建议要符合角色的性格特点\n`;
        prompt += `3. 建议要具体，有针对性`;
        
        return prompt;
    }
}