import { createFileRoute, notFound, Navigate } from "@tanstack/react-router";
import { findTool } from "@/lib/tools";
import { TextToolPage } from "@/components/tools/TextToolPage";
import { ImageToolPage } from "@/components/tools/ImageToolPage";
import { PaletteToolPage } from "@/components/tools/PaletteToolPage";
import { FontsToolPage } from "@/components/tools/FontsToolPage";
import { UploadToolPage } from "@/components/tools/UploadToolPage";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = findTool(params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData?.tool ? [
      { title: `${loaderData.tool.name} — Free AI Tool | CreatorHub` },
      { name: "description", content: loaderData.tool.description },
      { property: "og:title", content: `${loaderData.tool.name} — Free AI Tool | CreatorHub` },
      { property: "og:description", content: loaderData.tool.description },
      { property: "og:url", content: `https://creatorhubforever.lovable.app/tools/${params.slug}` },
      { name: "twitter:title", content: `${loaderData.tool.name} — Free AI Tool | CreatorHub` },
      { name: "twitter:description", content: loaderData.tool.description },
    ] : [],
    links: loaderData?.tool ? [
      { rel: "canonical", href: `https://creatorhubforever.lovable.app/tools/${params.slug}` },
    ] : [],
  }),
  component: () => <RequireAuth><ToolRouter /></RequireAuth>,
});

function ToolRouter() {
  const { tool } = Route.useLoaderData();

  switch (tool.kind) {
    case "text": return <TextToolPage tool={tool} />;
    case "image": return <ImageToolPage tool={tool} />;
    case "palette": return <PaletteToolPage tool={tool} />;
    case "fonts": return <FontsToolPage tool={tool} />;
    case "bg-remove": return <UploadToolPage tool={tool} model="background-remover" />;
    case "video": case "face-swap": case "editor":
    case "audio-tts": case "audio-stt": case "resource":
      // these have dedicated routes
      return <Navigate to="/" />;
    default: return <Navigate to="/" />;
  }
}
