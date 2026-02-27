class TimeManager {
  constructor(worldId) {
    this.worldId = worldId;
    this.currentTime = null;
    this.timeSpeed = 1;
    this.timeUnit = 'minute';
    this.isRunning = false;
    this.intervalId = null;
    this.init();
  }

  init() {
    this.loadTimeSettings();
  }

  loadTimeSettings() {
    try {
      let world = storage.getWorldById(this.worldId);
      if (!world) {
        // 创建默认世界对象
        world = {
          id: this.worldId,
          name: '默认世界',
          description: '默认世界',
          characters: [],
          chats: [],
          settings: {
            time: {
              currentTime: new Date().toISOString(),
              timeSpeed: 1,
              timeUnit: 'minute'
            }
          }
        };
        storage.saveWorld(world);
      } else if (!world.settings || !world.settings.time) {
        // 确保世界对象有settings和time属性
        world.settings = world.settings || {};
        world.settings.time = world.settings.time || {};
        world.settings.time.currentTime = new Date().toISOString();
        world.settings.time.timeSpeed = 1;
        world.settings.time.timeUnit = 'minute';
        storage.saveWorld(world);
      }
      
      // 加载时间设置
      const timeSettings = world.settings.time;
      this.currentTime = new Date(timeSettings.currentTime || new Date());
      this.timeSpeed = timeSettings.timeSpeed || 1;
      this.timeUnit = timeSettings.timeUnit || 'minute';
    } catch (error) {
      console.error('加载时间设置失败:', error);
      this.currentTime = new Date();
    }
  }

  saveTimeSettings() {
    try {
      let world = storage.getWorldById(this.worldId);
      if (!world) {
        // 创建默认世界对象
        world = {
          id: this.worldId,
          name: '默认世界',
          description: '默认世界',
          characters: [],
          chats: [],
          settings: {
            time: {}
          }
        };
      }
      
      // 确保世界对象有settings和time属性
      world.settings = world.settings || {};
      world.settings.time = world.settings.time || {};
      world.settings.time.currentTime = this.currentTime.toISOString();
      world.settings.time.timeSpeed = this.timeSpeed;
      world.settings.time.timeUnit = this.timeUnit;
      
      const saved = storage.saveWorld(world);
      if (!saved) {
        console.error('保存时间设置 - 保存失败');
      }
    } catch (error) {
      console.error('保存时间设置失败:', error);
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.advanceTime();
    }, 1000); // 每秒更新一次
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  advanceTime() {
    const millisecondsPerUnit = this.getTimeUnitMilliseconds();
    const advanceAmount = millisecondsPerUnit * this.timeSpeed;
    this.currentTime.setTime(this.currentTime.getTime() + advanceAmount);
    this.saveTimeSettings();
    this.notifyTimeUpdated();
  }

  getTimeUnitMilliseconds() {
    switch (this.timeUnit) {
      case 'second':
        return 1000;
      case 'minute':
        return 60000;
      case 'hour':
        return 3600000;
      case 'day':
        return 86400000;
      default:
        return 60000; // 默认分钟
    }
  }

  setTime(date) {
    this.currentTime = new Date(date);
    this.saveTimeSettings();
    this.notifyTimeUpdated();
  }

  setTimeSpeed(speed) {
    this.timeSpeed = speed;
    this.saveTimeSettings();
  }

  setTimeUnit(unit) {
    this.timeUnit = unit;
    this.saveTimeSettings();
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getFormattedTime(format = 'full') {
    const date = this.currentTime;
    
    switch (format) {
      case 'full':
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      case 'date':
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'time':
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      case 'iso':
        return date.toISOString();
      default:
        return date.toLocaleString('zh-CN');
    }
  }

  getTimeString() {
    return this.getFormattedTime('full');
  }

  notifyTimeUpdated() {
    // 触发时间更新事件
    const event = new CustomEvent('timeUpdated', {
      detail: {
        currentTime: this.currentTime,
        formattedTime: this.getFormattedTime()
      }
    });
    document.dispatchEvent(event);
  }

  resetTime() {
    this.currentTime = new Date();
    this.saveTimeSettings();
    this.notifyTimeUpdated();
  }

  addTime(amount, unit = this.timeUnit) {
    const milliseconds = this.convertToMilliseconds(amount, unit);
    this.currentTime.setTime(this.currentTime.getTime() + milliseconds);
    this.saveTimeSettings();
    this.notifyTimeUpdated();
  }

  subtractTime(amount, unit = this.timeUnit) {
    const milliseconds = this.convertToMilliseconds(amount, unit);
    this.currentTime.setTime(this.currentTime.getTime() - milliseconds);
    this.saveTimeSettings();
    this.notifyTimeUpdated();
  }

  convertToMilliseconds(amount, unit) {
    const millisecondsPerUnit = this.getTimeUnitMilliseconds();
    switch (unit) {
      case 'second':
        return amount * 1000;
      case 'minute':
        return amount * 60000;
      case 'hour':
        return amount * 3600000;
      case 'day':
        return amount * 86400000;
      default:
        return amount * millisecondsPerUnit;
    }
  }

  getTimeSpeed() {
    return this.timeSpeed;
  }

  getTimeUnit() {
    return this.timeUnit;
  }

  isTimeRunning() {
    return this.isRunning;
  }
}

class TimeSystemUI {
  constructor(timeManager) {
    this.timeManager = timeManager;
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.updateTimeDisplay();
    this.disableControls(); // 初始时禁用所有控制元素
  }

  setupElements() {
    this.timeDisplay = document.getElementById('currentTime');
    this.timeSpeedInput = document.getElementById('timeSpeed');
    this.timeUnitSelect = document.getElementById('timeUnit');
    this.startButton = document.getElementById('startTime');
    this.stopButton = document.getElementById('stopTime');
    this.resetButton = document.getElementById('resetTime');
    this.setTimeButton = document.getElementById('setTime');
    this.timeInput = document.getElementById('timeInput');
    this.addHourButton = document.getElementById('addHour');
    this.addDayButton = document.getElementById('addDay');
    this.editButton = document.getElementById('editButton');
    this.saveButton = document.getElementById('saveButton');
    this.isEditMode = false;
  }

  setupEventListeners() {
    // 时间速度和单位变化
    if (this.timeSpeedInput) {
      this.timeSpeedInput.addEventListener('input', (e) => {
        this.timeManager.setTimeSpeed(parseFloat(e.target.value));
      });
    }

    if (this.timeUnitSelect) {
      this.timeUnitSelect.addEventListener('change', (e) => {
        this.timeManager.setTimeUnit(e.target.value);
      });
    }

    // 控制按钮
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        this.timeManager.start();
        this.updateControlButtons();
      });
    }

    if (this.stopButton) {
      this.stopButton.addEventListener('click', () => {
        this.timeManager.stop();
        this.updateControlButtons();
      });
    }

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        this.timeManager.resetTime();
      });
    }

    if (this.setTimeButton) {
      this.setTimeButton.addEventListener('click', () => {
        if (this.timeInput && this.timeInput.value) {
          this.timeManager.setTime(this.timeInput.value);
        } else {
          console.error('设置时间 - 输入值为空');
        }
      });
    }

    // 快捷时间调整
    if (this.addHourButton) {
      this.addHourButton.addEventListener('click', () => {
        this.timeManager.addTime(1, 'hour');
      });
    }

    if (this.addDayButton) {
      this.addDayButton.addEventListener('click', () => {
        this.timeManager.addTime(1, 'day');
      });
    }

    // 编辑和保存按钮
    if (this.editButton) {
      this.editButton.addEventListener('click', () => {
        this.toggleEditMode();
      });
    }

    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => {
        this.saveChanges();
      });
    }

    // 监听时间更新事件
    document.addEventListener('timeUpdated', () => {
      this.updateTimeDisplay();
    });
  }

  updateTimeDisplay() {
    if (this.timeDisplay) {
      this.timeDisplay.textContent = this.timeManager.getFormattedTime('full');
    }

    if (this.timeSpeedInput) {
      this.timeSpeedInput.value = this.timeManager.getTimeSpeed();
    }

    if (this.timeUnitSelect) {
      this.timeUnitSelect.value = this.timeManager.getTimeUnit();
    }

    if (this.timeInput) {
      this.timeInput.value = this.timeManager.getCurrentTime().toISOString().slice(0, 16);
    }
  }

  updateControlButtons() {
    const isRunning = this.timeManager.isTimeRunning();
    
    if (this.startButton) {
      this.startButton.disabled = isRunning;
    }
    
    if (this.stopButton) {
      this.stopButton.disabled = !isRunning;
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      // 进入编辑模式
      if (this.editButton) this.editButton.textContent = '取消';
      if (this.saveButton) this.saveButton.disabled = false;
      this.enableControls();
    } else {
      // 退出编辑模式
      if (this.editButton) this.editButton.textContent = '编辑';
      if (this.saveButton) this.saveButton.disabled = true;
      this.disableControls();
    }
  }

  enableControls() {
    // 启用所有控制元素
    if (this.timeSpeedInput) this.timeSpeedInput.disabled = false;
    if (this.timeUnitSelect) this.timeUnitSelect.disabled = false;
    if (this.startButton) this.startButton.disabled = false;
    if (this.stopButton) this.stopButton.disabled = false;
    if (this.resetButton) this.resetButton.disabled = false;
    if (this.setTimeButton) this.setTimeButton.disabled = false;
    if (this.timeInput) this.timeInput.disabled = false;
    if (this.addHourButton) this.addHourButton.disabled = false;
    if (this.addDayButton) this.addDayButton.disabled = false;
  }

  disableControls() {
    // 禁用所有控制元素
    if (this.timeSpeedInput) this.timeSpeedInput.disabled = true;
    if (this.timeUnitSelect) this.timeUnitSelect.disabled = true;
    if (this.startButton) this.startButton.disabled = true;
    if (this.stopButton) this.stopButton.disabled = true;
    if (this.resetButton) this.resetButton.disabled = true;
    if (this.setTimeButton) this.setTimeButton.disabled = true;
    if (this.timeInput) this.timeInput.disabled = true;
    if (this.addHourButton) this.addHourButton.disabled = true;
    if (this.addDayButton) this.addDayButton.disabled = true;
  }

  saveChanges() {
    // 保存更改
    this.timeManager.saveTimeSettings();
    this.toggleEditMode(); // 保存后退出编辑模式
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    let worldId = new URLSearchParams(window.location.search).get('worldId');
    // 如果没有worldId，尝试从本地存储获取
    if (!worldId) {
      worldId = localStorage.getItem('currentWorldId');
    }
    // 如果仍然没有worldId，使用默认值
    if (!worldId) {
      worldId = 'default';
    }
    console.log('初始化时间系统 - 世界ID:', worldId);
    const timeManager = new TimeManager(worldId);
    new TimeSystemUI(timeManager);
  });
} else {
  let worldId = new URLSearchParams(window.location.search).get('worldId');
  // 如果没有worldId，尝试从本地存储获取
  if (!worldId) {
    worldId = localStorage.getItem('currentWorldId');
  }
  // 如果仍然没有worldId，使用默认值
  if (!worldId) {
    worldId = 'default';
  }
  console.log('初始化时间系统 - 世界ID:', worldId);
  const timeManager = new TimeManager(worldId);
  new TimeSystemUI(timeManager);
}