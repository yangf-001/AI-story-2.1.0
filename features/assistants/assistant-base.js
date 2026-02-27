// 小助手基类
class AssistantBase {
    constructor(worldId) {
        this.worldId = worldId;
        this.id = '';
        this.name = '';
        this.color = '';
    }
    
    // 生成设置面板HTML
    generateSettingsHTML(settings) {
        throw new Error('子类必须实现 generateSettingsHTML 方法');
    }
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        throw new Error('子类必须实现 bindSettingsEvents 方法');
    }
    
    // 通用的保存按钮绑定
    bindSaveButton(onSave) {
        const saveBtn = document.getElementById('save-assistant-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', onSave);
        }
    }
    
    // 生成复选框组件
    generateCheckbox(id, label, checked, color) {
        return `
            <div class="form-group">
                <label for="${id}" style="display: flex; align-items: center; gap: var(--spacing-sm); ${color ? `color: ${color};` : ''}">
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} />
                    ${label}
                </label>
            </div>
        `;
    }
    
    // 生成选择框组件
    generateSelect(id, label, options, selectedValue, color) {
        const borderColor = color ? color : 'var(--border-color)';
        return `
            <div class="form-group">
                <label for="${id}" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500;">${label}:</label>
                <select id="${id}" style="width: 100%; padding: var(--spacing-sm); border: 1px solid ${borderColor}; border-radius: var(--border-radius-md);">
                    ${options.map(opt => `
                        <option value="${opt.value}" ${opt.value === selectedValue ? 'selected' : ''}>${opt.label}</option>
                    `).join('')}
                </select>
            </div>
        `;
    }
    
    // 生成范围输入组件
    generateRangeInput(id, label, min, max, value, suffix = '') {
        return `
            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                <label for="${id}" style="flex: 1;">${label}:</label>
                <input type="range" id="${id}" min="${min}" max="${max}" value="${value}" style="flex: 2;" />
                <span id="${id}-value" style="width: 40px; text-align: right;">${value}${suffix}</span>
            </div>
        `;
    }
    
    // 生成文本输入组件
    generateTextInput(id, label, value, placeholder = '') {
        return `
            <div class="form-group">
                <label for="${id}">${label}:</label>
                <input type="text" id="${id}" value="${value || ''}" placeholder="${placeholder}" />
            </div>
        `;
    }
    
    // 生成文本域组件
    generateTextarea(id, label, value, placeholder = '') {
        return `
            <div class="form-group">
                <label for="${id}" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 500; color: var(--text-color); font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: 0.05em;">${label}:</label>
                <textarea id="${id}" placeholder="${placeholder}" style="width: 100%; min-height: 150px; margin-bottom: var(--spacing-md);">${value || ''}</textarea>
            </div>
        `;
    }
    
    // 生成按钮组件
    generateButton(id, label, style = '') {
        return `
            <button id="${id}" ${style ? `style="${style}"` : ''}>${label}</button>
        `;
    }
    
    // 生成标签组组件
    generateLabelGroup(id, items, color) {
        const borderColor = color ? color : 'var(--border-color)';
        const backgroundColor = color ? this.getLightColor(color) : 'var(--background-light)';
        
        return `
            <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                ${items.map((item, index) => `
                    <label for="${id}-${index}" style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; border: 1px solid ${borderColor}; border-radius: 16px; background-color: ${backgroundColor};">
                        <input type="checkbox" id="${id}-${index}" checked />
                        ${item}
                    </label>
                `).join('')}
            </div>
        `;
    }
    
    // 获取浅色版本的颜色
    getLightColor(color) {
        // 简单的颜色转换，实际项目中可能需要更复杂的实现
        const colorMap = {
            '#be185d': '#fdf2f8',
            '#3b82f6': '#eff6ff',
            '#f59e0b': '#fffbeb',
            '#8b5cf6': '#f5f3ff',
            '#10b981': '#ecfdf5',
            '#6366f1': '#f5f3ff'
        };
        return colorMap[color] || '#f9fafb';
    }
}

// 导出模块
export default AssistantBase;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssistantBase;
} else if (typeof window !== 'undefined') {
    window.AssistantBase = AssistantBase;
}