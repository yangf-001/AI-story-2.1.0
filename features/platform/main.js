class PlatformManager {
  constructor() {
    this.platformInfo = {};
    this.init();
  }

  init() {
    this.detectPlatform();
    this.setupEventListeners();
    this.applyPlatformSpecificStyles();
  }

  detectPlatform() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    this.platformInfo = {
      // 设备类型检测
      isMobile: this.isMobileDevice(userAgent),
      isTablet: this.isTabletDevice(userAgent, screenWidth),
      isDesktop: !this.isMobileDevice(userAgent) && !this.isTabletDevice(userAgent, screenWidth),
      
      // 操作系统检测
      isWindows: platform.toLowerCase().includes('win'),
      isMac: platform.toLowerCase().includes('mac'),
      isLinux: platform.toLowerCase().includes('linux'),
      isiOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
      isAndroid: userAgent.toLowerCase().includes('android'),
      
      // 浏览器检测
      isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
      isFirefox: userAgent.toLowerCase().includes('firefox'),
      isSafari: /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor),
      isEdge: /Edge/.test(userAgent),
      isIE: /Trident/.test(userAgent),
      
      // 屏幕信息
      screenWidth,
      screenHeight,
      screenRatio: screenWidth / screenHeight,
      
      // 触摸支持
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      
      // PWA支持
      isPWA: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone,
      
      // 网络状态
      isOnline: navigator.onLine,
      connectionType: this.getConnectionType()
    };

    console.log('平台信息:', this.platformInfo);
  }

  isMobileDevice(userAgent) {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }

  isTabletDevice(userAgent, screenWidth) {
    const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isTabletSize = screenWidth >= 768 && screenWidth < 1024;
    return isTabletUA || isTabletSize;
  }

  getConnectionType() {
    if (navigator.connection) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  getPlatformInfo() {
    return this.platformInfo;
  }

  isMobile() {
    return this.platformInfo.isMobile;
  }

  isTablet() {
    return this.platformInfo.isTablet;
  }

  isDesktop() {
    return this.platformInfo.isDesktop;
  }

  hasTouchSupport() {
    return this.platformInfo.hasTouch;
  }

  isPWA() {
    return this.platformInfo.isPWA;
  }

  getScreenSize() {
    return {
      width: this.platformInfo.screenWidth,
      height: this.platformInfo.screenHeight,
      ratio: this.platformInfo.screenRatio
    };
  }

  applyPlatformSpecificStyles() {
    // 添加平台类到body
    const body = document.body;
    
    // 清除现有平台类
    body.classList.remove('platform-mobile', 'platform-tablet', 'platform-desktop');
    body.classList.remove('os-windows', 'os-mac', 'os-linux', 'os-ios', 'os-android');
    body.classList.remove('has-touch', 'no-touch');
    body.classList.remove('pwa-mode', 'browser-mode');

    // 添加设备类型类
    if (this.platformInfo.isMobile) {
      body.classList.add('platform-mobile');
    } else if (this.platformInfo.isTablet) {
      body.classList.add('platform-tablet');
    } else {
      body.classList.add('platform-desktop');
    }

    // 添加操作系统类
    if (this.platformInfo.isWindows) body.classList.add('os-windows');
    if (this.platformInfo.isMac) body.classList.add('os-mac');
    if (this.platformInfo.isLinux) body.classList.add('os-linux');
    if (this.platformInfo.isiOS) body.classList.add('os-ios');
    if (this.platformInfo.isAndroid) body.classList.add('os-android');

    // 添加触摸支持类
    if (this.platformInfo.hasTouch) {
      body.classList.add('has-touch');
    } else {
      body.classList.add('no-touch');
    }

    // 添加PWA模式类
    if (this.platformInfo.isPWA) {
      body.classList.add('pwa-mode');
    } else {
      body.classList.add('browser-mode');
    }

    // 应用响应式字体大小
    this.applyResponsiveFontSize();
  }

  applyResponsiveFontSize() {
    const baseFontSize = this.platformInfo.isMobile ? '14px' : '16px';
    document.documentElement.style.fontSize = baseFontSize;
  }

  setupEventListeners() {
    // 窗口大小变化事件
    window.addEventListener('resize', () => {
      this.detectPlatform();
      this.applyPlatformSpecificStyles();
    });

    // 网络状态变化事件
    window.addEventListener('online', () => {
      this.platformInfo.isOnline = true;
      this.notifyNetworkChange();
    });

    window.addEventListener('offline', () => {
      this.platformInfo.isOnline = false;
      this.notifyNetworkChange();
    });

    // 触摸事件优化
    if (this.platformInfo.hasTouch) {
      this.setupTouchEvents();
    }

    // PWA安装事件
    this.setupPWAEvents();
  }

  setupTouchEvents() {
    // 防止触摸时的默认行为
    document.addEventListener('touchstart', (e) => {
      // 可以在这里添加触摸事件的自定义处理
    }, { passive: true });

    // 触摸移动事件
    document.addEventListener('touchmove', (e) => {
      // 可以在这里添加触摸移动的自定义处理
    }, { passive: true });

    // 触摸结束事件
    document.addEventListener('touchend', (e) => {
      // 可以在这里添加触摸结束的自定义处理
    });
  }

  setupPWAEvents() {
    // PWA安装提示事件
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      // 阻止Chrome 67及更早版本自动显示安装提示
      e.preventDefault();
      // 保存事件以便稍后触发
      deferredPrompt = e;
      // 通知应用可以安装
      this.notifyPWAInstallable(deferredPrompt);
    });

    // PWA安装完成事件
    window.addEventListener('appinstalled', () => {
      // 清除保存的事件
      deferredPrompt = null;
      // 通知应用已安装
      this.notifyPWAInstalled();
    });
  }

  notifyNetworkChange() {
    const event = new CustomEvent('networkChange', {
      detail: {
        isOnline: this.platformInfo.isOnline,
        connectionType: this.getConnectionType()
      }
    });
    document.dispatchEvent(event);
  }

  notifyPWAInstallable(deferredPrompt) {
    const event = new CustomEvent('pwaInstallable', {
      detail: { deferredPrompt }
    });
    document.dispatchEvent(event);
  }

  notifyPWAInstalled() {
    const event = new CustomEvent('pwaInstalled');
    document.dispatchEvent(event);
  }

  // 安装PWA
  installPWA(deferredPrompt) {
    if (!deferredPrompt) {
      return false;
    }

    // 显示安装提示
    deferredPrompt.prompt();

    // 等待用户响应
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('用户接受了PWA安装');
      } else {
        console.log('用户拒绝了PWA安装');
      }
      // 清除保存的事件
      deferredPrompt = null;
    });

    return true;
  }

  // 获取性能优化建议
  getPerformanceSuggestions() {
    const suggestions = [];

    // 根据网络状态建议
    if (this.platformInfo.connectionType === 'slow-2g' || this.platformInfo.connectionType === '2g') {
      suggestions.push('使用低分辨率资源');
      suggestions.push('减少动画效果');
      suggestions.push('延迟加载非关键资源');
    }

    // 根据设备类型建议
    if (this.platformInfo.isMobile) {
      suggestions.push('简化UI布局');
      suggestions.push('减少同时运行的动画');
      suggestions.push('优化触摸目标大小');
    }

    // 根据内存情况建议
    if (navigator.deviceMemory && navigator.deviceMemory < 2) {
      suggestions.push('减少内存使用');
      suggestions.push('清理未使用的对象');
    }

    return suggestions;
  }

  // 应用性能优化
  applyPerformanceOptimizations() {
    const suggestions = this.getPerformanceSuggestions();
    
    // 根据建议应用优化
    suggestions.forEach(suggestion => {
      console.log('应用性能优化:', suggestion);
      // 这里可以添加具体的优化实现
    });

    // 通用性能优化
    this.optimizeImageLoading();
    this.optimizeFontLoading();
  }

  // 优化图片加载
  optimizeImageLoading() {
    if (this.platformInfo.isMobile || this.platformInfo.connectionType === 'slow-2g' || this.platformInfo.connectionType === '2g') {
      // 替换为低分辨率图片
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        const lowResSrc = img.dataset.src.replace('.png', '_low.png').replace('.jpg', '_low.jpg');
        img.src = lowResSrc;
      });
    }
  }

  // 优化字体加载
  optimizeFontLoading() {
    // 使用字体显示策略
    document.documentElement.style.fontDisplay = 'swap';
  }

  // 检查浏览器兼容性
  checkBrowserCompatibility() {
    const compatibility = {
      supported: true,
      issues: []
    };

    // 检查必要的API支持
    if (!window.localStorage) {
      compatibility.supported = false;
      compatibility.issues.push('浏览器不支持localStorage');
    }

    if (!window.Promise) {
      compatibility.supported = false;
      compatibility.issues.push('浏览器不支持Promise');
    }

    if (!window.fetch) {
      compatibility.supported = false;
      compatibility.issues.push('浏览器不支持fetch API');
    }

    return compatibility;
  }

  // 获取平台特定的配置
  getPlatformConfig() {
    const config = {
      // 默认配置
      ui: {
        menuPosition: 'left',
        touchTargetSize: 44,
        animationSpeed: 'normal'
      },
      performance: {
        imageQuality: 'high',
        enableAnimations: true,
        enableTransitions: true
      }
    };

    // 根据平台调整配置
    if (this.platformInfo.isMobile) {
      config.ui.menuPosition = 'bottom';
      config.ui.animationSpeed = 'fast';
      config.performance.imageQuality = 'medium';
      config.performance.enableAnimations = false;
    }

    if (this.platformInfo.isTablet) {
      config.ui.menuPosition = 'left';
      config.performance.imageQuality = 'medium';
    }

    if (!this.platformInfo.isOnline) {
      config.performance.imageQuality = 'low';
      config.performance.enableAnimations = false;
      config.performance.enableTransitions = false;
    }

    return config;
  }

  // 应用平台特定的配置
  applyPlatformConfig() {
    const config = this.getPlatformConfig();

    // 应用UI配置
    document.documentElement.style.setProperty('--touch-target-size', `${config.ui.touchTargetSize}px`);
    document.documentElement.style.setProperty('--animation-speed', config.ui.animationSpeed);

    // 应用性能配置
    if (!config.performance.enableAnimations) {
      document.documentElement.classList.add('no-animations');
    }

    if (!config.performance.enableTransitions) {
      document.documentElement.classList.add('no-transitions');
    }

    // 应用菜单位置
    if (config.ui.menuPosition === 'bottom') {
      document.documentElement.classList.add('menu-bottom');
    } else {
      document.documentElement.classList.remove('menu-bottom');
    }
  }
}

