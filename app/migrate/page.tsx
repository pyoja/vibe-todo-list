"use client";

import { runMigration } from "@/app/actions/migrate-action";
import { useState } from "react";

export default function MigratePage() {
  const [status, setStatus] = useState("Ready");

  const handleMigrate = async () => {
    setStatus("Running...");
    const result = await runMigration();
    setStatus(result.message);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        DB Migration: Add Order Column
      </h1>
      <p className="mb-4">Status: {status}</p>
      <button
        onClick={handleMigrate}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Migration
      </button>
    </div>
  );
}
