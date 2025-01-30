// ==UserScript==
// @name         自定义屏蔽某些网站
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  支持自定义屏蔽网站|支持自定义提示文本|自定义倒计时
// @author       Victor Qiao
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// ==/UserScript==

(function () {
  // 全局配置对象
  const CONFIG = {
    tipText: "我要年入百万", // 用户需要输入的文本
    tipTime: 1, // 允许访问的时间(分钟)
    blockedSites: [ // 需要屏蔽的网站
      "https://www.douyin.com/*", // 抖音
      "https://www.bilibili.com/*", // B站
      "https://www.zhihu.com/*",// 知乎
      "https://www.toutiao.com/*",// 今日头条
      "https://www.weibo.com/*", // 微博
      "https://weibo.com/*" // 微博


    ]
  };

  // 统一管理样式配置
  const STYLES = {
    // 模态框遮罩层样式
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999"
    },
    // 模态框内容区域样式
    modalContent: {
      background: "#dad7cd",
      padding: "85px",
      borderRadius: "10px",
      color: "#344e41",
      textAlign: "center"
    },
    // 按钮通用样式
    button: {
      margin: "10px",
      color: "#fff",
      border: "1px solid #dcdfe6",
      padding: "7px 14px",
      borderRadius: "5px"
    },
    // 倒计时浮动框样式
    timer: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "10px 20px",
      backgroundColor: "#f44336",
      color: "#fff",
      fontSize: "18px",
      borderRadius: "8px",
      boxShadow: "0px 0px 10px rgba(0,0,0,0.9)",
      zIndex: "9999",
      fontWeight: "bold"
    }
  };

  // 工具函数集合
  const utils = {
    // 应用样式到DOM元素
    applyStyles(element, styles) {
      Object.assign(element.style, styles);
    },

    // 创建DOM元素并应用样式和属性
    createElement(tag, styles = {}, properties = {}) {
      const element = document.createElement(tag);
      this.applyStyles(element, styles);
      Object.assign(element, properties);
      return element;
    },

    // 添加图标字体
    addIconFont() {
      const link = this.createElement('link', {}, {
        rel: "stylesheet",
        href: "https://at.alicdn.com/t/c/font_4819350_kao0kjf2kjk.css",
        type: "text/css"
      });
      document.head.appendChild(link);
    }
  };

  /**
   * 检查URL是否在屏蔽列表中
   * @param {string} url - 要检查的URL
   * @returns {boolean} - 是否被屏蔽
   */
  function isBlocked(url) {
    try {
      return CONFIG.blockedSites.some(pattern => {
        // 将通配符转换为正则表达式
        const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
        return regex.test(url);
      });
    } catch (error) {
      console.error('URL matching error:', error);
      return false;
    }
  }

  /**
   * 显示警告模态框
   */
  function showModal() {
    const modal = utils.createElement("div", STYLES.modal, { id: "custom-modal" });
    const modalContent = utils.createElement("div", STYLES.modalContent);

    // 添加警告图标
    utils.addIconFont();
    const icon = utils.createElement("i", {
      fontSize: "88px",
      color: "#d62828"
    }, {
      className: "iconfont icon-warnning"
    });

    // 添加警告文本
    const message = utils.createElement("p", {
      fontSize: "30px",
      fontWeight: "bold"
    }, {
      innerText: "为了您的健康\n请关闭此网站!"
    });

    // 创建操作按钮
    const buttons = {
      // 关闭网站按钮
      close: utils.createElement("button", {
        ...STYLES.button,
        backgroundColor: "#52c15b"
      }, {
        innerText: "确认关闭",
        onclick: () => window.close()
      }),

      // 继续访问按钮
      cancel: utils.createElement("button", {
        ...STYLES.button,
        backgroundColor: "#f45656"
      }, {
        innerText: "不关闭",
        onclick: () => {
          modal.remove();
          showInputBox();
        }
      })
    };

    // 组装模态框
    modalContent.append(icon, message, buttons.close, buttons.cancel);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }

  /**
   * 显示验证输入框
   */
  function showInputBox() {
    // 禁用页面复制功能
    document.body.oncopy = (e) => {
      e.preventDefault();
      alert('不可以复制哦！');
    };

    const inputModal = utils.createElement("div", STYLES.modal);
    const inputContent = utils.createElement("div", {
      ...STYLES.modalContent,
      padding: "50px 30px 20px"
    });

    // 创建输入框相关元素
    const elements = {
      title: utils.createElement("h3", {
        padding: "0px 0px 30px"
      }, {
        innerText: `请输入以下内容即可浏览该网站 ${CONFIG.tipTime} 分钟:`
      }),

      promptText: utils.createElement("p", {}, {
        innerText: CONFIG.tipText
      }),

      input: utils.createElement("input", {
        margin: "10px",
        width: "80%",
        padding: "6px",
        border: "2px solid #191919",
        backgroundColor: "transparent",
        borderRadius: "5px"
      }, {
        type: "text"
      }),

      submit: utils.createElement("button", {
        ...STYLES.button,
        backgroundColor: "#409eff",
        padding: "7px 30px"
      }, {
        innerText: "提交"
      })
    };

    // 处理提交验证
    elements.submit.onclick = () => {
      if (elements.input.value === CONFIG.tipText) {
        inputModal.remove();
        setTimeout(getTimer, 100);
      } else {
        alert("输入不正确，请重新输入！");
        elements.input.value = "";
      }
    };

    // 组装输入框
    inputContent.append(
      elements.title,
      elements.promptText,
      elements.input,
      elements.submit
    );
    inputModal.appendChild(inputContent);
    document.body.appendChild(inputModal);
  }

  /**
   * 创建并启动倒计时器
   */
  function getTimer() {
    // 创建倒计时显示框
    const floatingBox = utils.createElement("div", STYLES.timer, {
      id: "floating-timer",
      innerText: `${CONFIG.tipTime * 60}秒倒计时开始`
    });

    document.body.appendChild(floatingBox);

    // 开始倒计时
    let timeLeft = CONFIG.tipTime * 60;
    const timer = setInterval(() => {
      timeLeft--;
      floatingBox.innerText = `倒计时：${timeLeft}s`;

      // 倒计时结束时重新检查并屏蔽
      if (timeLeft <= 0) {
        clearInterval(timer);
        floatingBox.remove();
        checkAndBlockSite();
      }
    }, 1000);
  }

  /**
   * 检查当前网站是否需要屏蔽
   */
  function checkAndBlockSite() {
    if (isBlocked(window.location.href) && !document.getElementById("custom-modal")) {
      showModal();
    }
  }

  // 脚本初始化
  checkAndBlockSite();
})();