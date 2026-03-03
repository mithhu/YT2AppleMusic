import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | YT2Apple Music",
  description:
    "Privacy policy for the YT2Apple Music website and Chrome extension.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,17,23,0.8)",
        }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #fb7185, #f43f5e)",
              }}
            >
              <span className="text-xs font-bold text-white">Y</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              YT2Apple Music
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.2)",
              color: "#fb7185",
            }}
          >
            Back to search
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
          Privacy Policy
        </h1>
        <p
          className="text-sm mb-10"
          style={{ color: "rgba(241,245,249,0.35)" }}
        >
          Last updated: March 3, 2026
        </p>

        <div className="space-y-8">
          <Section title="Overview">
            <p>
              YT2Apple Music is a free tool that helps you find songs on Apple
              Music from YouTube. This policy covers both the website
              (yt2apple.vercel.app) and the Chrome extension. We are committed
              to your privacy and collect as little data as possible.
            </p>
          </Section>

          <Section title="What the Chrome Extension Does">
            <p>The extension reads the current YouTube page to detect:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Video title</li>
              <li>Channel name</li>
              <li>Video URL / ID</li>
            </ul>
            <p className="mt-3">
              This information is used solely to search for a matching song on
              Apple Music. It is never stored on our servers, never sold, and
              never shared with third parties for advertising or tracking.
            </p>
          </Section>

          <Section title="Data We Collect">
            <p>
              <strong className="text-white">We do not collect any personal data.</strong>{" "}
              No accounts, no emails, no names, no cookies for tracking, no
              analytics in the extension.
            </p>
            <p className="mt-3">
              The website uses Vercel Analytics for anonymous, aggregate page
              view counts. No personally identifiable information is collected
              by the analytics.
            </p>
          </Section>

          <Section title="External Services">
            <p>The extension and website contact the following services:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>
                <strong className="text-white">iTunes Search API</strong>{" "}
                (Apple) — to look up song metadata and find Apple Music links
              </li>
              <li>
                <strong className="text-white">YouTube oEmbed API</strong>{" "}
                (Google) — to fetch video title and channel name from a video ID
              </li>
              <li>
                <strong className="text-white">Supabase</strong> (community
                database) — to check if a verified YouTube-to-Apple Music
                mapping already exists, improving speed and accuracy
              </li>
            </ul>
            <p className="mt-3">
              No personal or identifying information is sent to these services.
              Only the YouTube video ID and song search queries are transmitted.
            </p>
          </Section>

          <Section title="Local Storage">
            <p>
              The Chrome extension uses{" "}
              <code
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                chrome.storage.local
              </code>{" "}
              to save:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Your extension settings (e.g. OpenAI API key if provided)</li>
              <li>Cached song mappings to avoid repeated lookups</li>
            </ul>
            <p className="mt-3">
              This data stays on your device and is never transmitted anywhere.
              You can clear it at any time through the extension settings or by
              removing the extension.
            </p>
          </Section>

          <Section title="Permissions Explained">
            <ul className="list-disc ml-5 space-y-2">
              <li>
                <strong className="text-white">activeTab</strong> — Read the
                current YouTube page to detect the song title and artist
              </li>
              <li>
                <strong className="text-white">storage</strong> — Save your
                settings and cached song mappings locally on your device
              </li>
              <li>
                <strong className="text-white">tabs</strong> — Open Apple Music
                links in a new tab when you click &quot;Play on Apple Music&quot;
              </li>
              <li>
                <strong className="text-white">Host permissions</strong> —
                Access YouTube (content script), iTunes API (song lookup), Apple
                Music (open songs), and Supabase (community database)
              </li>
            </ul>
          </Section>

          <Section title="Children's Privacy">
            <p>
              YT2Apple Music is not directed at children under 13. We do not
              knowingly collect any information from children.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this policy from time to time. Changes will be
              posted on this page with an updated date. Continued use of the
              extension or website constitutes acceptance of any changes.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions or concerns? Open an issue on{" "}
              <a
                href="https://github.com/mithhu/YT2AppleMusic/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#fb7185" }}
                className="hover:underline"
              >
                GitHub
              </a>{" "}
              or reach out via the repository.
            </p>
          </Section>
        </div>
      </main>

      <footer
        className="py-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p
            className="text-xs"
            style={{ color: "rgba(241,245,249,0.25)" }}
          >
            <Link href="/" className="hover:underline">
              YT2Apple Music
            </Link>
            {" · "}
            Discover on YouTube, listen in lossless
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-white">{title}</h2>
      <div
        className="text-sm leading-relaxed"
        style={{ color: "rgba(241,245,249,0.6)" }}
      >
        {children}
      </div>
    </section>
  );
}
