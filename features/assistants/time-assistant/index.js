// 时间小助手模块
import AssistantBase from '../assistant-base.js';

class TimeAssistant extends AssistantBase {
    constructor(worldId) {
        super(worldId);
        this.id = 'time-assistant';
        this.name = '时间小助手';
        this.color = '#6366f1';
        this.settings = this.loadSettings();
        this.currentTime = this.loadCurrentTime();
    }

    loadSettings() {
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const timeAssistant = assistants.find(a => a.id === 'time-assistant');
                if (timeAssistant && timeAssistant.settings) {
                    return timeAssistant.settings;
                }
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        return {
            enabled: true,
            autoUpdate: false,
            timeSpeed: 1 // 时间流逝速度倍率
        };
    }

    loadCurrentTime() {
        const storedTime = localStorage.getItem(`world_time_${this.worldId}`);
        if (storedTime) {
            try {
                return JSON.parse(storedTime);
            } catch (error) {
                console.error('解析时间数据失败:', error);
            }
        }

        // 默认时间设置
        return {
            year: 2024,
            month: 1,
            day: 1,
            hour: 8,
            minute: 0,
            second: 0,
            weekday: 1 // 1-7，1表示周一
        };
    }

    saveSettings() {
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        let assistants = [];
        if (storedAssistants) {
            try {
                assistants = JSON.parse(storedAssistants);
            } catch (error) {
                console.error('解析assistants存储失败:', error);
            }
        }

        const index = assistants.findIndex(a => a.id === 'time-assistant');
        if (index >= 0) {
            assistants[index] = {
                ...assistants[index],
                settings: this.settings
            };
        } else {
            assistants.push({
                id: 'time-assistant',
                name: '时间小助手',
                description: '管理游戏世界的时间流逝和时间相关事件',
                profile: {
                    personality: '精准、有耐心、善于感知时间变化',
                    background: '我是专门负责管理时间的小助手，帮助你控制游戏世界的时间流逝，并根据故事内容智能调整时间。',
                    tags: ['时间管理', '时间控制', '时间感知']
                },
                settings: this.settings
            });
        }

        localStorage.setItem(`assistants_${this.worldId}`, JSON.stringify(assistants));
    }

    saveCurrentTime() {
        localStorage.setItem(`world_time_${this.worldId}`, JSON.stringify(this.currentTime));
    }

    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        this.saveSettings();
    }

    // 推进时间
    advanceTime(hours = 1) {
        if (!this.settings.enabled) return this.currentTime;

        const totalMinutes = hours * 60 * this.settings.timeSpeed;
        let minutes = this.currentTime.minute + totalMinutes;
        let hoursAdded = Math.floor(minutes / 60);
        minutes = minutes % 60;

        let hour = this.currentTime.hour + hoursAdded;
        let day = this.currentTime.day;
        let month = this.currentTime.month;
        let year = this.currentTime.year;

        // 处理小时进位
        while (hour >= 24) {
            hour -= 24;
            day += 1;
            this.currentTime.weekday = (this.currentTime.weekday % 7) + 1;

            // 处理月份进位
            const daysInMonth = this.getDaysInMonth(month, year);
            if (day > daysInMonth) {
                day = 1;
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            }
        }

        this.currentTime = {
            ...this.currentTime,
            year,
            month,
            day,
            hour,
            minute: minutes,
            second: 0
        };

        this.saveCurrentTime();
        return this.currentTime;
    }

    // 获取月份天数
    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    // 格式化时间显示
    formatTime() {
        const { year, month, day, hour, minute, weekday } = this.currentTime;
        const weekdays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return `${year}年${month}月${day}日 ${weekdays[weekday]} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    // 根据故事内容智能调整时间
    adjustTimeBasedOnStory(storyContent) {
        if (!this.settings.enabled) return;

        // 可以根据故事内容中的时间线索调整时间
        // 例如：检测到"过了一个星期"，就推进7天
        if (storyContent.includes('过了一个星期') || storyContent.includes('一周后')) {
            for (let i = 0; i < 7; i++) {
                this.advanceTime(24);
            }
        } else if (storyContent.includes('过了一天') || storyContent.includes('第二天')) {
            this.advanceTime(24);
        } else if (storyContent.includes('过了几个小时')) {
            this.advanceTime(3);
        }
    }
    
    // 生成设置面板HTML
    generateSettingsHTML(settings) {
        return `
            <h3 style="color: ${this.color};">${this.name}设置</h3>
            ${this.generateCheckbox('assistant-enabled', `启用${this.name}`, settings.enabled, this.color)}
            
            <div class="form-group" style="margin-top: var(--spacing-lg);">
                <h4 style="color: ${this.color}; margin-bottom: var(--spacing-md);">时间设置</h4>
                <div class="form-group">
                    <label for="time-speed">时间流逝速度:</label>
                    <select id="time-speed" style="width: 100%; padding: var(--spacing-sm); border: 1px solid #c7d2fe; border-radius: var(--border-radius-md); background-color: #f5f3ff;">
                        <option value="second" ${(settings.speed === 'second') ? 'selected' : ''}>秒</option>
                        <option value="minute" ${(settings.speed === 'minute' || !settings.speed) ? 'selected' : ''}>分钟</option>
                        <option value="hour" ${(settings.speed === 'hour') ? 'selected' : ''}>小时</option>
                        <option value="day" ${(settings.speed === 'day') ? 'selected' : ''}>天</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin-top: var(--spacing-md);">
                    <label for="time-interval">时间更新间隔（毫秒）:</label>
                    <input type="number" id="time-interval" value="${settings.interval || 5000}" min="1000" max="60000" style="width: 100%; padding: var(--spacing-sm); border: 1px solid #c7d2fe; border-radius: var(--border-radius-md); background-color: #f5f3ff;" />
                </div>
                
                <div class="form-group" style="margin-top: var(--spacing-md);">
                    ${this.generateCheckbox('time-auto-update', '自动更新时间', settings.autoUpdate)}
                </div>
            </div>
            
            ${this.generateTextInput('assistant-description', '小助手描述', settings.description)}
            ${this.generateButton('save-assistant-settings', '保存小助手设置', 'background-color: #6366f1; color: white;')}
        `;
    }
    
    // 绑定设置面板事件
    bindSettingsEvents() {
        // 时间小助手不需要额外的事件绑定
    }
}

// 导出模块
export default TimeAssistant;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeAssistant;
} else if (typeof window !== 'undefined') {
    window.TimeAssistant = TimeAssistant;
}