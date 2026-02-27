class Helpers {
    // 生成唯一ID
    static generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    // 格式化日期
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'YYYY-MM-DD HH:mm:ss':
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            case 'HH:mm:ss':
                return `${hours}:${minutes}:${seconds}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 深拷贝
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Helpers.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Helpers.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // 验证邮箱
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 验证URL
    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // 截断文本
    static truncateText(text, maxLength, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + suffix;
    }

    // 随机数生成
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 数组洗牌
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 数组去重
    static uniqueArray(array, key = null) {
        if (key) {
            return [...new Map(array.map(item => [item[key], item])).values()];
        }
        return [...new Set(array)];
    }

    // 延迟函数
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 错误处理
    static handleError(error, context = '') {
        console.error(`${context}:`, error);
        // 可以在这里添加错误日志、错误提示等
    }

    // 计算时间差
    static getTimeDifference(startDate, endDate = new Date()) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInMs = end - start;
        
        const seconds = Math.floor(diffInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }

    // 本地存储操作
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('设置本地存储失败:', error);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('获取本地存储失败:', error);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除本地存储失败:', error);
            return false;
        }
    }

    // DOM操作辅助函数
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.text) {
            element.textContent = options.text;
        }
        
        if (options.html) {
            element.innerHTML = options.html;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.styles) {
            Object.entries(options.styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }
        
        if (options.eventListeners) {
            Object.entries(options.eventListeners).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    }

    static querySelector(selector, parent = document) {
        return parent.querySelector(selector);
    }

    static querySelectorAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    // 事件总线
    static eventBus = {
        events: {},
        
        on(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
        },
        
        off(event, callback) {
            if (this.events[event]) {
                this.events[event] = this.events[event].filter(cb => cb !== callback);
            }
        },
        
        emit(event, data) {
            if (this.events[event]) {
                this.events[event].forEach(callback => callback(data));
            }
        }
    };

    // 颜色处理
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 检测设备类型
    static detectDevice() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        return {
            isMobile,
            isTablet,
            isDesktop,
            userAgent
        };
    }

    // 检测浏览器
    static detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = '';
        
        if (userAgent.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
            browserVersion = userAgent.split('Firefox/')[1].split(' ')[0];
        } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
            browserName = 'Chrome';
            browserVersion = userAgent.split('Chrome/')[1].split(' ')[0];
        } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            browserName = 'Safari';
            browserVersion = userAgent.split('Version/')[1].split(' ')[0];
        } else if (userAgent.indexOf('Edg') > -1) {
            browserName = 'Edge';
            browserVersion = userAgent.split('Edg/')[1].split(' ')[0];
        } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
            browserName = 'Internet Explorer';
            browserVersion = userAgent.split('MSIE ')[1] || userAgent.split('rv:')[1];
        }
        
        return {
            name: browserName,
            version: browserVersion
        };
    }

    // 下载文件
    static downloadFile(content, fileName, contentType = 'application/json') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // 读取文件
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// 导出辅助函数
const utils = {
    generateId: Helpers.generateId,
    formatDate: Helpers.formatDate,
    debounce: Helpers.debounce,
    throttle: Helpers.throttle,
    deepClone: Helpers.deepClone,
    validateEmail: Helpers.validateEmail,
    validateUrl: Helpers.validateUrl,
    truncateText: Helpers.truncateText,
    random: Helpers.random,
    shuffleArray: Helpers.shuffleArray,
    uniqueArray: Helpers.uniqueArray,
    delay: Helpers.delay,
    handleError: Helpers.handleError,
    getTimeDifference: Helpers.getTimeDifference,
    setLocalStorage: Helpers.setLocalStorage,
    getLocalStorage: Helpers.getLocalStorage,
    removeLocalStorage: Helpers.removeLocalStorage,
    createElement: Helpers.createElement,
    querySelector: Helpers.querySelector,
    querySelectorAll: Helpers.querySelectorAll,
    eventBus: Helpers.eventBus,
    hexToRgb: Helpers.hexToRgb,
    rgbToHex: Helpers.rgbToHex,
    detectDevice: Helpers.detectDevice,
    detectBrowser: Helpers.detectBrowser,
    downloadFile: Helpers.downloadFile,
    readFile: Helpers.readFile
};

// 在浏览器环境中，将utils挂载到全局对象
if (typeof window !== 'undefined') {
    window.utils = utils;
}