function getDirectusApp() {
	return (document.querySelector('#app') as any)?.__vue_app__;
}

function getRouter(): any {
	const app = getDirectusApp();
	if (!app) return null;
	return app?.config?.globalProperties?.$router;
}

export function registerPublicRoute(component: any, path: string, name: string) {
	// Wait for app to be mounted
	const checkAndRegister = async () => {
		const router = getRouter();

		if (!router) {
			// App not ready yet, try again
			setImmediate(checkAndRegister);
			return;
		}

		// Block redirect to login before new route has been registered and when Directus realizes the session token has expired.
		router.beforeEach((to: any, from: any) => {
			if (to.name === 'login' && to?.query?.redirect?.toString().startsWith(`/${name}`)) {
				// Preserve query parameters when redirecting back from login
				const redirectPath = to.query.redirect.toString();
				// Check if from.query has any parameters to preserve
				if (from.query && Object.keys(from.query).length > 0) {
					return { path: redirectPath, query: from.query };
				}
				return { path: redirectPath };
			}
			if (from.name === name && to.name === 'login' && to?.query?.reason === 'SESSION_EXPIRED') return false
		})

		router.addRoute({
			name,
			path,
			component,
			meta: {
				public: true,
				iframe: true, // Custom meta to indicate this route supports iframe embedding
			},
			props: true
		});
	};

	// Start checking immediately
	checkAndRegister();
}
