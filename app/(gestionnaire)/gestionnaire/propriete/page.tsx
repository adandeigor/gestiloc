'use client'
import dynamic from "next/dynamic";

const ProprietePage = dynamic(() => import("./ProprietePageClient"), { ssr: false });

export default function Page() {
  return <ProprietePage/>
}