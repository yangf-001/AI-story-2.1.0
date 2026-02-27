class AnalyticsManager {
  constructor(worldId) {
    this.worldId = worldId;
    // 使用全局的storage对象
  }

  // 获取世界统计数据
  getWorldStats() {
    try {
      const world = storage.getWorldById(this.worldId);
      if (!world) {
        return null;
      }

      return {
        worldName: world.name,
        createdAt: world.createdAt || new Date().toISOString(),
        lastModified: world.lastModified || new Date().toISOString(),
        characterCount: world.characters ? world.characters.length : 0,
        storyCount: world.stories ? world.stories.length : 0
      };
    } catch (error) {
      console.error('获取世界统计数据失败:', error);
      return null;
    }
  }

  // 获取故事统计数据
  getStoryStats() {
    try {
      const world = storage.getWorldById(this.worldId);
      if (!world || !world.stories) {
        return {
          totalMessages: 0,
          userMessages: 0,
          aiMessages: 0,
          averageMessageLength: 0,
          messagesPerDay: {}
        };
      }

      let totalMessages = 0;
      let userMessages = 0;
      let aiMessages = 0;
      let totalMessageLength = 0;
      const messagesPerDay = {};

      world.stories.forEach(storyId => {
        const story = storage.getStoryById(storyId);
        if (story && story.messages) {
          story.messages.forEach(message => {
            totalMessages++;
            totalMessageLength += message.content.length;

            if (message.sender === '用户') {
              userMessages++;
            } else {
              aiMessages++;
            }

            // 按日期统计
            const date = new Date(message.timestamp).toISOString().split('T')[0];
            messagesPerDay[date] = (messagesPerDay[date] || 0) + 1;
          });
        }
      });

      const averageMessageLength = totalMessages > 0 ? totalMessageLength / totalMessages : 0;

      return {
        totalMessages,
        userMessages,
        aiMessages,
        averageMessageLength: Math.round(averageMessageLength),
        messagesPerDay
      };
    } catch (error) {
      console.error('获取故事统计数据失败:', error);
      return {
        totalMessages: 0,
        userMessages: 0,
        aiMessages: 0,
        averageMessageLength: 0,
        messagesPerDay: {}
      };
    }
  }

  // 获取角色统计数据
  getCharacterStats() {
    try {
      const world = storage.getWorldById(this.worldId);
      if (!world || !world.characters) {
        return {
          totalCharacters: 0,
          charactersByType: {},
          averageCharacterAttributes: {}
        };
      }

      const charactersByType = {};
      let totalAttributes = 0;
      let attributeCount = 0;

      world.characters.forEach(characterId => {
        const character = storage.getCharacterById(characterId);
        if (character) {
          // 按类型统计（使用标签作为类型）
          const type = character.profile && character.profile.tags && character.profile.tags.length > 0 ? character.profile.tags[0] : '未知';
          charactersByType[type] = (charactersByType[type] || 0) + 1;

          // 统计属性数量
          if (character.stats) {
            character.stats.forEach(stat => {
              if (typeof stat.value === 'number') {
                totalAttributes += stat.value;
                attributeCount++;
              }
            });
          }
        }
      });

      const averageAttributes = attributeCount > 0 ? totalAttributes / attributeCount : 0;

      return {
        totalCharacters: world.characters.length,
        charactersByType,
        averageCharacterAttributes: {
          averageValue: Math.round(averageAttributes * 10) / 10
        }
      };
    } catch (error) {
      console.error('获取角色统计数据失败:', error);
      return {
        totalCharacters: 0,
        charactersByType: {},
        averageCharacterAttributes: {}
      };
    }
  }

  // 获取API调用统计数据
  getApiStats() {
    try {
      // 由于storage对象中可能没有getApiStats方法，返回默认值
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        callsByService: {},
        callsByDay: {}
      };
    } catch (error) {
      console.error('获取API统计数据失败:', error);
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        callsByService: {},
        callsByDay: {}
      };
    }
  }

  // 获取时间统计数据
  getTimeStats() {
    try {
      const world = storage.getWorldById(this.worldId);
      if (!world || !world.settings || !world.settings.time) {
        return {
          currentTime: new Date().toISOString(),
          timeSpeed: 1,
          timeUnit: 'minute'
        };
      }

      return {
        currentTime: world.settings.time || new Date().toISOString(),
        timeSpeed: 1,
        timeUnit: 'minute'
      };
    } catch (error) {
      console.error('获取时间统计数据失败:', error);
      return {
        currentTime: new Date().toISOString(),
        timeSpeed: 1,
        timeUnit: 'minute'
      };
    }
  }

  // 生成综合统计报告
  generateReport() {
    try {
      return {
        world: this.getWorldStats(),
        story: this.getStoryStats(),
        character: this.getCharacterStats(),
        api: this.getApiStats(),
        time: this.getTimeStats(),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('生成统计报告失败:', error);
      return null;
    }
  }

  // 导出统计数据
  exportStats() {
    try {
      const report = this.generateReport();
      if (!report) {
        return null;
      }

      const dataStr = JSON.stringify(report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${this.worldId}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('导出统计数据失败:', error);
      return false;
    }
  }
}

class AnalyticsUI {
  constructor(analyticsManager) {
    this.analyticsManager = analyticsManager;
    this.init();
  }

  init() {
    this.loadStats();
    this.setupEventListeners();
  }

  loadStats() {
    const report = this.analyticsManager.generateReport();
    if (!report) {
      this.showError('加载统计数据失败');
      return;
    }

    this.renderWorldStats(report.world);
    this.renderStoryStats(report.story);
    this.renderCharacterStats(report.character);
    this.renderApiStats(report.api);
    this.renderTimeStats(report.time);
  }

  renderWorldStats(worldStats) {
    const container = document.getElementById('worldStats');
    if (!container) return;

    container.innerHTML = `
      <h3>世界信息</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">世界名称:</span>
          <span class="stat-value">${worldStats.worldName}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">创建时间:</span>
          <span class="stat-value">${new Date(worldStats.createdAt).toLocaleString('zh-CN')}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最后修改:</span>
          <span class="stat-value">${new Date(worldStats.lastModified).toLocaleString('zh-CN')}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">角色数量:</span>
          <span class="stat-value">${worldStats.characterCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">故事数量:</span>
          <span class="stat-value">${worldStats.storyCount}</span>
        </div>
      </div>
    `;
  }

  renderStoryStats(storyStats) {
    const container = document.getElementById('storyStats');
    if (!container) return;

    container.innerHTML = `
      <h3>故事统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总消息数:</span>
          <span class="stat-value">${storyStats.totalMessages}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">用户消息:</span>
          <span class="stat-value">${storyStats.userMessages}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">AI消息:</span>
          <span class="stat-value">${storyStats.aiMessages}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均消息长度:</span>
          <span class="stat-value">${storyStats.averageMessageLength} 字符</span>
        </div>
      </div>
      <div class="stats-chart" id="messageChart"></div>
    `;

    this.renderMessageChart(storyStats.messagesPerDay);
  }

  renderCharacterStats(characterStats) {
    const container = document.getElementById('characterStats');
    if (!container) return;

    container.innerHTML = `
      <h3>角色统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总角色数:</span>
          <span class="stat-value">${characterStats.totalCharacters}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均属性值:</span>
          <span class="stat-value">${characterStats.averageCharacterAttributes.averageValue}</span>
        </div>
      </div>
      <div class="stats-chart" id="characterChart"></div>
    `;

    this.renderCharacterChart(characterStats.charactersByType);
  }

  renderApiStats(apiStats) {
    const container = document.getElementById('apiStats');
    if (!container) return;

    const successRate = apiStats.totalCalls > 0 ? 
      Math.round((apiStats.successfulCalls / apiStats.totalCalls) * 100) : 0;

    container.innerHTML = `
      <h3>API调用统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总调用次数:</span>
          <span class="stat-value">${apiStats.totalCalls}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功次数:</span>
          <span class="stat-value">${apiStats.successfulCalls}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">失败次数:</span>
          <span class="stat-value">${apiStats.failedCalls}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功率:</span>
          <span class="stat-value">${successRate}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均响应时间:</span>
          <span class="stat-value">${apiStats.averageResponseTime}ms</span>
        </div>
      </div>
      <div class="stats-chart" id="apiChart"></div>
    `;

    this.renderApiChart(apiStats.callsByService);
  }

  renderTimeStats(timeStats) {
    const container = document.getElementById('timeStats');
    if (!container) return;

    container.innerHTML = `
      <h3>时间统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">当前时间:</span>
          <span class="stat-value">${new Date(timeStats.currentTime).toLocaleString('zh-CN')}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">时间速度:</span>
          <span class="stat-value">${timeStats.timeSpeed}x</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">时间单位:</span>
          <span class="stat-value">${this.getTimeUnitText(timeStats.timeUnit)}</span>
        </div>
      </div>
    `;
  }

  getTimeUnitText(unit) {
    const units = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天'
    };
    return units[unit] || unit;
  }

  renderMessageChart(messagesPerDay) {
    const container = document.getElementById('messageChart');
    if (!container) return;

    const days = Object.keys(messagesPerDay).sort();
    const values = days.map(day => messagesPerDay[day]);

    if (days.length === 0) {
      container.innerHTML = '<p>暂无消息数据</p>';
      return;
    }

    container.innerHTML = `
      <h4>每日消息数量</h4>
      <div class="chart-container">
        <canvas id="messageCanvas" width="400" height="200"></canvas>
      </div>
    `;

    // 这里可以使用Chart.js等库来渲染图表
    // 简化版实现
    this.renderSimpleBarChart('messageCanvas', days, values);
  }

  renderCharacterChart(charactersByType) {
    const container = document.getElementById('characterChart');
    if (!container) return;

    const types = Object.keys(charactersByType);
    const values = types.map(type => charactersByType[type]);

    if (types.length === 0) {
      container.innerHTML = '<p>暂无角色数据</p>';
      return;
    }

    container.innerHTML = `
      <h4>角色类型分布</h4>
      <div class="chart-container">
        <canvas id="characterCanvas" width="400" height="200"></canvas>
      </div>
    `;

    this.renderSimpleBarChart('characterCanvas', types, values);
  }

  renderApiChart(callsByService) {
    const container = document.getElementById('apiChart');
    if (!container) return;

    const services = Object.keys(callsByService);
    const values = services.map(service => callsByService[service]);

    if (services.length === 0) {
      container.innerHTML = '<p>暂无API调用数据</p>';
      return;
    }

    container.innerHTML = `
      <h4>API服务调用分布</h4>
      <div class="chart-container">
        <canvas id="apiCanvas" width="400" height="200"></canvas>
      </div>
    `;

    this.renderSimpleBarChart('apiCanvas', services, values);
  }

  renderSimpleBarChart(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 计算数据
    const maxValue = Math.max(...values, 1);
    const barWidth = (width - 40) / labels.length;
    const padding = 20;

    // 绘制坐标轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // 绘制条形图
    labels.forEach((label, index) => {
      const value = values[index];
      const barHeight = (value / maxValue) * (height - 2 * padding);
      const x = padding + index * barWidth + 5;
      const y = height - padding - barHeight;

      // 绘制条形
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // 绘制标签
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + (barWidth - 10) / 2, height - padding + 15);

      // 绘制数值
      ctx.fillText(value, x + (barWidth - 10) / 2, y - 5);
    });
  }

  setupEventListeners() {
    const exportButton = document.getElementById('exportStats');
    if (exportButton) {
      exportButton.addEventListener('click', () => {
        const success = this.analyticsManager.exportStats();
        if (success) {
          this.showSuccess('统计数据导出成功');
        } else {
          this.showError('统计数据导出失败');
        }
      });
    }

    const refreshButton = document.getElementById('refreshStats');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.loadStats();
        this.showSuccess('统计数据已刷新');
      });
    }

    const backButton = document.getElementById('backToChat');
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.location.href = `../../features/chat/index.html?worldId=${this.analyticsManager.worldId}`;
      });
    }
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.backgroundColor = '#ff4444';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 首先尝试从URL参数获取worldId，然后从localStorage获取currentWorldId
    let worldId = new URLSearchParams(window.location.search).get('worldId');
    if (!worldId) {
      worldId = localStorage.getItem('currentWorldId');
    }
    if (worldId) {
      const analyticsManager = new AnalyticsManager(worldId);
      new AnalyticsUI(analyticsManager);
    } else {
      // 如果没有worldId，跳转到主页面
      window.location.href = '../../main/index.html';
    }
  });
} else {
  // 首先尝试从URL参数获取worldId，然后从localStorage获取currentWorldId
  let worldId = new URLSearchParams(window.location.search).get('worldId');
  if (!worldId) {
    worldId = localStorage.getItem('currentWorldId');
  }
  if (worldId) {
    const analyticsManager = new AnalyticsManager(worldId);
    new AnalyticsUI(analyticsManager);
  } else {
    // 如果没有worldId，跳转到主页面
    window.location.href = '../../main/index.html';
  }
}