/* ===================================
   极简商务风自定义交互 — 美化版
   =================================== */

(function () {
  "use strict";

  /* ===================================
     1. 导航栏滚动效果 + 活跃态
     =================================== */
  function initNavScroll() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 20) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 导航栏活跃态 */
  function initNavActive() {
    var path = window.location.pathname;
    var menuItems = document.querySelectorAll("#nav .menus_item .site-page");

    menuItems.forEach(function (item) {
      var href = item.getAttribute("href");
      if (!href) return;

      item.classList.remove("active");

      if (href === "/" && (path === "/" || path === "/index.html")) {
        item.classList.add("active");
      } else if (href !== "/" && path.startsWith(href)) {
        item.classList.add("active");
      }
    });
  }

  /* ===================================
     2. 打字机效果（首页副标题）
     =================================== */
  function initTypewriter() {
    var subtitle = document.getElementById("site-subtitle");
    if (!subtitle) return;

    var texts = [
      "全栈开发 & AI 辅助开发",
      "React / JavaFX / Canvas",
      "代码与视觉双向规整",
    ];

    var textIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 100;
    var deletingSpeed = 50;
    var pauseEnd = 2200;
    var pauseSwitch = 400;

    var cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";

    function type() {
      var currentText = texts[textIndex];

      if (!isDeleting) {
        charIndex++;
        subtitle.textContent = currentText.substring(0, charIndex);
        subtitle.appendChild(cursor);

        if (charIndex === currentText.length) {
          isDeleting = true;
          setTimeout(type, pauseEnd);
          return;
        }
        setTimeout(type, typingSpeed);
      } else {
        charIndex--;
        subtitle.textContent = currentText.substring(0, charIndex);
        subtitle.appendChild(cursor);

        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % texts.length;
          setTimeout(type, pauseSwitch);
          return;
        }
        setTimeout(type, deletingSpeed);
      }
    }

    subtitle.textContent = "";
    subtitle.appendChild(cursor);
    setTimeout(type, 600);
  }

  /* ===================================
     3. Hero 按钮注入
     =================================== */
  function injectHeroButtons() {
    var header = document.getElementById("page-header");
    if (!header) return;

    var siteTitle = document.getElementById("site-title");
    if (!siteTitle) return;

    var inner = header.querySelector(".site-info");
    if (!inner) return;

    if (inner.querySelector(".hero-buttons")) return;

    var btnContainer = document.createElement("div");
    btnContainer.className = "hero-buttons";

    var btnPrimary = document.createElement("a");
    btnPrimary.className = "btn-primary";
    btnPrimary.href = "/dev-blog/projects/";
    btnPrimary.innerHTML = '<i class="fas fa-briefcase"></i> 查看作品';

    var btnSecondary = document.createElement("a");
    btnSecondary.className = "btn-secondary";
    btnSecondary.href = "/dev-blog/about/";
    btnSecondary.innerHTML = '<i class="fas fa-user"></i> 了解更多';

    btnContainer.appendChild(btnPrimary);
    btnContainer.appendChild(btnSecondary);
    inner.appendChild(btnContainer);

    var scrollHint = document.createElement("div");
    scrollHint.className = "scroll-hint";
    scrollHint.innerHTML = "Scroll <span class='arrow'>&#8595;</span>";
    header.appendChild(scrollHint);
  }

  /* ===================================
     4. 元素淡入上浮（IntersectionObserver）
     =================================== */
  function initScrollAnimation() {
    var selectors = [
      "#recent-posts .recent-post-item",
      ".portfolio-card",
      ".timeline-item",
      ".skill-bar-item",
      ".stat-item",
      ".section-title",
      ".section-subtitle",
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.classList.add("fade-in-up");
      });
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var delay = entry.target.dataset.delay || 0;
              setTimeout(function () {
                entry.target.classList.add("visible");
              }, delay);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      var cardGroups = [
        ".portfolio-card",
        ".stat-item",
        ".timeline-item",
        ".skill-bar-item",
      ];

      cardGroups.forEach(function (group) {
        var items = document.querySelectorAll(group);
        items.forEach(function (item, index) {
          item.dataset.delay = index * 80;
          observer.observe(item);
        });
      });

      document
        .querySelectorAll(
          ".fade-in-up:not(.portfolio-card):not(.stat-item):not(.timeline-item):not(.skill-bar-item)"
        )
        .forEach(function (el) {
          observer.observe(el);
        });
    } else {
      document.querySelectorAll(".fade-in-up").forEach(function (el) {
        el.classList.add("visible");
      });
    }
  }

  /* ===================================
     5. 技能条动画填充
     =================================== */
  function initSkillBars() {
    var skillBars = document.querySelectorAll(".skill-bar-fill");
    if (skillBars.length === 0) return;

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var target = entry.target.dataset.width || "0";
              entry.target.style.width = target + "%";
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      skillBars.forEach(function (bar) {
        observer.observe(bar);
      });
    } else {
      skillBars.forEach(function (bar) {
        var target = bar.dataset.width || "0";
        bar.style.width = target + "%";
      });
    }
  }

  /* ===================================
     6. 数字递增动画
     =================================== */
  function initCountUp() {
    var statNumbers = document.querySelectorAll(".stat-number[data-count]");
    if (statNumbers.length === 0) return;

    function animateCount(el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      statNumbers.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      statNumbers.forEach(function (el) {
        animateCount(el);
      });
    }
  }

  /* ===================================
     7. 页脚注入社交链接
     =================================== */
  function injectFooterSocial() {
    var footer = document.getElementById("footer");
    if (!footer) return;

    if (footer.querySelector(".footer-social")) return;

    var layout = footer.querySelector(".layout");
    if (!layout) return;

    var footerContent = document.createElement("div");
    footerContent.style.textAlign = "center";

    var title = document.createElement("div");
    title.className = "footer-title";
    title.textContent = "保持联系";

    var social = document.createElement("div");
    social.className = "footer-social";
    social.style.justifyContent = "center";

    var links = [
      { icon: "fas fa-envelope", url: "mailto:lizhengzhi99@outlook.com", label: "Email" },
      { icon: "fas fa-rss", url: "/dev-blog/atom.xml", label: "RSS" },
    ];

    links.forEach(function (link) {
      var a = document.createElement("a");
      a.href = link.url;
      a.setAttribute("aria-label", link.label);
      a.target = link.url.startsWith("/") ? "" : "_blank";
      a.rel = "noopener";
      a.innerHTML = '<i class="' + link.icon + '"></i>';
      social.appendChild(a);
    });

    var copyright = document.createElement("div");
    copyright.className = "footer-copyright";
    copyright.innerHTML =
      "&copy; 2026 李正直. All rights reserved.<br>使用 <a href='https://hexo.io' target='_blank' rel='noopener'>Hexo</a> & <a href='https://butterfly.js.org' target='_blank' rel='noopener'>Butterfly</a> 搭建";

    footerContent.appendChild(title);
    footerContent.appendChild(social);
    footerContent.appendChild(copyright);

    layout.innerHTML = "";
    layout.appendChild(footerContent);
  }

  /* ===================================
     8. 平滑滚动
     =================================== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#" || targetId === "#!") return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var offset = 80;
          var targetPosition =
            target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
      });
    });
  }

  /* ===================================
     9. 联系我按钮 — 复制邮箱
     =================================== */
  function initContactButton() {
    var btn = document.getElementById("card-info-btn");
    if (!btn) return;
    var email = "lizhengzhi99@outlook.com";

    btn.href = "javascript:void(0);";
    btn.removeAttribute("target");

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          showToast("邮箱已复制: " + email);
        }).catch(function () {
          fallbackCopy(email);
        });
      } else {
        fallbackCopy(email);
      }
    }, true);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("邮箱已复制: " + text);
  }

  function showToast(msg) {
    var existing = document.querySelector(".copy-toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "copy-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("show");
    });

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 300);
    }, 2200);
  }

  /* ===================================
     9. 移动端菜单优化
     =================================== */
  function initMobileMenu() {
    var style = document.createElement("style");
    style.textContent =
      "@media (max-width: 768px) {" +
      "#nav .menus_items {" +
      "position: fixed; top: 0; left: 0; width: 100%; height: 100vh;" +
      "background: rgba(255,255,255,0.98); backdrop-filter: blur(24px);" +
      "-webkit-backdrop-filter: blur(24px);" +
      "flex-direction: column; justify-content: center; align-items: center;" +
      "gap: 28px; z-index: 1001; transform: translateX(100%);" +
      "transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);" +
      "}" +
      "#nav .menus_items.mobile-open { transform: translateX(0); }" +
      "#nav .menus_items .site-page { font-size: 1.2rem !important; }" +
      "}";
    document.head.appendChild(style);
  }

  /* ===================================
     10. 项目详情弹窗
     =================================== */
  var projectData = [
    {
      title: "快递业务管理系统",
      icon: "fas fa-truck",
      bgClass: "bg-data-viz",
      role: "全栈开发 · JWT 认证",
      desc: "全栈快递物流业务管理平台，涵盖订单全生命周期管理。前端采用 React 18 搭配 TailwindCSS 构建响应式界面，后端基于 Express.js 提供 RESTful API，通过 MySQL 进行数据持久化。\n\n系统实现多角色权限控制（管理员/快递员/客户），集成 Chart.js 实现业务数据可视化统计报表（日报/周报/月报趋势分析），支持订单状态跟踪、物流轨迹展示、仓库库存出入库管理以及快递员绩效统计等核心功能。前后端通过 concurrently 实现一键协同开发，使用 nodemon 支持后端热重载。",
      tags: ["React 18", "TailwindCSS 3", "Express.js", "MySQL", "Chart.js", "JWT"],
      screenshots: [
        { label: "订单管理", url: "/dev-blog/img/projects/express-1.png" },
        { label: "数据看板", url: "/dev-blog/img/projects/express-2.png" },
        { label: "物流跟踪", url: "/dev-blog/img/projects/express-3.png" }
      ],
      links: []
    },
    {
      title: "本地代码生成工具",
      icon: "fas fa-code",
      bgClass: "bg-collab",
      role: "独立开发 · 插件化架构",
      desc: "基于 JavaFX 的跨语言桌面端代码生成器，采用 FreeMarker 模板引擎，支持从图形化数据模型一键生成 Java/Spring Boot、Python、Go 全栈工程代码。\n\n项目采用插件化架构设计（SPI 机制），内置三大插件体系：模型来源插件（支持 MySQL/PostgreSQL 数据库反向解析、Swagger/OpenAPI 导入、GraphQL Schema 导入）、模板仓库插件（本地文件夹/Git 仓库）、后处理器插件（代码静态分析、Java 格式整理）。\n\n集成 AI 助手（通过 Ollama 本地大模型支持自然语言建表和模板智能补全）。支持三种生成策略（覆盖/保护区域/智能合并），可直接输出完整 Spring Boot 项目骨架，全部处理在本地完成，零网络依赖。",
      tags: ["Java 17", "JavaFX 21", "FreeMarker", "Maven", "SPI", "SQLite", "Jackson", "RichTextFX"],
      screenshots: [
        { label: "模型编辑器", url: "/dev-blog/img/projects/codegen-1.png" },
        { label: "模板配置", url: "/dev-blog/img/projects/codegen-2.png" },
        { label: "AI 助手", url: "/dev-blog/img/projects/codegen-3.png" }
      ],
      links: []
    },
    {
      title: "塔防策略游戏 — Tafang",
      icon: "fas fa-shield-alt",
      bgClass: "bg-portfolio",
      role: "独立开发 · 游戏引擎",
      desc: "自研 Canvas 渲染引擎的塔防策略网页游戏，使用 TypeScript 开发，核心游戏循环与物理逻辑独立于 React 渲染层。\n\n设计 5 种特色防御塔（激光塔、脉冲塔、冰冻塔、雷暴塔、毁灭塔）和 8 种敌人类型（普通、快速、重甲、BOSS、虫群、护盾、飞行等），拥有完整的相克体系与特效系统。独创三路径系统（橙/绿/紫），每条路径赋予敌人不同的属性加成（速度/生命/护甲），动态解锁机制增加策略深度。\n\n实现了天赋树系统、附魔词条系统、星级升级系统、障碍物建造与增益点机制、波次全局增益等多重玩法系统，支持 localStorage 持久化游戏进度和最高分记录。",
      tags: ["TypeScript", "React 18", "Canvas 2D", "Zustand", "TailwindCSS", "Vite"],
      screenshots: [
        { label: "战斗场景", url: "/dev-blog/img/projects/tower-defense-1.png" },
        { label: "天赋树", url: "/dev-blog/img/projects/tower-defense-2.png" },
        { label: "防御塔升级", url: "/dev-blog/img/projects/tower-defense-3.png" }
      ],
      links: []
    },
    {
      title: "就医引导助手",
      icon: "fas fa-heartbeat",
      bgClass: "bg-component",
      role: "独立开发 · 适老化设计",
      desc: "面向 60 岁以上老年人的适老化医疗导诊 Web 应用，以语音交互驱动全流程就医引导，降低老年人数字就医门槛。\n\n国风适老化 UI：象牙白底色搭配宣纸纹理、石青色主按钮、思源宋体标题，对比度 ≥ 4.5:1 满足 WCAG 标准。双向语音交互：按住说话识别中文指令 + 自动慢速朗读回复，自研三层筛选算法解决跨浏览器中文语音降级问题。分级防抖机制：局部锁定 Hook 实现 5 级锁定时长（0.8s~4s）配合 Loading 动画与语音反馈，杜绝全局锁定带来的卡顿体验。\n\n紧急联系人功能使用 localStorage 持久化存储，智能判断有/无号码走不同引导流程。采用 vite-plugin-singlefile 打包为单 HTML 文件，支持 file:// 协议离线运行。",
      tags: ["React 18", "TypeScript", "Vite", "TailwindCSS", "Zustand", "Web Speech API"],
      screenshots: [
        { label: "语音导诊", url: "/dev-blog/img/projects/medical-guide-1.png" },
        { label: "科室推荐", url: "/dev-blog/img/projects/medical-guide-2.png" },
        { label: "紧急联系", url: "/dev-blog/img/projects/medical-guide-3.png" }
      ],
      links: []
    },
    {
      title: "杂货铺 AI 智能管理系统",
      icon: "fas fa-robot",
      bgClass: "bg-health",
      role: "独立设计 · AI 工作流",
      desc: "基于 WorkBuddy AI 平台搭建的社区杂货店智慧运营系统，通过 AI Agent 设计实现店铺数字化管理。\n\n系统设计三大 AI 角色：账房先生（自动记账、库存管理、利润核算、Excel 台账更新）、宣传干事（滞销品预警、天气联动备货建议、朋友圈营销文案生成）、知心大姐（熟客关系维护、赊账管理、定期召回、生日关怀）。\n\n通过精细化的 System Prompt 工程 + 结构化数据文件（TXT/Excel），实现自然语言交互驱动店铺全流程数字化运营，覆盖商品进销存、定价策略、抹零赊账规则、节假日营销等真实场景。",
      tags: ["AI Agent", "Excel 自动化", "自然语言交互", "Prompt 工程", "文件系统集成"],
      screenshots: [
        { label: "账房先生", url: "/dev-blog/img/projects/grocery-1.png" },
        { label: "宣传干事", url: "/dev-blog/img/projects/grocery-2.png" },
        { label: "知心大姐", url: "/dev-blog/img/projects/grocery-3.png" }
      ],
      links: []
    }
  ];

  var modalOverlay = null;

  function initProjectModal() {
    document.querySelectorAll(".portfolio-card").forEach(function (card, index) {
      card.style.cursor = "pointer";
      card.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openProjectModal(index);
      });
    });
  }

  function openProjectModal(index) {
    var data = projectData[index];
    if (!data) return;

    if (!modalOverlay) {
      modalOverlay = document.createElement("div");
      modalOverlay.className = "project-modal-overlay";
      modalOverlay.addEventListener("click", function (e) {
        if (e.target === modalOverlay) closeProjectModal();
      });
      document.body.appendChild(modalOverlay);
    }

    var galleryHTML = "";
    if (data.screenshots && data.screenshots.length > 0) {
      galleryHTML = '<div class="project-modal-gallery-title">项目截图</div>' +
        '<div class="project-modal-gallery">' +
        data.screenshots.map(function (shot, i) {
          if (shot.url) {
            return '<div class="screenshot-item screenshot-real" data-index="' + i + '" data-url="' + shot.url + '" data-label="' + shot.label + '">' +
              '<img src="' + shot.url + '" alt="' + shot.label + '" loading="lazy">' +
              '<span class="screenshot-label">' + shot.label + '</span>' +
              '</div>';
          }
          return '<div class="screenshot-item" style="background:' + shot.gradient + '">' +
            '<span class="screenshot-label">' + shot.label + '</span>' +
            '</div>';
        }).join("") +
        '</div>';
    }

    var linksHTML = "";
    if (data.links.length > 0) {
      linksHTML = '<div class="project-modal-actions">' +
        data.links.map(function (link) {
          return '<a class="btn-primary" href="' + link.url + '" target="_blank" rel="noopener">' +
            '<i class="' + link.icon + '"></i> ' + link.text + '</a>';
        }).join("") +
        '</div>';
    }

    modalOverlay.innerHTML =
      '<div class="project-modal">' +
      '<button class="project-modal-close" aria-label="关闭">&times;</button>' +
      '<div class="project-modal-cover">' +
      '<div class="card-cover-placeholder ' + data.bgClass + '"><i class="' + data.icon + '"></i></div>' +
      '</div>' +
      '<div class="project-modal-body">' +
      '<div class="project-modal-title">' + data.title + '</div>' +
      '<div class="project-modal-role">' + data.role + '</div>' +
      '<div class="project-modal-desc">' + data.desc.replace(/\n/g, "<br>") + '</div>' +
      '<div class="project-modal-tags">' +
      data.tags.map(function (tag) { return '<span class="project-modal-tag">' + tag + '</span>'; }).join("") +
      '</div>' +
      galleryHTML +
      linksHTML +
      '</div>' +
      '</div>';

    modalOverlay.querySelector(".project-modal-close").addEventListener("click", closeProjectModal);

    // 截图点击放大
    var currentScreenshots = (data.screenshots || []).filter(function (s) { return s.url; });
    modalOverlay.querySelectorAll(".screenshot-real").forEach(function (item) {
      item.style.cursor = "zoom-in";
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(item.getAttribute("data-index"), 10);
        openLightbox(currentScreenshots, idx);
      });
    });

    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      modalOverlay.classList.add("active");
    });

    document.addEventListener("keydown", handleModalEsc);
  }

  function closeProjectModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleModalEsc);
    setTimeout(function () {
      if (typeof Fancybox !== "undefined") {
        Fancybox.close();
      }
    }, 100);
  }

  function handleModalEsc(e) {
    if (e.key === "Escape") {
      if (document.querySelector(".screenshot-lightbox.active")) {
        closeLightbox();
      } else {
        closeProjectModal();
      }
    }
  }

  /* ===================================
     11. 截图灯箱（放大 + 左右切换）
     =================================== */
  var lightboxEl = null;
  var lightboxImages = [];
  var lightboxIndex = 0;

  function openLightbox(images, startIndex) {
    lightboxImages = images;
    lightboxIndex = startIndex || 0;

    if (!lightboxEl) {
      lightboxEl = document.createElement("div");
      lightboxEl.className = "screenshot-lightbox";
      lightboxEl.innerHTML =
        '<button class="lightbox-close" aria-label="关闭">&times;</button>' +
        '<button class="lightbox-arrow lightbox-prev" aria-label="上一张">&lt;</button>' +
        '<button class="lightbox-arrow lightbox-next" aria-label="下一张">&gt;</button>' +
        '<div class="lightbox-body">' +
        '<img class="lightbox-img" src="" alt="">' +
        '<div class="lightbox-info"><span class="lightbox-label"></span><span class="lightbox-counter"></span></div>' +
        '</div>';
      document.body.appendChild(lightboxEl);

      lightboxEl.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
      lightboxEl.querySelector(".lightbox-prev").addEventListener("click", function (e) {
        e.stopPropagation();
        lightboxNavigate(-1);
      });
      lightboxEl.querySelector(".lightbox-next").addEventListener("click", function (e) {
        e.stopPropagation();
        lightboxNavigate(1);
      });
      lightboxEl.addEventListener("click", function (e) {
        if (e.target === lightboxEl || e.target.classList.contains("lightbox-body")) {
          closeLightbox();
        }
      });
    }

    updateLightboxContent();
    lightboxEl.classList.add("active");
  }

  function updateLightboxContent() {
    var shot = lightboxImages[lightboxIndex];
    lightboxEl.querySelector(".lightbox-img").src = shot.url;
    lightboxEl.querySelector(".lightbox-img").alt = shot.label;
    lightboxEl.querySelector(".lightbox-label").textContent = shot.label;
    lightboxEl.querySelector(".lightbox-counter").textContent = (lightboxIndex + 1) + " / " + lightboxImages.length;

    var prevBtn = lightboxEl.querySelector(".lightbox-prev");
    var nextBtn = lightboxEl.querySelector(".lightbox-next");
    prevBtn.style.display = lightboxImages.length <= 1 ? "none" : "";
    nextBtn.style.display = lightboxImages.length <= 1 ? "none" : "";
    prevBtn.style.opacity = lightboxIndex === 0 ? "0.3" : "1";
    nextBtn.style.opacity = lightboxIndex === lightboxImages.length - 1 ? "0.3" : "1";
  }

  function lightboxNavigate(dir) {
    var next = lightboxIndex + dir;
    if (next < 0 || next >= lightboxImages.length) return;
    lightboxIndex = next;
    updateLightboxContent();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove("active");
  }

  // 键盘左右切换灯箱
  document.addEventListener("keydown", function (e) {
    if (!lightboxEl || !lightboxEl.classList.contains("active")) return;
    if (e.key === "ArrowLeft") lightboxNavigate(-1);
    if (e.key === "ArrowRight") lightboxNavigate(1);
  });

  /* ===================================
     初始化
     =================================== */
  function init() {
    initNavScroll();
    initNavActive();
    initTypewriter();
    injectHeroButtons();
    initSmoothScroll();
    initMobileMenu();
    initContactButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    initScrollAnimation();
    initSkillBars();
    initCountUp();
    injectFooterSocial();
    initProjectModal();
  });

  document.addEventListener("pjax:success", function () {
    init();
    initNavActive();
    initScrollAnimation();
    initSkillBars();
    initCountUp();
    injectFooterSocial();
    initProjectModal();
  });
})();
