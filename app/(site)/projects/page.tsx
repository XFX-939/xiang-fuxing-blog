import { ProjectCard } from "@/components/classic/ProjectCard";
import { SectionTitle } from "@/components/classic/SectionTitle";
import { projects } from "@/lib/projects";
import { createMetadata } from "@/lib/utils";

export const metadata = createMetadata({
  title: "GitHub 项目",
  description: "向福星 GitHub 公开仓库项目展示，覆盖 AI 工具、数据看板、前端交互、量化研究、工程效率和编程学习。",
  path: "/projects"
});

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <SectionTitle
        eyebrow="Projects"
        title="GitHub 公开项目"
        description={`整理自 GitHub 公开仓库，共 ${projects.length} 个项目，覆盖 AI 工具、数据看板、前端交互、量化研究、工程效率和编程学习等方向。`}
      />
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}
