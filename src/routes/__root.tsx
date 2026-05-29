import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { AppErrorBoundary } from "@/components/error-boundary";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CreatorHub by Siri — All-in-one AI tools for creators" },
      { name: "description", content: "60+ free AI tools for content, image, audio, and video creators. No paywalls, no credits — just create." },
      { property: "og:title", content: "CreatorHub by Siri — All-in-one AI tools for creators" },
      { property: "og:description", content: "60+ free AI tools for content, image, audio, and video creators. No paywalls, no credits — just create." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "CreatorHub by Siri" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0a0a1a" },
      { name: "twitter:title", content: "CreatorHub by Siri — All-in-one AI tools for creators" },
      { name: "twitter:description", content: "60+ free AI tools for content, image, audio, and video creators. No paywalls, no credits — just create." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1466d91e-597f-4d89-864e-e5f0f1d007f7" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1466d91e-597f-4d89-864e-e5f0f1d007f7" },
      { property: "og:url", content: "https://creatorhubforever.lovable.app/" },
      { name: "twitter:site", content: "@creatorhub" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://creatorhubforever.lovable.app/#org",
              name: "CreatorHub by Siri",
              url: "https://creatorhubforever.lovable.app",
              logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1466d91e-597f-4d89-864e-e5f0f1d007f7",
            },
            {
              "@type": "WebSite",
              "@id": "https://creatorhubforever.lovable.app/#website",
              url: "https://creatorhubforever.lovable.app",
              name: "CreatorHub by Siri",
              description: "60+ free AI tools for content, image, audio, and video creators.",
              publisher: { "@id": "https://creatorhubforever.lovable.app/#org" },
            },
            {
              "@type": "SoftwareApplication",
              name: "CreatorHub by Siri",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web",
              url: "https://creatorhubforever.lovable.app",
              description: "All-in-one AI creator platform with 60+ free tools for scripts, images, voice, video and more.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <AuthProvider>
          <Outlet />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}
