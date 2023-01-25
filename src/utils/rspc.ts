import { createClient } from '@rspc/client';
import { createReactQueryHooks } from '@rspc/react';
import { TauriTransport } from '@rspc/tauri';
import { QueryClient } from '@tanstack/react-query';
import { Procedures } from './bindings';

export const client = createClient<Procedures>({
	transport: new TauriTransport()
});

export const queryClient = new QueryClient();
export const rspc = createReactQueryHooks<Procedures>();
