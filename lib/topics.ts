import { BrainCircuit, Network, RadioTower, UsersRound } from "lucide-react";

export const topicHubs = [
  {
    slug: "wireless",
    title: "无线通信",
    category: "无线通信",
    href: "/topics/wireless",
    description: "围绕 5G/6G、调度、资源分配、MIMO、功控、移动性等无线系统关键机制建立工程化理解。",
    slogan: "从机制理解走向系统判断。",
    icon: RadioTower,
    keywords: ["5G/6G", "MIMO", "资源分配", "功率控制"]
  },
  {
    slug: "system-simulation",
    title: "系统仿真",
    category: "系统仿真",
    href: "/topics/system-simulation",
    description: "关注系统级仿真、TTI 级建模、KPI 评估、模型可信与 AI for Science 在无线通信中的入口。",
    slogan: "把复杂系统放进可验证的实验环境。",
    icon: Network,
    keywords: ["系统仿真", "KPI", "数字孪生", "模型可信"]
  },
  {
    slug: "ai-rd",
    title: "AI 辅助研发",
    category: "AI辅助研发",
    href: "/topics/ai-rd",
    description: "沉淀 AI Coding、CodeAgent、知识库、研发流程与工程效率提升的实践方法。",
    slogan: "人负责判断，AI 负责加速。",
    icon: BrainCircuit,
    keywords: ["AI Coding", "CodeAgent", "研发效率", "知识库"]
  },
  {
    slug: "tech-management",
    title: "技术管理",
    category: "技术管理",
    href: "/topics/tech-management",
    description: "记录目标对齐、团队协同、组织氛围、人才发展、向上管理与复盘闭环的真实经验。",
    slogan: "让经验变成团队可复用的方法。",
    icon: UsersRound,
    keywords: ["团队管理", "目标对齐", "复盘", "组织协同"]
  }
] as const;

export type TopicHub = (typeof topicHubs)[number];

export function getTopicBySlug(slug: string) {
  return topicHubs.find((topic) => topic.slug === slug);
}
