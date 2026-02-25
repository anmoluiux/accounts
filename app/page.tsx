import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid  min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="">
        <h3>Landing Pge</h3>
        <Link href={`/onboard`}>Start Now</Link>
      </div>
    </div>
  );
}
