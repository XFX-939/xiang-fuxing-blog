import { cookies } from "next/headers";
import { Settings2 } from "lucide-react";
import { AdminLogin, AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { getAdminStatus } from "@/lib/admin-auth";
import { getAllCategories } from "@/lib/posts";
import { shanghaiToday } from "@/lib/markdown-editor";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const status = getAdminStatus(cookies().toString());

  if (status === "unconfigured") {
    return (
      <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 sm:p-8">
        <Settings2 className="h-8 w-8 text-accent" aria-hidden="true" />
        <h2 className="mt-5 text-xl font-semibold">先完成发布配置</h2>
        <p className="mt-3 text-sm leading-7 text-secondary">请按照部署说明配置以下环境变量，完成后重启服务，即可使用文章发布后台。</p>
        <ul className="mt-5 space-y-2 rounded-md border border-border bg-surface-elevated p-4 font-mono text-xs leading-6 text-secondary sm:text-sm">
          <li>BLOG_ADMIN_PASSWORD_HASH</li>
          <li>BLOG_ADMIN_SESSION_SECRET</li>
          <li>BLOG_ADMIN_ORIGIN</li>
        </ul>
        <p className="mt-4 text-sm leading-7 text-secondary">生产环境还需设置 <code className="break-all text-xs">BLOG_CONTENT_DIR</code>，用于持续保存已发布文章。</p>
        <p className="mt-4 text-xs leading-6 text-muted">配置步骤请查看项目部署说明 docs/markdown-publishing.md。</p>
      </section>
    );
  }

  if (status === "unauthenticated") {
    return <AdminLogin />;
  }

  return <AdminWorkspace categories={getAllCategories().map((category) => category.name)} initialDate={shanghaiToday()} />;
}
