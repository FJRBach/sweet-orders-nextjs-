// lib/types/stack.d.ts
import { Session as StackSession } from '@stackframe/stack';

declare module '@stackframe/stack' {
  interface Session {
    token?: string;
    accessToken?: string;
  }
}