class PlatformUI {
  constructor(platformManager) {
    this.platformManager = platformManager;
    this.init();
  }

  init() {
    this.renderPlatformInfo();
    this.setupEventListeners();
    this.renderPerformanceSuggestions();
    this.renderPWAStatus();
  }

  renderPlatformInfo() {
    const container = document.getElementById('platformInfo');
    if (!container) return;

    const info = this.platformManager.getPlatformInfo();

    container.innerHTML = `
      <h3>平台信息</h3>
      <div class="platform-grid">
        <div class="platform-item">
          <span class="platform-label">设备类型:</span>
          <span class="platform-value">${info.isMobile ? '移动设备' : info.isTablet ? '平板设备' : '桌面设备'}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">操作系统:</span>
          <span class="platform-value">${this.getOSName(info)}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">屏幕尺寸:</span>
          <span class="platform-value">${info.screenWidth}x${info.screenHeight}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">触摸支持:</span>
          <span class="platform-value">${info.hasTouch ? '是' : '否'}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">PWA模式:</span>
          <span class="platform-value">${info.isPWA ? '是' : '否'}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">网络状态:</span>
          <span class="platform-value">${info.isOnline ? '在线' : '离线'}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">连接类型:</span>
          <span class="platform-value">${info.connectionType}</span>
        </div>
        <div class="platform-item">
          <span class="platform-label">浏览器:</span>
          <span class="platform-value">${this.getBrowserName(info)}</span>
        </div>
      </div>
    `;
  }

