import { ProjectCard } from "@/components/ProjectCard";
import { SectionTitle } from "@/components/SectionTitle";
import { projects } from "@/lib/projects";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "项目",
  description: "系统仿真平台、AI辅助研发作业流和数字孪生仿真探索等代表性项目。",
  path: "/projects"
});

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Projects"
        title="项目经验"
        description="以下项目均基于公开可表达的工程经验整理，重点呈现问题抽象、方法沉淀与可迁移经验。"
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}
