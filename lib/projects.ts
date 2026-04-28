export type Project = {
  name: string;
  description: string;
  direction: string;
  outcomes: string[];
  technologies: string[];
  status: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

export const projects: Project[] = [
  {
    name: "系统仿真平台建设",
    description:
      "面向无线通信系统级性能评估的 TTI 级事件驱动仿真平台，支撑创新特性快速评估、KPI 统计和版本交付。",
    direction: "系统仿真 / 5G / 6G / 数字孪生",
    outcomes: [
      "支持多制式、多场景系统级仿真",
      "支持 KPI 统计、Trace 分析和批量仿真",
      "支撑创新特性快速评估与版本交付"
    ],
    technologies: ["C++", "Python", "仿真建模", "KPI Pipeline", "Trace 分析"],
    status: "持续建设",
    links: [{ label: "项目笔记", href: "/blog/understanding-system-simulation" }]
  },
  {
    name: "AI辅助研发作业流",
    description:
      "探索 AI Coding、知识库、工具链和研发流程的结合方式，把 AI 能力嵌入需求理解、代码阅读、方案验证和文档沉淀。",
    direction: "AI for Work / CodeAgent / 研发效率",
    outcomes: [
      "建立 AI 辅助编码实践方法",
      "沉淀典型研发场景案例",
      "推动团队 AI 工具使用和经验复用"
    ],
    technologies: ["CodeAgent", "Prompt Engineering", "RAG", "MDX", "知识库"],
    status: "实践迭代",
    links: [{ label: "方法文章", href: "/blog/ai-rd-workflow" }]
  },
  {
    name: "数字孪生仿真探索",
    description:
      "围绕现网数据、产品调度、仿真模型的一致性进行探索，关注仿真可信、数据闭环和 AI RAN 算法预评估。",
    direction: "数字孪生 / AI RAN / 仿真可信",
    outcomes: [
      "关注仿真数据分布与外场数据分布一致性",
      "支持 AI RAN 算法效果预评估",
      "探索仿真平台与真实系统的孪生映射"
    ],
    technologies: ["数字孪生", "AI RAN", "数据校准", "仿真可信", "评估闭环"],
    status: "方向探索",
    links: [{ label: "相关主题", href: "/tags/数字孪生" }]
  }
];
