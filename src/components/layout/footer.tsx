import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container flex flex-col gap-4 py-6 px-6 mx-auto max-w-4xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Repo Wrapped</span>
          <span className="text-border">·</span>
          <Link
            href="https://www.augmentcode.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Augment Code
          </Link>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://www.augmentcode.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Augment
          </Link>
        </div>
      </div>
    </footer>
  );
}
