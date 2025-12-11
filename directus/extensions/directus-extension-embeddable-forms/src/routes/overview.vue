<template>
	<div class="page-container">
		<p>
			Create public submission forms for any collection that can be embedded in external websites with the full range of
			Directus form and interface capabilities.
		</p>

		<!-- Getting Started Guide -->
		<div class="section">
			<h2 class="type-title">Getting Started</h2>
			<div class="guide-cards">
				<div class="guide-card">
					<h3><v-icon name="add_circle" /> Creating New Forms</h3>
					<p>Set up permissions and configure collections for public form submission.</p>
					<v-button x-small secondary to="/embeddable-forms/setup">
						<v-icon name="arrow_forward" left small />
						Setup Guide
					</v-button>
				</div>
				<div class="guide-card">
					<h3> <v-icon name="integration_instructions" />
						Embedding Forms</h3>
					<p>Learn about prefill methods, auto-resize, and iframe event handling.</p>
					<v-button x-small secondary to="/embeddable-forms/embedding">
						<v-icon name="arrow_forward" left small />
						Embedding Guide
					</v-button>
				</div>
			</div>
		</div>

		<!-- Quick Start -->
		<div class="section">
			<h2 class="type-title">Quick Start</h2>
			<p>Access any collection form using this URL pattern:</p>
			<div class="code-block">
				<code>{{ baseUrl }}/admin/forms/<span class="highlight">COLLECTION_NAME</span></code>
				<v-button x-small icon @click="copyToClipboard(`${baseUrl}/admin/forms/COLLECTION_NAME`)">
					<v-icon name="content_copy" small />
				</v-button>
			</div>
		</div>

		<!-- Demo Collections -->
		<div class="section">
			<h2 class="type-title">Available Demo Collections</h2>
			<p>The following collections are set up with demo data and ready to embed:</p>

			<div class="collections-grid">
				<div v-for="collection in demoCollections" :key="collection.name" class="collection-card">
					<div class="card-header">
						<v-icon :name="collection.icon" large />
						<h3>{{ collection.label }}</h3>
					</div>
					<p class="card-description">{{ collection.description }}</p>

					<div class="card-actions">
						<v-button small secondary @click="selectedCollection = collection">
							<v-icon name="code" left small />
							Embed Code
						</v-button>
						<v-button small :href="`${baseUrl}/admin/forms/${collection.name}`" target="_blank">
							<v-icon name="open_in_new" left small />
							Open Form
						</v-button>
					</div>
				</div>
			</div>
		</div>

		<!-- Live Demo Link -->
		<div class="section">
			<h2 class="type-title">Interactive Demo</h2>
			<v-notice type="info">
				<p>
					View live examples of all prefill methods, marketing attribution, and iframe communication:
				</p>
				<v-button class="demo-button" :href="demoUrl" target="_blank">
					<v-icon name="play_arrow" left />
					Launch Interactive Demo
				</v-button>
			</v-notice>
		</div>
	</div>

	<!-- Embed Code Dialog -->
	<v-dialog v-model="showEmbedDialog" @esc="showEmbedDialog = false">
		<template v-if="selectedCollection">
			<v-card>
				<v-card-title>Embed Code: {{ selectedCollection.label }}</v-card-title>
				<v-card-text>
					<p>Basic iframe embed:</p>
					<div class="code-block">
						<pre>&lt;iframe
  src="{{ baseUrl }}/admin/forms/{{ selectedCollection.name }}"
  width="100%"
  style="border: none;"
  scrolling="no"&gt;
&lt;/iframe&gt;</pre>
						<v-button x-small icon @click="copyEmbedCode(selectedCollection)">
							<v-icon name="content_copy" small />
						</v-button>
					</div>

					<p style="margin-top: 20px;">With auto-resize:</p>
					<div class="code-block">
						<pre>&lt;iframe
  id="form-{{ selectedCollection.name }}"
  src="{{ baseUrl }}/admin/forms/{{ selectedCollection.name }}"
  width="100%"
  style="border: none;"
  scrolling="no"&gt;
&lt;/iframe&gt;

&lt;script&gt;
const iframe = document.getElementById('form-{{ selectedCollection.name }}');

window.addEventListener('message', (event) => {
  if (event.origin !== '{{ baseUrl }}') return;

  if (event.data.type === 'directus-form-resize') {
    iframe.style.height = event.data.data.height + 'px';
  }
});
&lt;/script&gt;</pre>
					</div>
				</v-card-text>
				<v-card-actions>
					<v-button secondary @click="showEmbedDialog = false">Close</v-button>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStores } from '@directus/extensions-sdk';

const stores = useStores();
const notificationsStore = stores.useNotificationsStore();

const baseUrl = computed(() => window.location.origin);
const demoUrl = computed(() => `${baseUrl.value}/dirserve/index.html`);

const selectedCollection = ref(null);
const showEmbedDialog = computed({
	get: () => selectedCollection.value !== null,
	set: (value) => { if (!value) selectedCollection.value = null; }
});

const demoCollections = [
	{ name: 'newsletter_signups', label: 'Newsletter Signup', icon: 'email', description: 'Simple email subscription form with interest segmentation' },
	{ name: 'contact_requests', label: 'Contact Request', icon: 'question_answer', description: 'Support and inquiry form with categorization' },
	{ name: 'event_registrations', label: 'Event Registration', icon: 'event', description: 'Register for events with ticket types and preferences' },
	{ name: 'job_applications', label: 'Job Application', icon: 'work', description: 'Career application form with resume uploads' },
	{ name: 'lead_captures', label: 'Lead Capture', icon: 'trending_up', description: 'B2B lead generation with UTM tracking' },
	{ name: 'article_comments', label: 'Article Comments', icon: 'comment', description: 'Reader comments and discussions with markdown support' },
	{ name: 'quote_requests', label: 'Quote Request', icon: 'request_quote', description: 'Business quote and proposal requests with project details' },
	{ name: 'support_tickets', label: 'Support Ticket', icon: 'support_agent', description: 'Customer support ticket system for tracking issues' },
	{ name: 'survey_responses', label: 'Customer Survey', icon: 'poll', description: 'Satisfaction surveys and feedback collection' }
];

function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
	notificationsStore.add({ title: 'Copied to clipboard', type: 'success' });
}

function copyEmbedCode(collection: any) {
	const code = `<iframe\n  src="${baseUrl.value}/admin/forms/${collection.name}"\n  width="100%"\n  style="border: none;"\n  scrolling="no">\n</iframe>`;
	copyToClipboard(code);
}
</script>

<style scoped>
@import './shared-styles.css';

.compact-info {
	margin-bottom: 32px;
}

.compact-info :deep(.type-text) {
	font-size: 14px;
	line-height: 1.5;
}

.guide-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 20px;
	margin-top: 16px;
}

.guide-card {
	padding: 24px;
	border: 1px solid var(--theme--border-color);
	border-radius: 8px;
	background: var(--theme--background-subdued);
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.guide-card .v-icon {
	color: var(--theme--primary);
}

.guide-card h3 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
}

.guide-card p {
	margin: 0;
	color: var(--theme--foreground-subdued);
	flex-grow: 1;
}
</style>
