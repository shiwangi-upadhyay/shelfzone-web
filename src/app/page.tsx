import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-6xl font-bold tracking-tight">ShelfZone</h1>
      <p className="mt-4 text-xl text-gray-400">
        HR + Agent Management Platform
      </p>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500">
        Manage your HR operations and AI agent workforce from a single unified
        platform.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
      >
        Sign In
      </Link>
    </div>
  );
}
