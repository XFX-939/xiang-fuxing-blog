import githubRepoSnapshot from "@/data/github-repos.generated.json";

export type Project = {
  name: string;
  description: string;
  direction: string;
  outcomes: string[];
  technologies: string[];
  status: string;
  updatedAt?: string;
  stars?: number;
  forks?: number;
  isFork?: boolean;
  githubDescription?: string;
  primaryLanguage?: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

const curatedProjects: Project[] = [
  {
    name: "openclaw-multi-agent-team",
    description:
      "一套经过真实运行验证的 OpenClaw 1 Chief + 10 Specialists 多智能体架构参考，覆盖职责路由、独立工作区、交接协议、最小权限与验收边界。",
    direction: "多智能体系统 / Agent 治理 / 安全边界",
    outcomes: [
      "将 main 设为唯一对外入口，统一承担理解、路由、脱敏与最终答复",
      "为专家角色拆分独立 workspace、记忆、工具和 MCP 边界",
      "提供脱敏配置、Handoff Schema、静态检查与可复现验收步骤"
    ],
    technologies: ["OpenClaw", "Multi-Agent", "JavaScript", "MCP", "Security"],
    status: "近期发布",
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/openclaw-multi-agent-team" }]
  },
  {
    name: "harmonyos-clashbox-guide",
    description:
      "Mate X7 / HarmonyOS 6 安装 ClashBox 的签名、验签、覆盖升级与数据保留实录，只发布教程、脱敏示例和本地校验脚本。",
    direction: "HarmonyOS / 安全发布 / 设备实录",
    outcomes: [
      "完成 unsigned HAP 的哈希校验、签名与逐文件一致性验证",
      "验证短期调试证书到一年期证书的非卸载覆盖升级",
      "明确证书、设备标识、签名包等不可公开的安全红线"
    ],
    technologies: ["HarmonyOS", "DevEco Studio", "HDC", "Shell", "Supply Chain"],
    status: "近期发布",
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/harmonyos-clashbox-guide" }]
  },
  {
    name: "kr-personal-proxy-runbook",
    description:
      "面向单用户场景的公开脱敏运行手册，记录 Ubuntu VPS 上 sing-box REALITY 的事务式部署，以及 HarmonyOS DNS、TUN 与分流故障复盘。",
    direction: "网络运维 / 故障复盘 / 可回滚部署",
    outcomes: [
      "形成先检查、再备份、后变更并可回滚的部署流程",
      "保留服务端最小配置、客户端分流骨架和 DNS/TUN 补丁",
      "以不可用占位符替代节点、订阅和设备数据，确保公开边界"
    ],
    technologies: ["sing-box", "REALITY", "Ubuntu", "Mihomo", "Runbook"],
    status: "近期发布",
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/kr-personal-proxy-runbook" }]
  },
  {
    name: "ai-learning-lab",
    description:
      "AI 学习实验室 MVP，把学习路线、在线实验、参数调节、结果可视化、实验记录和项目实战组织在同一套本地学习工作台中。",
    direction: "AI 教育 / 在线实验 / 学习工作台",
    outcomes: [
      "搭建从课程、实验到项目实战的完整学习路径",
      "支持 Pyodide 浏览器内训练与梯度下降可视化",
      "使用本地状态保存学习进度和实验记录"
    ],
    technologies: ["Next.js", "TypeScript", "Pyodide", "Zustand", "Recharts"],
    status: "公开原型",
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/ai-learning-lab" }]
  },
  {
    name: "PPTutor",
    description:
      "本地 PPTX 全文搜索、命中页预览与自动版本管理桌面应用，可按记得的文字定位文件和页码，并保留历史版本。",
    direction: "本地知识检索 / 桌面工具 / Fork 实践",
    outcomes: [
      "通过 FTS5 实现页级全文索引、繁简归一和子串召回",
      "调用本机 PowerPoint 渲染命中页并支持原始页序浏览",
      "自动监听文件变化并提供可恢复的版本管理"
    ],
    technologies: ["Python", "PySide6", "SQLite FTS5", "OpenCC", "PyInstaller"],
    status: "Fork 实践",
    isFork: true,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/PPTutor" }]
  },
  {
    name: "airview_everyday",
    description:
      "面向解决方案工作的 AI 信息助手，用时间轴、信息库、大屏、论文精读和多 AI 圆桌组织公开线索与工作材料。",
    direction: "信息雷达 / 方案工作 / Fork 实践",
    outcomes: [
      "聚合解决方案线索并按时间、类型和关键词筛选",
      "加入论文精读、大屏视图和原文封面补全",
      "通过浏览器伴侣把同一问题分发给多个已登录 AI 页面"
    ],
    technologies: ["JavaScript", "Information Radar", "Browser Extension", "LLM", "Timeline"],
    status: "Fork 实践",
    isFork: true,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/airview_everyday" }]
  },
  {
    name: "claude-session-hub",
    description:
      "将 Claude、Gemini、Codex 等多个 AI CLI 聚合到一个 Electron 工作台，并支持多成员群聊、独立工作区和场景化协作。",
    direction: "AI CLI 工作台 / Electron / Fork 实践",
    outcomes: [
      "统一管理多个 AI CLI 的单聊与群聊会话",
      "为群聊子会话提供隔离工作区，减少目录污染",
      "按通用、开发等场景提供轻量协作约束"
    ],
    technologies: ["Electron", "JavaScript", "AI CLI", "Local Workspace", "Multi-Agent"],
    status: "Fork 实践",
    isFork: true,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/claude-session-hub" }]
  },
  {
    name: "ai-arena-extension",
    description:
      "多 AI Chrome 扩展，可让多个已登录的主流 AI 页面围绕同一问题协作或辩论，并保存可检索的会话与结构化报告。",
    direction: "浏览器扩展 / 多 AI 协作 / Fork 实践",
    outcomes: [
      "在一个界面内组织多个 AI 的并行讨论",
      "支持角色模板、定向追问、会话检索与折叠模式",
      "将多轮讨论整理成结构化 HTML 报告"
    ],
    technologies: ["JavaScript", "Chrome Extension", "Multi-AI", "Prompt Workflow", "Local UI"],
    status: "Fork 实践",
    isFork: true,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/ai-arena-extension" }]
  },
  {
    name: "esports",
    description:
      "面向游戏护航工作室的响应式展示站，组织服务分类、下单规则、导师介绍、招募和官方客服引导，不接入支付或博彩化功能。",
    direction: "响应式官网 / 服务说明 / 前端实践",
    outcomes: [
      "用清晰的信息架构呈现服务原则、规则与风险提醒",
      "覆盖导师展示、招募表单和客服引导",
      "加入年龄限制与理性消费边界"
    ],
    technologies: ["React", "Vite", "JavaScript", "Responsive UI", "Node.js"],
    status: "公开项目",
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/esports" }]
  },
  {
    name: "flight",
    description:
      "浏览器端民航飞行模拟器，基于 Next.js、TypeScript、Tailwind CSS 和 React Three Fiber，支持 3D 起飞/降落任务、HUD 仪表、移动端控制、评分和本地飞行日志。",
    direction: "3D 交互 / 仿真体验 / 前端工程",
    outcomes: [
      "把飞行任务、仪表状态和操作反馈做成可玩的浏览器体验",
      "使用 React Three Fiber 承载 3D 场景与交互控制",
      "适配桌面和移动端，包含评分、日志和本地排行榜"
    ],
    technologies: ["TypeScript", "Next.js", "React Three Fiber", "Tailwind CSS", "3D Simulation"],
    status: "近期迭代",
    updatedAt: "2026-05-15",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/flight" }]
  },
  {
    name: "racing",
    description:
      "浏览器端 3D 街机赛车游戏，包含霓虹赛道、车辆选择、圈速计时、氮气、漂移、移动端控制和本地排行榜。",
    direction: "3D 游戏 / 交互设计 / 前端工程",
    outcomes: [
      "构建轻量 3D 赛车玩法和实时操作反馈",
      "覆盖车辆选择、计时、氮气和漂移等核心体验",
      "兼顾桌面键盘和移动端触控操作"
    ],
    technologies: ["TypeScript", "Next.js", "React Three Fiber", "Tailwind CSS", "Game UI"],
    status: "近期迭代",
    updatedAt: "2026-05-15",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/racing" }]
  },
  {
    name: "global-military-atlas",
    description:
      "全球军事能力对比可视化看板，包含国家画像、区域简报、排名对比和方法说明，用于练习复杂信息的结构化呈现。",
    direction: "可视化分析 / 情报看板 / Next.js",
    outcomes: [
      "将多维指标转成可扫描的国家与区域视图",
      "用排名、画像和说明降低复杂信息理解成本",
      "沉淀数据看板和方法论说明的页面组织方式"
    ],
    technologies: ["TypeScript", "Next.js", "Dashboard", "Data Visualization", "Tailwind CSS"],
    status: "公开仓库",
    updatedAt: "2026-05-14",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/global-military-atlas" }]
  },
  {
    name: "blogfactory",
    description:
      "个人博客文章生产工作台，基于 Next.js、Supabase 和 OpenAI-compatible LLM，把选题、资料和复盘批量生成高质量中文技术博客。",
    direction: "AI 辅助写作 / 内容生产 / LLM 工作流",
    outcomes: [
      "围绕选题、资料整理、文章生成和复盘形成内容生产链路",
      "探索 LLM 在中文技术博客沉淀中的稳定使用方式",
      "服务个人知识资产建设和长期内容输出"
    ],
    technologies: ["TypeScript", "Next.js", "Supabase", "LLM", "Content Workflow"],
    status: "近期迭代",
    updatedAt: "2026-05-14",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/blogfactory" }]
  },
  {
    name: "meeting-room-escape",
    description:
      "适合办公室碎片时间玩的 React 迷宫小游戏：从会议室逃到电梯口，躲避会议、Bug、需求变更和巡逻，支持固定关卡、排行榜、移动端操作和双主题。",
    direction: "React 游戏 / 交互设计 / 本地排行榜",
    outcomes: [
      "用轻量玩法把办公室场景做成可交互小游戏",
      "内置 10 个固定关卡和本地排行榜",
      "支持移动端操作、浅色模式和深色模式"
    ],
    technologies: ["TypeScript", "React", "Game Design", "Local Storage", "Dark Mode"],
    status: "公开仓库",
    updatedAt: "2026-05-14",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/meeting-room-escape" }]
  },
  {
    name: "vocabulary",
    description:
      "词汇量竞技场，一个基于 React、TypeScript 和 Vite 的轻量英语词汇量测试小游戏，支持雅思风格词汇评级、60 秒冲榜和本地排行榜。",
    direction: "英语学习 / 游戏化学习 / Vite",
    outcomes: [
      "把词汇测试做成短时、高反馈的小游戏体验",
      "支持分级评估、限时冲榜和本地成绩记录",
      "适合作为轻量学习工具和前端练习项目"
    ],
    technologies: ["TypeScript", "React", "Vite", "Learning Tool", "Local Leaderboard"],
    status: "公开仓库",
    updatedAt: "2026-05-14",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/vocabulary" }]
  },
  {
    name: "snake-game",
    description:
      "基于 React、TypeScript 和 Vite 的贪吃蛇小游戏，接入 Supabase 排行榜，用于练习前端状态管理、游戏循环和轻量后端数据持久化。",
    direction: "小游戏 / Supabase / 前端练习",
    outcomes: [
      "实现经典贪吃蛇玩法和分数反馈",
      "接入 Supabase 保存排行榜数据",
      "用于练习轻量游戏循环和状态管理"
    ],
    technologies: ["TypeScript", "React", "Vite", "Supabase", "Game Loop"],
    status: "公开仓库",
    updatedAt: "2026-05-14",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/snake-game" }]
  },
  {
    name: "felix-finboard",
    description:
      "个人 A 股市场看板，采用 Next.js、FastAPI、AKShare 和 SQLite 缓存，支持自选股、暗色模式和个人研究场景下的行情观察。",
    direction: "金融数据看板 / FastAPI / A股研究",
    outcomes: [
      "打通前端看板、后端接口和行情数据缓存",
      "支持自选股持久化、市场观察和轻量研究工作流",
      "强调本地优先、低打扰的个人使用体验"
    ],
    technologies: ["Python", "FastAPI", "Next.js", "AKShare", "SQLite"],
    status: "近期迭代",
    updatedAt: "2026-05-11",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/felix-finboard" }]
  },
  {
    name: "netcraft-6g",
    description:
      "6G 无线网络建设策略仿真原型，用于探索网络规划、资源投入、覆盖容量和策略选择之间的关系。",
    direction: "6G 网络规划 / 策略仿真 / 可视化",
    outcomes: [
      "把网络建设策略抽象成可交互的仿真原型",
      "围绕覆盖、容量和资源投入做策略对比",
      "契合无线通信和系统仿真方向的长期兴趣"
    ],
    technologies: ["TypeScript", "Next.js", "Simulation", "6G", "Strategy Game"],
    status: "方向探索",
    updatedAt: "2026-05-11",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/netcraft-6g" }]
  },
  {
    name: "felix-quant",
    description:
      "本地优先的个人量化研究终端，集成 A 股行情同步、市场状态识别、策略候选池、一键诊股、连板情绪分析、回测验证、策略收益看板和每日复盘。",
    direction: "量化研究 / A股策略 / 个人研究终端",
    outcomes: [
      "构建从行情同步到策略复盘的个人研究闭环",
      "覆盖市场状态、策略候选、回测验证和风险观察",
      "强调研究辅助，不构成投资建议"
    ],
    technologies: ["Python", "FastAPI", "Quant Research", "AKShare", "Backtesting"],
    status: "近期迭代",
    updatedAt: "2026-05-10",
    stars: 3,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/felix-quant" }]
  },
  {
    name: "hotwords-radar",
    description:
      "互联网热词词云与热点趋势分析系统，基于 Next.js、Prisma 和 AI 分析接口，用于观察热点词汇、趋势变化和语义聚类。",
    direction: "热点分析 / AI 分析 / 数据看板",
    outcomes: [
      "将热点词汇采集、趋势观察和 AI 分析组织成看板",
      "使用 Prisma 管理数据结构和持久化",
      "适合做内容洞察、选题观察和趋势复盘"
    ],
    technologies: ["TypeScript", "Next.js", "Prisma", "AI Analysis", "Word Cloud"],
    status: "近期迭代",
    updatedAt: "2026-05-10",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/hotwords-radar" }]
  },
  {
    name: "FilePilot",
    description:
      "本地优先的桌面文件整理工具，支持 macOS 和 Windows，可扫描目录、生成规则驱动的分类计划、人工确认后安全整理，并支持 dry-run 与回滚。",
    direction: "本地工具 / 文件整理 / 桌面效率",
    outcomes: [
      "围绕文件扫描、分类计划、人工确认和安全执行形成闭环",
      "支持 dry-run 与回滚，降低自动整理带来的误操作风险",
      "强调本地优先和可控的工具体验"
    ],
    technologies: ["Python", "Desktop Tool", "Automation", "Dry Run", "Rollback"],
    status: "公开仓库",
    updatedAt: "2026-05-09",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/FilePilot" }]
  },
  {
    name: "xiang-fuxing-blog",
    description:
      "当前个人博客网站仓库，用于沉淀无线通信、系统仿真、AI 辅助研发、技术管理和个人成长文章。",
    direction: "个人知识系统 / MDX / Next.js",
    outcomes: [
      "支持 MDX 文章、归档、标签、分类、搜索和 SEO",
      "围绕个人知识资产建设持续迭代内容体系",
      "部署在个人服务器并接入自有域名"
    ],
    technologies: ["MDX", "Next.js", "TypeScript", "Tailwind CSS", "SEO"],
    status: "持续维护",
    updatedAt: "2026-05-08",
    stars: 1,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/xiang-fuxing-blog" }]
  },
  {
    name: "selfreport",
    description:
      "上海大学自动每日一报脚本，是早期用 Python 解决重复流程自动化问题的项目。",
    direction: "自动化脚本 / 校园工具 / Python",
    outcomes: [
      "把重复填报流程脚本化，减少人工操作",
      "体现早期用代码解决实际问题的自动化意识",
      "获得一定社区关注和 fork"
    ],
    technologies: ["Python", "Automation", "Script", "Workflow", "校园工具"],
    status: "历史项目",
    updatedAt: "2022-06-28",
    stars: 7,
    forks: 6,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/selfreport" }]
  },
  {
    name: "learn-python3",
    description:
      "Python 3 学习样例代码仓库，用于基础语法和编程练习。",
    direction: "学习样例 / Python / Fork",
    outcomes: [
      "记录 Python 3 基础学习代码",
      "用于早期编程练习和样例复盘",
      "作为 fork 仓库保留学习痕迹"
    ],
    technologies: ["Python", "Sample Code", "Learning", "GitHub Fork"],
    status: "Fork 学习",
    updatedAt: "2020-06-19",
    stars: 0,
    forks: 0,
    isFork: true,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/learn-python3" }]
  },
  {
    name: "SHUSport",
    description:
      "上海大学体育相关微信小程序 demo，属于早期校园应用和小程序开发练习。",
    direction: "微信小程序 / 校园应用 / Demo",
    outcomes: [
      "围绕校园体育场景做小程序原型",
      "练习移动端轻应用的信息组织和交互",
      "保留早期产品化练习记录"
    ],
    technologies: ["微信小程序", "JavaScript", "Mobile UI", "Campus App"],
    status: "历史项目",
    updatedAt: "2020-04-03",
    stars: 1,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/SHUSport" }]
  },
  {
    name: "Algorithm",
    description:
      "C++ 算法学习仓库，用于沉淀数据结构、算法题和基础编程训练。",
    direction: "算法学习 / C++ / 数据结构",
    outcomes: [
      "沉淀算法和数据结构学习代码",
      "训练 C++ 基础能力和问题拆解能力",
      "保留早期编程学习路径"
    ],
    technologies: ["C++", "Algorithm", "Data Structure", "Practice"],
    status: "学习沉淀",
    updatedAt: "2020-02-26",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/Algorithm" }]
  },
  {
    name: "Python",
    description:
      "个人 Python 学习仓库，用于记录基础语法、脚本能力和编程练习。",
    direction: "编程学习 / Python / 知识沉淀",
    outcomes: [
      "记录 Python 基础学习过程",
      "积累脚本化解决问题的基础能力",
      "作为早期编程学习档案保留"
    ],
    technologies: ["Python", "Script", "Learning", "Programming Basics"],
    status: "学习沉淀",
    updatedAt: "2020-02-22",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/Python" }]
  },
  {
    name: "Cache",
    description:
      "缓存系统学习仓库，围绕 Redis、MemCached 等后端基础组件做资料和代码沉淀。",
    direction: "后端基础 / 缓存系统 / 学习笔记",
    outcomes: [
      "整理缓存系统相关基础知识",
      "覆盖 Redis、MemCached 等典型组件",
      "服务后端工程基础能力建设"
    ],
    technologies: ["Redis", "MemCached", "Cache", "Backend Basics"],
    status: "学习沉淀",
    updatedAt: "2020-02-20",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/Cache" }]
  },
  {
    name: "MacTerminal",
    description:
      "macOS 终端问题记录仓库，整理使用 Mac 终端时遇到的问题和解决方案。",
    direction: "终端效率 / macOS / 问题记录",
    outcomes: [
      "记录终端使用中的问题和处理办法",
      "沉淀命令行和环境配置经验",
      "服务个人开发环境效率提升"
    ],
    technologies: ["macOS", "Terminal", "Shell", "Developer Workflow"],
    status: "学习沉淀",
    updatedAt: "2020-02-17",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/MacTerminal" }]
  },
  {
    name: "Linux",
    description:
      "Linux 相关内容学习仓库，用于记录系统命令、环境配置和基础知识。",
    direction: "操作系统 / Linux / 学习笔记",
    outcomes: [
      "沉淀 Linux 基础知识和使用经验",
      "记录系统环境、命令和配置问题",
      "作为工程基础能力训练的一部分"
    ],
    technologies: ["Linux", "Shell", "OS Basics", "Notes"],
    status: "学习沉淀",
    updatedAt: "2020-02-17",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/Linux" }]
  },
  {
    name: "PHP",
    description:
      "PHP 学习仓库，起因是学习 SQL 注入时顺带了解 PHP 和 Web 基础。",
    direction: "Web 安全 / PHP / SQL 注入学习",
    outcomes: [
      "围绕 SQL 注入学习补齐 PHP 基础",
      "记录 Web 安全入门相关知识",
      "保留早期安全学习路径"
    ],
    technologies: ["PHP", "Web Security", "SQL Injection", "Learning"],
    status: "学习沉淀",
    updatedAt: "2020-02-17",
    stars: 0,
    forks: 0,
    links: [{ label: "GitHub 仓库", href: "https://github.com/XFX-939/PHP" }]
  }
];

const githubReposByName = new Map(githubRepoSnapshot.repositories.map((repository) => [repository.name, repository]));

export const projects: Project[] = curatedProjects.map((project) => {
  const repository = githubReposByName.get(project.name);

  if (!repository) {
    return project;
  }

  return {
    ...project,
    updatedAt: repository.updatedAt,
    stars: repository.stars,
    forks: repository.forks,
    isFork: repository.isFork,
    githubDescription: repository.description || undefined,
    primaryLanguage: repository.primaryLanguage || undefined,
    links: project.links.map((link, index) => (index === 0 ? { ...link, href: repository.url } : link))
  };
});

const projectByName = new Map(projects.map((project) => [project.name, project]));

function requireProject(name: string) {
  const project = projectByName.get(name);

  if (!project) {
    throw new Error(`Missing curated project: ${name}`);
  }

  return project;
}

const leadProjectName = "openclaw-multi-agent-team";
const spotlightProjectNames = ["harmonyos-clashbox-guide", "kr-personal-proxy-runbook", "ai-learning-lab"];
const currentProjectNames = ["xiang-fuxing-blog", "netcraft-6g", "flight", "blogfactory", "felix-finboard", "FilePilot"];
const visibleProjectNames = new Set([leadProjectName, ...spotlightProjectNames, ...currentProjectNames]);

export const projectGroups = {
  lead: requireProject(leadProjectName),
  spotlight: spotlightProjectNames.map(requireProject),
  current: currentProjectNames.map(requireProject),
  archive: projects.filter((project) => !visibleProjectNames.has(project.name))
};

export const githubProjectSnapshot = {
  account: githubRepoSnapshot.account,
  syncedAt: githubRepoSnapshot.syncedAt,
  publicRepositoryCount: githubRepoSnapshot.repositories.length,
  curatedProjectCount: projects.length
};
