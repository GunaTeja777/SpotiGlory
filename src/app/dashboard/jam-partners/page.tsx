"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyJamPartnersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/jam-rooms");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-white flex items-center justify-center p-8 text-xs font-mono">
      Redirecting to Jam Rooms...
    </div>
  );
}
