import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 p-4 text-sm text-center">
      <p>© 2025 Clipzo. All rights reserved.</p>
      <div className="flex gap-2">
        <div>
          <Link
            href="https://github.com/nileshpahari/clipzo"
            target="_blank"
            className="underline"
          >
            Repo
          </Link>
          <span className="hidden sm:inline">.</span>
        </div>
        <div>
          <Link href="/thankful" className="underline">
            Credits
          </Link>
          <span className="hidden sm:inline">.</span>
        </div>
      </div>
    </footer>
  );
}
