import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="">
      <div className="">{children}</div>
    </main>
  );
}
