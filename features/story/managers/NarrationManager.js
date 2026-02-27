class NarrationManager {
    constructor() {
        this.settings = this.loadSettings();
        this.predefinedOutputs = [
            '描述性-段落', '描述性-短句', '描述性-诗歌',
            '叙事性-段落', '叙事性-短句', '叙事性-诗歌',
            '抒情性-段落', '抒情性-短句', '抒情性-诗歌',
            '戏剧性-段落', '戏剧性-短句', '戏剧性-诗歌'
        ];
    }
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('aichat_narrationSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.style && settings.format) {
                    return { output: `${settings.style}-${settings.format}` };
                }
                return settings;
            }
            return { output: '描述性-段落' };
        } catch (error) {
            console.error('加载旁白设置失败:', error);
            return { output: '描述性-段落' };
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem('aichat_narrationSettings', JSON.stringify(settings));
            this.settings = settings;
            return true;
        } catch (error) {
            console.error('保存旁白设置失败:', error);
            return false;
        }
    }
    
    getSettings() {
        return this.settings;
    }
    
    getOutputFormat() {
        return this.settings.output || '描述性-段落';
    }
    
    openModal() {
        const modal = document.getElementById('narration-modal');
        if (!modal) return;
        
        const outputSelect = document.getElementById('narration-output');
        const customOutputGroup = document.getElementById('custom-output-group');
        const customOutputInput = document.getElementById('custom-narration-output');
        
        const currentOutput = this.getOutputFormat();
        const isCustomOutput = !this.predefinedOutputs.includes(currentOutput);
        
        outputSelect.value = isCustomOutput ? '自定义' : currentOutput;
        customOutputGroup.style.display = isCustomOutput ? 'block' : 'none';
        customOutputInput.value = isCustomOutput ? currentOutput : '';
        
        modal.style.display = 'flex';
    }
    
    closeModal() {
        const modal = document.getElementById('narration-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    saveFromModal() {
        const outputSelect = document.getElementById('narration-output');
        const customOutputInput = document.getElementById('custom-narration-output');
        
        if (outputSelect && customOutputInput) {
            const output = outputSelect.value === '自定义' 
                ? customOutputInput.value.trim() 
                : outputSelect.value;
            
            if (output) {
                this.saveSettings({ output });
            }
        }
        
        this.closeModal();
    }
    
    createNarrationMessage(content) {
        return {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            sender: '旁白',
            content: content,
            type: 'narration',
            timestamp: new Date().toISOString(),
            output: this.getOutputFormat()
        };
    }
    
    saveNarrationSettingsToStorage(settings) {
        return this.saveSettings(settings);
    }
    
    loadNarrationSettings() {
        return this.loadSettings();
    }
}