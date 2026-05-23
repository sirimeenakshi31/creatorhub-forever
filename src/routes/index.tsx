import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ToolSections } from "@/components/ToolSections";
import { Directory } from "@/components/Directory";
import { Testimonials } from "@/components/Testimonials";
import { Community } from "@/components/Community";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CreatorHub by Siri — Free AI tools for creators" },
      { name: "description", content: "AI tools, templates, resources and inspiration — all in one place. Free forever for Instagram, faceless and Pinterest creators." },
      { property: "og:title", content: "CreatorHub by Siri — Free AI tools for creators" },
      { property: "og:description", content: "Everything creators need. Free forever." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ToolSections />
        <Directory />
        <Testimonials />
        <Community />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
