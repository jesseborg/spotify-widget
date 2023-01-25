import { invoke } from '@tauri-apps/api';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import { client, queryClient, rspc } from './utils/rspc';

import App from './App';
import './main.css';

const Main = () => {
	useEffect(() => {
		invoke('app_ready');
	}, []);

	return (
		<React.StrictMode>
			<rspc.Provider client={client} queryClient={queryClient}>
				<App />
			</rspc.Provider>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />);
