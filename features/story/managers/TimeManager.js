class TimeManager {
    constructor(worldId, storage, onTimeChangeCallback) {
        this.worldId = worldId;
        this.storage = storage;
        this.currentDate = null;
        this.onTimeChangeCallback = onTimeChangeCallback;
        this.timeUpdateInterval = null;
        this.timeSettings = {
            speed: 'minute', // 时间流逝速度：second, minute, hour, day
            interval: 5000, // 时间更新间隔（毫秒）
            autoUpdate: false // 是否自动更新时间
        };
    }
    
    initialize() {
        this.loadTimeSettings();
        this.updateTimeDisplay();
        this.startAutoUpdate();
    }
    
    getCurrentDate() {
        return this.currentDate;
    }
    
    setCurrentDate(date) {
        this.currentDate = date;
        this.updateTimeDisplay();
        if (this.onTimeChangeCallback) {
            this.onTimeChangeCallback(date);
        }
    }
    
    updateTimeDisplay() {
        const timeElement = document.getElementById('currentTime');
        if (!timeElement) return;
        
        let savedTime = this.loadSavedTime();
        if (!savedTime) {
            savedTime = new Date();
        }
        
        this.currentDate = savedTime;
        timeElement.textContent = this.formatDate(savedTime);
    }
    
    loadSavedTime() {
        const world = this.storage.getWorldById(this.worldId);
        if (world && world.settings && world.settings.time) {
            return new Date(world.settings.time);
        }
        return null;
    }
    
    formatDate(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    editTime() {
        const modal = document.getElementById('time-edit-modal');
        const timeInput = document.getElementById('time-input');
        
        if (modal && timeInput) {
            const currentDate = this.currentDate || new Date();
            const isoString = currentDate.toISOString().slice(0, 16);
            timeInput.value = isoString;
            modal.style.display = 'flex';
        }
    }
    
    closeTimeModal() {
        const modal = document.getElementById('time-edit-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    saveTime() {
        const timeInput = document.getElementById('time-input');
        const modal = document.getElementById('time-edit-modal');
        
        if (timeInput && timeInput.value) {
            const newDate = new Date(timeInput.value);
            this.setCurrentDate(newDate);
            this.persistTime(newDate);
        }
        
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    persistTime(date) {
        const world = this.storage.getWorldById(this.worldId);
        if (world) {
            world.settings = world.settings || {};
            world.settings.time = date.toISOString();
            this.storage.saveWorld(world);
        }
    }
    
    loadTimeSettings() {
        // 首先从时间小助手的设置中读取配置
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const timeAssistant = assistants.find(a => a.id === 'time-assistant');
                if (timeAssistant && timeAssistant.settings) {
                    this.timeSettings = {
                        ...this.timeSettings,
                        speed: timeAssistant.settings.speed || 'minute',
                        interval: timeAssistant.settings.interval || 5000,
                        autoUpdate: timeAssistant.settings.autoUpdate || false
                    };
                }
            } catch (error) {
                console.error('解析小助手数据失败:', error);
            }
        }
        
        // 然后从世界设置中读取配置（作为后备）
        const world = this.storage.getWorldById(this.worldId);
        if (world && world.settings && world.settings.timeSettings) {
            this.timeSettings = { ...this.timeSettings, ...world.settings.timeSettings };
        }
    }
    
    saveTimeSettings() {
        // 保存到世界设置中
        const world = this.storage.getWorldById(this.worldId);
        if (world) {
            world.settings = world.settings || {};
            world.settings.timeSettings = this.timeSettings;
            this.storage.saveWorld(world);
        }
        
        // 同时更新时间小助手的设置
        const storedAssistants = localStorage.getItem(`assistants_${this.worldId}`);
        if (storedAssistants) {
            try {
                const assistants = JSON.parse(storedAssistants);
                const timeAssistantIndex = assistants.findIndex(a => a.id === 'time-assistant');
                if (timeAssistantIndex !== -1) {
                    assistants[timeAssistantIndex].settings = {
                        ...assistants[timeAssistantIndex].settings,
                        speed: this.timeSettings.speed,
                        interval: this.timeSettings.interval,
                        autoUpdate: this.timeSettings.autoUpdate
                    };
                    localStorage.setItem(`assistants_${this.worldId}`, JSON.stringify(assistants));
                }
            } catch (error) {
                console.error('更新小助手数据失败:', error);
            }
        }
    }
    
    startAutoUpdate() {
        // 清除现有的定时器
        this.stopAutoUpdate();
        
        // 如果启用了自动更新，启动定时器
        if (this.timeSettings.autoUpdate) {
            this.timeUpdateInterval = setInterval(() => {
                this.updateTimeBySpeed();
            }, this.timeSettings.interval);
        }
    }
    
    stopAutoUpdate() {
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
    }
    
    updateTimeBySpeed() {
        const currentDate = this.currentDate || new Date();
        const newDate = new Date(currentDate);
        
        switch (this.timeSettings.speed) {
            case 'second':
                newDate.setSeconds(newDate.getSeconds() + 1);
                break;
            case 'minute':
                newDate.setMinutes(newDate.getMinutes() + 1);
                break;
            case 'hour':
                newDate.setHours(newDate.getHours() + 1);
                break;
            case 'day':
                newDate.setDate(newDate.getDate() + 1);
                break;
        }
        
        this.setCurrentDate(newDate);
        this.persistTime(newDate);
    }
    
    setTimeSettings(settings) {
        this.timeSettings = { ...this.timeSettings, ...settings };
        this.saveTimeSettings();
        this.startAutoUpdate();
    }
    
    getTimeSettings() {
        return this.timeSettings;
    }
    
    analyzeTimeContent(content) {
        const adjustments = this.detectTimeAdjustments(content);
        if (adjustments.length > 0) {
            const adjustment = adjustments[0];
            this.applyTimeAdjustment(adjustment);
        }
    }
    
    detectTimeAdjustments(content) {
        const patterns = [
            { pattern: /十年后|10年后/g, years: 10 },
            { pattern: /五年后|5年后/g, years: 5 },
            { pattern: /一年后|1年后/g, years: 1 },
            { pattern: /半年后|6个月后/g, months: 6 },
            { pattern: /三个月后|3个月后/g, months: 3 },
            { pattern: /一个月后|1个月后/g, months: 1 },
            { pattern: /两周后|14天后/g, days: 14 },
            { pattern: /一周后|7天后/g, days: 7 },
            { pattern: /三天后|3天后/g, days: 3 },
            { pattern: /两天后|2天后/g, days: 2 },
            { pattern: /一天后|1天后|明天/g, days: 1 },
            { pattern: /12小时后|半天后/g, hours: 12 },
            { pattern: /6小时后/g, hours: 6 },
            { pattern: /3小时后/g, hours: 3 },
            { pattern: /2小时后/g, hours: 2 },
            { pattern: /1小时后|一小时后/g, hours: 1 },
            { pattern: /30分钟后|半小时后/g, minutes: 30 },
            { pattern: /15分钟后/g, minutes: 15 },
            { pattern: /10分钟后/g, minutes: 10 },
            { pattern: /5分钟后/g, minutes: 5 },
            { pattern: /1分钟后/g, minutes: 1 }
        ];
        
        const adjustments = [];
        for (const { pattern, ...adjustment } of patterns) {
            if (pattern.test(content)) {
                adjustments.push(adjustment);
            }
        }
        return adjustments;
    }
    
    applyTimeAdjustment(adjustment) {
        const currentDate = this.currentDate || new Date();
        const newDate = new Date(currentDate);
        
        if (adjustment.years) {
            newDate.setFullYear(newDate.getFullYear() + adjustment.years);
        } else if (adjustment.months) {
            newDate.setMonth(newDate.getMonth() + adjustment.months);
        } else if (adjustment.days) {
            newDate.setDate(newDate.getDate() + adjustment.days);
        } else if (adjustment.hours) {
            newDate.setHours(newDate.getHours() + adjustment.hours);
        } else if (adjustment.minutes) {
            newDate.setMinutes(newDate.getMinutes() + adjustment.minutes);
        }
        
        this.setCurrentDate(newDate);
    }
    
    detectTimePassage(content) {
        const timePassageKeywords = [
            '过了一会儿', '过了一段时间', '过了几个小时',
            '过了一天', '过了一周', '过了一个月',
            '时间过得很快', '时间流逝', '几个小时后'
        ];
        
        for (const keyword of timePassageKeywords) {
            if (content.includes(keyword)) {
                this.adjustTimeByPassage(keyword);
                break;
            }
        }
    }
    
    adjustTimeByPassage(keyword) {
        const currentDate = this.currentDate || new Date();
        const newDate = new Date(currentDate);
        
        if (keyword.includes('一会儿') || keyword.includes('一段时间')) {
            newDate.setMinutes(newDate.getMinutes() + 30);
        } else if (keyword.includes('几个小时')) {
            newDate.setHours(newDate.getHours() + 3);
        } else if (keyword.includes('一天')) {
            newDate.setDate(newDate.getDate() + 1);
        } else if (keyword.includes('一周')) {
            newDate.setDate(newDate.getDate() + 7);
        } else if (keyword.includes('一个月')) {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        
        this.setCurrentDate(newDate);
    }
    
    extractTimeFromText(text) {
        const timePatterns = [
            /(\d{4})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\s+(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])/,
            /(\d{4})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\s+(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])/,
            /(\d{4})年(0[1-9]|1[0-2])月(0[1-9]|[12]\d|3[01])日\s+(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])/,
            /(\d{4})年(0[1-9]|1[0-2])月(0[1-9]|[12]\d|3[01])日\s+(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])/,
            /(\d{4})年(0[1-9]|1[0-2])月(0[1-9]|[12]\d|3[01])日/,
            /(\d{4})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])/
        ];
        
        for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match) {
                return new Date(match[0]);
            }
        }
        return null;
    }
    
    formatCurrentTime() {
        const currentTime = this.currentDate || new Date();
        return currentTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    adjustTimeToLatestDiary() {
        let savedTime = this.loadSavedTime();
        if (!savedTime) {
            const latestDate = this.getLatestDiaryDate();
            if (latestDate) {
                this.setCurrentDate(latestDate);
            }
        }
    }
    
    getLatestDiaryDate() {
        const allCharacters = this.storage.getCharactersByWorldId(this.worldId);
        let latestDate = null;
        
        allCharacters.forEach(character => {
            if (character.diaries && character.diaries.length > 0) {
                character.diaries.forEach(diary => {
                    const contentDate = this.extractTimeFromText(diary.content);
                    if (contentDate) {
                        if (!latestDate || contentDate > latestDate) {
                            latestDate = contentDate;
                        }
                    } else {
                        const diaryDate = new Date(diary.date);
                        if (!latestDate || diaryDate > latestDate) {
                            latestDate = diaryDate;
                        }
                    }
                });
            }
        });
        
        return latestDate;
    }
}