import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1132px] border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
      <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/about" className="hover:underline">About us</Link>
        <Link href="/contact" className="hover:underline">Contact us</Link>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/tnc" className="hover:underline">Terms</Link>
        <Link href="/refund" className="hover:underline">Refund policy</Link>
      </nav>
      <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">© {new Date().getFullYear()} Zooptics</p>
    </footer>
  );
}