  getOSName(info) {
    if (info.isWindows) return 'Windows';
    if (info.isMac) return 'macOS';
    if (info.isLinux) return 'Linux';
    if (info.isiOS) return 'iOS';
    if (info.isAndroid) return 'Android';
    return '未知';
  }

  getBrowserName(info) {
    if (info.isChrome) return 'Chrome';
    if (info.isFirefox) return 'Firefox';
    if (info.isSafari) return 'Safari';
    if (info.isEdge) return 'Edge';
    if (info.isIE) return 'Internet Explorer';
    return '未知';
  }

  renderPerformanceSuggestions() {
    const container = document.getElementById('performanceSuggestions');
    if (!container) return;

    const suggestions = this.platformManager.getPerformanceSuggestions();

    if (suggestions.length === 0) {
      container.innerHTML = `
        <h3>性能优化建议</h3>
        <p>当前平台无需特殊优化</p>
      `;
      return;
    }

    container.innerHTML = `
      <h3>性能优化建议</h3>
      <ul class="suggestions-list">
        ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
      </ul>
    `;
  }

  renderPWAStatus() {
    const container = document.getElementById('pwaStatus');
    if (!container) return;

    const isPWA = this.platformManager.isPWA();

    container.innerHTML = `
      <h3>PWA状态</h3>
      <div class="pwa-status">
        <div class="status-item">
          <span class="status-label">当前模式:</span>
          <span class="status-value">${isPWA ? 'PWA模式' : '浏览器模式'}</span>
        </div>
        <div class="status-item" id="installPWAButtonContainer">
          ${!isPWA ? '<button id="installPWA" class="btn btn-primary">安装为PWA应用</button>' : ''}
        </div>
      </div>
    `;

    // 设置PWA安装按钮事件
    if (!isPWA) {
      const installButton = document.getElementById('installPWA');
      if (installButton) {
        installButton.addEventListener('click', () => {
          // 这里需要与PWA安装事件配合
          this.showPWAInstallInstructions();
        });
      }
    }
  }

