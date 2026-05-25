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
  head: ({ loaderData }) => ({
    meta: loaderData?.tool ? [
      { title: `${loaderData.tool.name} — CreatorHub` },
      { name: "description", content: loaderData.tool.description },
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
