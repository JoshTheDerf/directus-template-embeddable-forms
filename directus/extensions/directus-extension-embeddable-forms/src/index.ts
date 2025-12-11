import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';
import LayoutComponent from './layout.vue';
import OverviewComponent from './routes/overview.vue';
import SetupComponent from './routes/setup.vue';
import EmbeddingComponent from './routes/embedding.vue';
import { registerPublicRoute } from './utils/register-public-route';

// Register the public route directly via Vue Router
// This bypasses the module's authentication requirements
registerPublicRoute(ModuleComponent, '/forms/:collection', 'forms');

export default defineModule({
	id: 'embeddable-forms',
	name: 'Embeddable Forms',
	icon: 'dynamic_form',
	routes: [
		{
			path: '',
			component: LayoutComponent,
			children: [
				{
					path: '',
					component: OverviewComponent,
				},
				{
					path: 'setup',
					component: SetupComponent,
				},
				{
					path: 'embedding',
					component: EmbeddingComponent,
				},
			],
		},
	],
});