  showPWAInstallInstructions() {
    const container = document.getElementById('pwaStatus');
    if (!container) return;

    container.innerHTML += `
      <div class="pwa-install-instructions">
        <h4>如何安装PWA应用</h4>
        <ul>
          <li><strong>Chrome浏览器:</strong> 点击地址栏右侧的 "安装" 按钮</li>
          <li><strong>Safari浏览器:</strong> 点击分享按钮，选择 "添加到主屏幕"</li>
          <li><strong>Edge浏览器:</strong> 点击地址栏右侧的 "安装" 按钮</li>
        </ul>
      </div>
    `;
  }

  setupEventListeners() {
    // 刷新平台信息按钮
    const refreshButton = document.getElementById('refreshPlatformInfo');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.platformManager.detectPlatform();
        this.platformManager.applyPlatformSpecificStyles();
        this.platformManager.applyPlatformConfig();
        this.renderPlatformInfo();
        this.renderPerformanceSuggestions();
        this.renderPWAStatus();
        this.showSuccess('平台信息已更新');
      });
    }

    // 应用性能优化按钮
    const optimizeButton = document.getElementById('applyOptimizations');
    if (optimizeButton) {
      optimizeButton.addEventListener('click', () => {
        this.platformManager.applyPerformanceOptimizations();
        this.showSuccess('性能优化已应用');
      });
    }

    // 检查兼容性按钮
    const compatibilityButton = document.getElementById('checkCompatibility');
    if (compatibilityButton) {
      compatibilityButton.addEventListener('click', () => {
        const compatibility = this.platformManager.checkBrowserCompatibility();
        this.showCompatibilityResult(compatibility);
      });
    }

    // 返回按钮
    const backButton = document.getElementById('backToChat');
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.location.href = `../../features/chat/index.html`;
      });
    }

    // 网络状态变化通知
    document.addEventListener('networkChange', (e) => {
      const isOnline = e.detail.isOnline;
      this.showInfo(isOnline ? '网络已连接' : '网络连接已断开');
      this.renderPlatformInfo();
    });

    // PWA安装通知
    document.addEventListener('pwaInstallable', () => {
      this.showInfo('应用可以安装为PWA');
    });

    document.addEventListener('pwaInstalled', () => {
      this.showSuccess('应用已成功安装为PWA');
      this.renderPWAStatus();
    });
  }

  showCompatibilityResult(compatibility) {
    const container = document.getElementById('compatibilityResult');
    if (!container) return;

    if (compatibility.supported) {
      container.innerHTML = `
        <div class="compatibility-result supported">
          <h4>浏览器兼容性检查</h4>
          <p>您的浏览器完全支持本应用</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="compatibility-result unsupported">
          <h4>浏览器兼容性检查</h4>
          <p>您的浏览器存在以下兼容性问题:</p>
          <ul>
            ${compatibility.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
          <p>建议使用最新版的Chrome、Firefox或Edge浏览器</p>
        </div>
      `;
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showInfo(message) {
    this.showNotification(message, 'info');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.color = 'white';

    // 设置不同类型的颜色
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#4CAF50';
        break;
      case 'error':
        notification.style.backgroundColor = '#ff4444';
        break;
      case 'info':
        notification.style.backgroundColor = '#2196F3';
        break;
    }

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const platformManager = new PlatformManager();
    platformManager.applyPlatformConfig();
    platformManager.applyPerformanceOptimizations();
    
    // 初始化UI（如果在平台管理页面）
    if (document.getElementById('platformInfo')) {
      new PlatformUI(platformManager);
    }
  });
} else {
  const platformManager = new PlatformManager();
  platformManager.applyPlatformConfig();
  platformManager.applyPerformanceOptimizations();
  
  // 初始化UI（如果在平台管理页面）
  if (document.getElementById('platformInfo')) {
    new PlatformUI(platformManager);
  }
}

// 导出PlatformManager类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlatformManager;
} else if (typeof window !== 'undefined') {
  window.PlatformManager = PlatformManager;
}