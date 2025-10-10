"use client";
import { useUser } from "@stackframe/stack";

export default function ClientDebug() {
  const user = useUser();
  return (
    <pre>
      {JSON.stringify(user, null, 2)}
    </pre>
  );
}