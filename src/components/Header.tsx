import Image from "next/image";
import Link from "next/link";
import { ROUTE_HOME } from "@/routes";

export default function Sidebar() {
  return (
    <header
      id="header"
      className="flex items-start border-r border-foreground/40 shadow-2xs justify-between  py-4 bg-white"
    >
      <Link
        href={ROUTE_HOME}
        className="flex items-center px-5 py-2 justify-start gap-6 text-xl font-bold"
      >
        <Image src="/favicon-16x16.png" width={16} height={16} alt="logo" />
        WindAlert
      </Link>
    </header>
  );
}
