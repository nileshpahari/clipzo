import Link from "next/link";
export default function Footer() {
  return (
    <footer className="text-muted-foreground flex items-center justify-center gap-2 p-4">
      <p>© 2025 Clipzo. All rights reserved.</p>
      <div>
        {" "}
        <Link
          href="https://github.com/nileshpahari/clipzo"
          target="_blank"
          className="underline"
        >
          Repo
        </Link>
        <span>.</span>
      </div>
      <div>
        {" "}
        <Link href="/thankful" className="underline">
          Credits
        </Link>
        <span>.</span>
      </div>
    </footer>
  );
}
