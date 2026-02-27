document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('api-config-form');
    const testButton = document.getElementById('test-connection');
    const testResult = document.getElementById('test-result');

    // 加载现有配置
    loadConfig();

    // 监听AI服务选择变化
    document.getElementById('ai-service').addEventListener('change', function() {
        updateModelOptions(this.value);
    });

    // 测试连接
    testButton.addEventListener('click', async function() {
        testButton.disabled = true;
        testButton.innerHTML = '<span class="loading"></span> 测试中...';
        testResult.style.display = 'none';

        try {
            // 临时保存当前配置用于测试
            const config = getFormConfig();
            storage.saveApiConfig(config);
            
            // 测试连接
            const result = await api.testConnection();
            
            if (result) {
                showAlert('success', 'API连接测试成功！');
            } else {
                showAlert('error', 'API连接测试失败，请检查配置。');
            }
        } catch (error) {
            console.error('测试连接失败:', error);
            showAlert('error', `测试失败: ${error.message}`);
        } finally {
            testButton.disabled = false;
            testButton.innerHTML = '测试连接';
        }
    });

    // 保存配置
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const config = getFormConfig();
        storage.saveApiConfig(config);
        
        // 更新API实例的配置
        api.config = config;
        
        showAlert('success', '配置保存成功！');
    });

    // 加载配置
    function loadConfig() {
        const config = storage.getApiConfig();
        if (config) {
            document.getElementById('ai-service').value = config.service || 'DeepSeek';
            document.getElementById('api-key').value = config.apiKey || '';
            document.getElementById('model').value = config.model || 'deepseek-chat';
            document.getElementById('temperature').value = config.parameters?.temperature || 0.7;
            document.getElementById('max-tokens').value = config.parameters?.max_tokens || 1024;
            document.getElementById('frequency-penalty').value = config.parameters?.frequency_penalty || 0;
            document.getElementById('presence-penalty').value = config.parameters?.presence_penalty || 0;
            
            // 更新模型选项
            updateModelOptions(config.service || 'DeepSeek');
        }
    }

    // 获取表单配置
    function getFormConfig() {
        return {
            service: document.getElementById('ai-service').value,
            apiKey: document.getElementById('api-key').value,
            model: document.getElementById('model').value,
            parameters: {
                temperature: parseFloat(document.getElementById('temperature').value),
                max_tokens: parseInt(document.getElementById('max-tokens').value),
                frequency_penalty: parseFloat(document.getElementById('frequency-penalty').value),
                presence_penalty: parseFloat(document.getElementById('presence-penalty').value)
            }
        };
    }

    // 更新模型选项
    function updateModelOptions(service) {
        const modelSelect = document.getElementById('model');
        modelSelect.innerHTML = '';
        
        switch (service) {
            case 'DeepSeek':
                modelSelect.innerHTML = `
                    <option value="deepseek-chat">deepseek-chat</option>
                    <option value="deepseek-coder">deepseek-coder</option>
                `;
                break;
            case 'OpenAI':
                modelSelect.innerHTML = `
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                `;
                break;
            case 'Anthropic':
                modelSelect.innerHTML = `
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                `;
                break;
            case 'Google':
                modelSelect.innerHTML = `
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-ultra">Gemini Ultra</option>
                `;
                break;
        }
    }

    // 显示提示信息
    function showAlert(type, message) {
        testResult.className = `alert ${type}`;
        testResult.textContent = message;
        testResult.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(function() {
            testResult.style.display = 'none';
        }, 3000);
    }
});