class API {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        if (typeof storage !== 'undefined') {
            return storage.getApiConfig();
        }
        // 降级方案：直接从localStorage加载
        const config = localStorage.getItem('aichat_apiConfig');
        if (config) {
            return JSON.parse(config);
        }
        return {
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

    saveConfig(config) {
        this.config = config;
        if (typeof storage !== 'undefined') {
            storage.saveApiConfig(config);
        } else {
            // 降级方案：直接保存到localStorage
            localStorage.setItem('aichat_apiConfig', JSON.stringify(config));
        }
    }

    async testConnection() {
        try {
            const response = await this.callAPI('user', '请回复"连接成功"');
            return response.includes('连接成功');
        } catch (error) {
            console.error('API连接测试失败:', error);
            return false;
        }
    }

    async callAPI(role, content) {
        if (!this.config.apiKey) {
            throw new Error('API密钥未配置');
        }

        let endpoint, headers, body;

        switch (this.config.service) {
            case 'DeepSeek':
                endpoint = 'https://api.deepseek.com/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.config.apiKey
                };
                body = {
                    model: this.config.model,
                    messages: [
                        { role: role, content: content }
                    ],
                    temperature: this.config.parameters.temperature,
                    max_tokens: this.config.parameters.max_tokens,
                    frequency_penalty: this.config.parameters.frequency_penalty,
                    presence_penalty: this.config.parameters.presence_penalty
                };
                break;
            default:
                throw new Error('不支持的AI服务');
        }

        try {
            console.log('开始API调用:', {
                endpoint: endpoint,
                service: this.config.service,
                model: this.config.model,
                messageLength: content.length
            });
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            console.log('API响应状态:', response.status, response.statusText);
            
            // 读取完整响应内容
            const responseText = await response.text();
            console.log('API响应内容:', responseText);

            if (!response.ok) {
                throw new Error('API请求失败: ' + response.status + ' ' + response.statusText + '\n响应内容: ' + responseText);
            }

            // 处理可能的Markdown代码块格式
            let cleanResponse = responseText;
            if (cleanResponse.includes('```json')) {
                // 提取代码块中的JSON
                const match = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
                if (match && match[1]) {
                    cleanResponse = match[1];
                }
            }
            
            console.log('清理后的响应内容:', cleanResponse);
            console.log('响应内容长度:', cleanResponse.length);

            let data;
            try {
                data = JSON.parse(cleanResponse);
                console.log('JSON解析成功');
            } catch (parseError) {
                console.error('JSON解析失败:', parseError);
                console.error('失败的响应内容:', cleanResponse);
                
                // 尝试处理转义字符问题
                try {
                    // 处理双重转义的JSON字符串
                    let unescapedResponse = cleanResponse;
                    // 首先移除首尾的空白字符
                    unescapedResponse = unescapedResponse.trim();
                    // 处理常见的转义字符
                    unescapedResponse = unescapedResponse.replace(/\\n/g, '\n');
                    unescapedResponse = unescapedResponse.replace(/\\r/g, '\r');
                    unescapedResponse = unescapedResponse.replace(/\\t/g, '\t');
                    unescapedResponse = unescapedResponse.replace(/\\"/g, '"');
                    unescapedResponse = unescapedResponse.replace(/\\'/g, "'");
                    unescapedResponse = unescapedResponse.replace(/\\\\/g, '\\');
                    console.log('处理转义后的内容:', unescapedResponse);
                    data = JSON.parse(unescapedResponse);
                    console.log('转义处理后解析成功');
                } catch (secondError) {
                    console.error('转义处理后仍然解析失败:', secondError);
                    // 尝试更激进的处理：移除所有反斜杠
                    try {
                        const aggressiveClean = cleanResponse.replace(/\\/g, '');
                        console.log('激进处理后的内容:', aggressiveClean);
                        data = JSON.parse(aggressiveClean);
                        console.log('激进处理后解析成功');
                    } catch (thirdError) {
                        console.error('激进处理后仍然解析失败:', thirdError);
                        // 尝试另一种方法：使用eval来处理双重转义
                        try {
                            const evalClean = cleanResponse.trim();
                            console.log('使用eval处理:', evalClean);
                            data = eval('(' + evalClean + ')');
                            console.log('eval处理后解析成功');
                        } catch (fourthError) {
                            console.error('eval处理后仍然解析失败:', fourthError);
                            throw parseError;
                        }
                    }
                }
            }
            
            console.log('API响应解析结果:', data);
            
            // 检查响应数据结构
            if (!data) {
                throw new Error('API响应格式错误，响应数据为空');
            }
            
            // 检查是否是直接的故事场景JSON（当API直接返回我们期望的格式时）
            if (data.scene && data.dialogs && data.choices) {
                console.log('API直接返回了故事场景格式');
                return data;
            }
            
            // 检查是否是标准的OpenAI格式响应
            if (!data.choices || data.choices.length === 0) {
                throw new Error('API响应格式错误，缺少choices字段');
            }
            
            if (!data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('API响应格式错误，缺少message.content字段');
            }
            
            console.log('API调用成功，返回内容长度:', data.choices[0].message.content.length);
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    }

    async generateStoryResponse(messages, characterInfo = null, currentTime = null, eroticGuide = null, storyRules = '') {
        let prompt = '';

        // 添加当前时间信息
        if (currentTime) {
            prompt += '当前时间: ' + currentTime + '\n\n';
        }

        // 添加故事规范
        if (storyRules) {
            prompt += '故事规范:\n' + storyRules + '\n\n';
        }

        if (characterInfo) {
            prompt += '角色信息:\n';
            prompt += '姓名: ' + characterInfo.name + '\n';
            
            // 优先使用流动人设，如果没有则使用固定人设
            const dynamicProfile = characterInfo.dynamicProfile || {};
            const fixedProfile = characterInfo.fixedProfile || characterInfo.profile || {};
            
            prompt += '性格: ' + (dynamicProfile.personality || fixedProfile.personality || '无') + '\n';
            prompt += '背景: ' + (dynamicProfile.background || fixedProfile.background || '无') + '\n';
            
            // 添加固定人设作为参考
            if (fixedProfile !== characterInfo.profile) {
                prompt += '参考人设（固定）:\n';
                prompt += '性格: ' + (fixedProfile.personality || '无') + '\n';
                prompt += '背景: ' + (fixedProfile.background || '无') + '\n';
            }
            
            prompt += '请以该角色的身份参与故事，保持角色风格一致，并且要考虑其他角色的行动和对话，使故事更加连贯自然。\n\n';
        }

        // 添加色情小助手的引导指令
        if (eroticGuide) {
            prompt += '引导指令:\n';
            if (eroticGuide.type === 'keyword') {
                prompt += '检测到关键词"' + eroticGuide.keyword + '"，触发了"' + eroticGuide.play + '"玩法。\n';
            } else if (eroticGuide.type === 'stat') {
                prompt += characterInfo.name + '的' + eroticGuide.statName + '达到了' + eroticGuide.statLevel + '级别，触发了"' + eroticGuide.play + '"玩法。\n';
            }
            prompt += '当前是第' + eroticGuide.dialogueCount + '轮故事。\n';
            prompt += '当前场景: ' + eroticGuide.recentScene + '\n';
            prompt += '当前主题: ' + eroticGuide.recentTopic + '\n';
            prompt += '要求: 自然地将故事引向' + eroticGuide.play + '的方向，但不要强行控制故事，保持角色的自主性。故事要开放性，邀请用户选择。\n\n';
        }

        prompt += '故事历史:\n';
        messages.forEach(msg => {
            if (msg.type === 'character') {
                prompt += msg.sender + ': ' + msg.content + '\n';
            } else if (msg.type === 'narration') {
                prompt += '旁白: ' + msg.content + '\n';
            }
        });

        prompt += '\n重要要求:\n';
        prompt += '1. 以' + (characterInfo ? characterInfo.name : '角色') + '的身份参与故事，保持角色风格一致\n';
        prompt += '2. 考虑其他角色的行动和对话，使故事更加连贯自然\n';
        prompt += '3. 故事内容要符合角色的性格特点和背景故事\n';
        prompt += '4. 故事内容要与当前情境相关，不要偏离主题\n';
        prompt += '5. 故事内容长度适中，不要过长或过短\n';
        prompt += '6. 考虑当前时间，使故事符合时间背景\n';
        if (storyRules) {
            prompt += '7. 严格遵守故事规范中的要求\n';
        }
        if (eroticGuide) {
            prompt += (storyRules ? '8' : '7') + '. 自然地将故事引向' + eroticGuide.play + '的方向，但不要强行控制故事，保持角色的自主性\n';
            prompt += (storyRules ? '9' : '8') + '. 故事要开放性，邀请用户选择，以便故事继续发展\n';
            prompt += (storyRules ? '10' : '9') + '. 如果是第5轮故事，要自然地进入' + eroticGuide.play + '的核心剧情\n';
        }
        prompt += '\n请生成下一步的故事内容:';

        return this.callAPI('user', prompt);
    }

    async generateNarration(scene, style = '描述性', format = '段落') {
        const prompt = '请以' + style + '风格，' + format + '格式，为以下场景生成旁白:\n\n' + scene;
        return this.callAPI('user', prompt);
    }

    async generateSummary(content) {
        const prompt = '请为以下内容生成50-100字的前情提要:\n\n' + content;
        return this.callAPI('user', prompt);
    }

    async generateSuggestion(context) {
        const prompt = '请根据以下上下文，生成50-100字的系统建议:\n\n' + context;
        return this.callAPI('user', prompt);
    }

    async generateDiary(characterInfo, events) {
        let prompt = '请以第一人称，为角色"' + characterInfo.name + '"写一篇日记。\n';
        prompt += '角色性格: ' + characterInfo.profile.personality + '\n';
        prompt += '最近发生的事件:\n';
        events.forEach(event => {
            prompt += '- ' + event + '\n';
        });
        prompt += '\n日记内容:';
        return this.callAPI('user', prompt);
    }

    async analyzeCharacter(characterInfo) {
        let prompt = '请详细分析以下角色的人设:\n\n';
        prompt += '角色名称: ' + characterInfo.name + '\n';
        prompt += '性格: ' + (characterInfo.profile.personality || '无') + '\n';
        prompt += '背景: ' + (characterInfo.profile.background || '无') + '\n';
        prompt += '关系: ' + JSON.stringify(characterInfo.profile.relationships || []) + '\n';
        prompt += '标签: ' + (characterInfo.profile.tags ? characterInfo.profile.tags.join(', ') : '无') + '\n';
        
        if (characterInfo.stats && characterInfo.stats.length > 0) {
            prompt += '数值: ' + JSON.stringify(characterInfo.stats) + '\n';
        }
        
        prompt += '\n请从以下几个方面进行分析:\n';
        prompt += '1. 性格特点和行为模式\n';
        prompt += '2. 背景故事分析\n';
        prompt += '3. 关系网络分析\n';
        prompt += '4. 潜在的发展方向\n';
        prompt += '5. 对话风格建议\n';
        
        const analysis = await this.callAPI('user', prompt);
        
        // 解析分析结果
        return {
            personality: {
                text: characterInfo.profile.personality || '',
                summary: analysis
            },
            background: {
                text: characterInfo.profile.background || '',
                summary: analysis
            },
            relationships: characterInfo.profile.relationships || [],
            tags: characterInfo.profile.tags || [],
            stats: characterInfo.stats || [],
            summary: analysis
        };
    }

    async generateStatsChanges(context) {
        let prompt = '请根据以下上下文，分析角色的表现，并生成合适的数值变化建议:\n\n';
        prompt += context;
        prompt += '\n请按照以下格式输出数值变化建议:\n';
        prompt += '能力名称1: 变化值\n';
        prompt += '能力名称2: 变化值\n';
        prompt += '...\n';
        prompt += '\n变化值应该根据角色在故事中的表现来确定，表现好的能力应该增加，表现差的能力可以减少或不变。';
        
        return this.callAPI('user', prompt);
    }

    async generateEvents(context) {
        let prompt = '请根据以下上下文，分析角色在故事中的表现，并生成合适的事件建议:\n\n';
        prompt += context;
        prompt += '\n请按照以下格式输出事件建议:\n';
        prompt += '事件1内容\n';
        prompt += '事件2内容\n';
        prompt += '...\n';
        prompt += '\n事件内容应该根据角色在故事中的表现和情节内容来确定，应该具体、明确，长度在10-20字之间。';
        
        return this.callAPI('user', prompt);
    }

    async analyzeEventCompletion(context) {
        let prompt = '请根据以下上下文，分析角色在故事中的表现，并判断哪些未完成事件已经完成:\n\n';
        prompt += context;
        prompt += '\n请按照以下格式输出已完成的事件:\n';
        prompt += '已完成事件1内容\n';
        prompt += '已完成事件2内容\n';
        prompt += '...\n';
        prompt += '\n判断应该基于故事记录中角色的实际表现和情节内容，只有确实完成的事件才应该被标记为完成。';
        
        return this.callAPI('user', prompt);
    }

    async updateCharacterProfile(context) {
        let prompt = '请根据以下上下文，分析角色在故事中的表现，并生成角色人设的更新建议:\n\n';
        prompt += context;
        prompt += '\n请按照以下格式输出更新建议:\n';
        prompt += '性格: 新的性格描述\n';
        prompt += '背景: 新的背景描述\n';
        prompt += '关系: 角色1:关系类型, 角色2:关系类型, ...\n';
        prompt += '标签: 标签1, 标签2, ...\n';
        prompt += '描述: 新的角色描述\n';
        prompt += '\n更新建议应该根据角色在故事中的实际表现和情节内容来确定，应该自然、合理，符合角色的整体形象。';
        
        return this.callAPI('user', prompt);
    }

    async generateItems(context) {
        let prompt = '请根据以下上下文，分析故事记录中出现的物品，并生成物品信息:\n\n';
        prompt += context;
        prompt += '\n请按照以下格式输出物品信息:\n';
        prompt += '- 物品名称1\n';
        prompt += '  描述: 物品描述\n';
        prompt += '  效果: 物品效果\n';
        prompt += '  类型: 物品类型\n';
        prompt += '- 物品名称2\n';
        prompt += '  描述: 物品描述\n';
        prompt += '  效果: 物品效果\n';
        prompt += '  类型: 物品类型\n';
        prompt += '...\n';
        prompt += '\n物品信息应该根据故事记录中的实际内容来确定，应该详细、具体，符合角色的背景和场景。';
        
        return this.callAPI('user', prompt);
    }
}

// 导出API实例
const api = new API();

// 在浏览器环境中，将api挂载到全局对象
if (typeof window !== 'undefined') {
    window.api = api;
}