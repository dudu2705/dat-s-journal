import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <Link href="/entries" aria-label="Open my entries">
        <Image
          src="/logo.png"
          alt="Dat's Journal logo"
          width={600}
          height={681}
          priority
          className="logo-glow h-auto w-56 sm:w-72"
        />
      </Link>
      <h1 className="title-glow text-5xl font-bold sm:text-6xl">Dat&apos;s Journal</h1>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/entries/new" className="btn">
          Add entry
        </Link>
        <Link href="/tags" className="btn-ghost">
          Add tag
        </Link>
      </div>
    </main>
  );
}
