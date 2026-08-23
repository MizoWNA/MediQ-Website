"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MentorshipTestPage() {
  const [status, setStatus] = useState("Testing Supabase...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error) {
        console.error(error);
        setStatus(`Supabase error: ${error.message}`);
        return;
      }

      setStatus(`Supabase connected. Found ${data.length} profile(s).`);
    }

    testConnection();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-sm text-muted-foreground">
          {status}
        </p>
      </div>
    </main>
  );
}