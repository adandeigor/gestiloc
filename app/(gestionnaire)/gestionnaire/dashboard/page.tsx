'use client'

import dynamic from "next/dynamic";


const DashboardClient = dynamic(() => import("./DashboardClient"), { ssr: false });

export default function Page() {
  
  // Rendre le dashboard si le compte est confirmé
  return <DashboardClient />;
}