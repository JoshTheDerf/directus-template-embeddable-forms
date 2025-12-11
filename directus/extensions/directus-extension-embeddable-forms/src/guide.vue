<template>
	<private-view title="Embeddable Forms Guide">
		<template #headline>
			<v-breadcrumb :items="[{ name: 'Embeddable Forms', to: '/embeddable-forms' }]" />
		</template>

		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="dynamic_form" />
			</v-button>
		</template>

		<template #actions>
			<v-button
				v-tooltip.bottom="'View Live Demo'"
				rounded
				icon
				:href="`${demoUrl}`"
				target="_blank"
			>
				<v-icon name="open_in_new" />
			</v-button>
		</template>

		<div class="guide-container">
			<!-- Overview Section -->
			<v-info type="success" title="Public Embeddable Forms" icon="check_circle">
				Create public forms for any collection that can be embedded in external websites. Forms support
				prefilling data via query parameters or JavaScript postMessage API.
			</v-info>

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
					<div
						v-for="collection in demoCollections"
						:key="collection.name"
						class="collection-card"
					>
						<div class="card-header">
							<v-icon :name="collection.icon" large />
							<h3>{{ collection.label }}</h3>
						</div>
						<p class="card-description">{{ collection.description }}</p>

						<div class="card-actions">
							<v-button
								small
								secondary
								@click="selectedCollection = collection"
							>
								<v-icon name="code" left small />
								Embed Code
							</v-button>
							<v-button
								small
								:href="`${baseUrl}/admin/forms/${collection.name}`"
								target="_blank"
							>
								<v-icon name="open_in_new" left small />
								Open Form
							</v-button>
						</div>
					</div>
				</div>
			</div>

			<!-- Setup Instructions -->
			<div class="section">
				<h2 class="type-title">Creating Your Own Forms</h2>
				<v-notice type="warning">
					<p><strong>Important:</strong> Forms require proper permissions to work. Follow these steps to set up a new embeddable form.</p>
				</v-notice>

				<div class="setup-steps">
					<div class="step-card">
						<div class="step-number">1</div>
						<div class="step-content">
							<h3>Create or Choose a Collection</h3>
							<p>Navigate to <strong>Settings → Data Model</strong> and either create a new collection or select an existing one.</p>
							<ul>
								<li>Add the fields you want in your form</li>
								<li>Mark required fields appropriately</li>
								<li>Set up validation rules as needed</li>
								<li>System fields (id, user_created, etc.) are automatically excluded from forms</li>
							</ul>
							<v-button x-small secondary to="/settings/data-model">
								<v-icon name="dataset" left small />
								Go to Data Model
							</v-button>
						</div>
					</div>

					<div class="step-card">
						<div class="step-number">2</div>
						<div class="step-content">
							<h3>Configure System Collection Read Permissions</h3>
							<p>The form needs to read schema information. Add read permissions for these system collections:</p>
							<ul>
								<li><code>directus_collections</code> - All Fields</li>
								<li><code>directus_fields</code> - All Fields</li>
								<li><code>directus_relations</code> - All Fields</li>
							</ul>
							<p>These allow the form to fetch field definitions and validation rules.</p>
							<v-button x-small secondary to="/settings/access-control">
								<v-icon name="admin_panel_settings" left small />
								Manage Access Control
							</v-button>
						</div>
					</div>

					<div class="step-card">
						<div class="step-number">3</div>
						<div class="step-content">
							<h3>Add Create Permission</h3>
							<p>For your target collection, add a <strong>Create</strong> permission:</p>
							<ul>
								<li><strong>Action:</strong> Create</li>
								<li><strong>Fields:</strong> All Fields (or specific fields you want to allow)</li>
								<li><strong>Custom Access:</strong> None needed</li>
							</ul>
							<p>This allows public users to submit new items to your collection.</p>
						</div>
					</div>

					<div class="step-card">
						<div class="step-number">4</div>
						<div class="step-content">
							<h3>Add Read Permission with Impossible Filter</h3>
							<p><strong>Critical:</strong> Add a Read permission with a filter that blocks all data:</p>
							<div class="code-block">
								<pre>Custom Access Filter:
{
  "_and": [
    {
      "id": {
        "_null": true
      }
    }
  ]
}</pre>
							</div>
							<p><strong>Why this works:</strong></p>
							<ul>
								<li>The filter <code>id._null: true</code> is impossible (IDs are never null)</li>
								<li>This allows the form to read field schema without exposing actual data</li>
								<li>Users cannot view existing submissions</li>
							</ul>
							<p><strong>Fields to expose:</strong> Only include fields that should appear in the form (exclude <code>id</code>, <code>status</code>, <code>user_created</code>, <code>date_created</code>, etc.)</p>
						</div>
					</div>

					<div class="step-card">
						<div class="step-number">5</div>
						<div class="step-content">
							<h3>Add Read Permissions for Related Collections</h3>
							<p>If your form has relationship fields (M2O, M2M), add read permissions for those collections:</p>
							<ul>
								<li>Example: Job application form needs read access to <code>job_postings</code></li>
								<li>Example: Event registration form needs read access to <code>events</code></li>
								<li>Use normal read permissions (no impossible filter) for lookup data</li>
							</ul>
						</div>
					</div>

					<div class="step-card">
						<div class="step-number">6</div>
						<div class="step-content">
							<h3>Test Your Form</h3>
							<p>Open the form URL in an incognito/private window to test public access:</p>
							<div class="code-block">
								<code>{{ baseUrl }}/admin/forms/<span class="highlight">your_collection</span></code>
							</div>
							<ul>
								<li>Test submitting data</li>
								<li>Verify required field validation</li>
								<li>Check that submissions appear in your collection (when logged in)</li>
								<li>Confirm you cannot view submissions when logged out</li>
								<li>Test prefill parameters if needed</li>
							</ul>
						</div>
					</div>

					<div class="step-card">
						<div class="step-number">7</div>
						<div class="step-content">
							<h3>Embed in Your Website</h3>
							<p>Once tested, use the embed code dialog above to get the iframe code for your collection.</p>
							<p><strong>Best Practices:</strong></p>
							<ul>
								<li>Use HTTPS for secure form submissions</li>
								<li>Implement CORS properly if using postMessage</li>
								<li>Add reCAPTCHA or rate limiting to prevent spam (via Directus flows)</li>
								<li>Set up email notifications for new submissions (via Directus flows)</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Permission Example -->
			<div class="section">
				<h2 class="type-title">Complete Permission Configuration Example</h2>
				<p>Here's the exact permission setup for a contact form collection:</p>

				<div class="permission-example">
					<h3 style="margin-top: 0; margin-bottom: 16px;">1. System Collections (Read)</h3>
					<table class="permission-table">
						<thead>
							<tr>
								<th>Collection</th>
								<th>Action</th>
								<th>Fields</th>
								<th>Custom Access</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><code>directus_collections</code></td>
								<td>Read</td>
								<td>All Fields</td>
								<td>None</td>
							</tr>
							<tr>
								<td><code>directus_fields</code></td>
								<td>Read</td>
								<td>All Fields</td>
								<td>None</td>
							</tr>
							<tr>
								<td><code>directus_relations</code></td>
								<td>Read</td>
								<td>All Fields</td>
								<td>None</td>
							</tr>
						</tbody>
					</table>

					<h3 style="margin-top: 24px; margin-bottom: 16px;">2. Target Collection (contact_requests)</h3>
					<table class="permission-table">
						<thead>
							<tr>
								<th>Action</th>
								<th>Fields</th>
								<th>Custom Access Filter</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><strong>Create</strong></td>
								<td>All Fields (or specific: name, email, phone, company, category, priority, subject, message)</td>
								<td>None</td>
							</tr>
							<tr>
								<td><strong>Read</strong></td>
								<td>name, email, phone, company, category, priority, subject, message<br><em>(exclude: id, status, date_created, user_created)</em></td>
								<td><code style="font-size: 11px;">{ "_and": [{ "id": { "_null": true }}]}</code></td>
							</tr>
						</tbody>
					</table>

					<div class="code-block" style="margin-top: 20px;">
						<strong>Read Permission Custom Access (copy this):</strong>
						<pre>{
  "_and": [
    {
      "id": {
        "_null": true
      }
    }
  ]
}</pre>
					</div>
				</div>

				<v-notice type="warning">
					<p><strong>Why the impossible filter?</strong> The filter <code>id._null: true</code> prevents reading actual items (since IDs are never null), but allows the form to access field schema information. Without any read permission, the form cannot fetch field definitions.</p>
				</v-notice>

				<v-notice type="info">
					<p><strong>Security Tip:</strong> You can add validation rules via Directus flows to sanitize input, check for spam, or require email verification before accepting submissions.</p>
				</v-notice>
			</div>

			<!-- Live Demo Link -->
			<div class="section">
				<h2 class="type-title">Interactive Demo</h2>
				<v-notice type="info">
					<p>
						View live examples of all prefill methods, marketing attribution, and iframe communication:
					</p>
					<v-button
						class="demo-button"
						:href="demoUrl"
						target="_blank"
					>
						<v-icon name="play_arrow" left />
						Launch Interactive Demo
					</v-button>
				</v-notice>
			</div>

			<!-- Prefill Methods -->
			<div class="section">
				<h2 class="type-title">Prefill Methods</h2>

				<div class="method-card">
					<h3><v-icon name="link" small /> Query Parameters</h3>
					<p>Best for simple, static data and shareable URLs:</p>
					<div class="code-block">
						<code>?prefill[email]=user@example.com&prefill[name]=John+Doe</code>
					</div>
					<ul>
						<li>Simple to implement (no JavaScript required)</li>
						<li>SEO-friendly and shareable</li>
						<li>Good for marketing attribution (UTM parameters)</li>
					</ul>
				</div>

				<div class="method-card">
					<h3><v-icon name="swap_horiz" small /> PostMessage API</h3>
					<p>Best for dynamic data and complex objects:</p>
					<div class="code-block">
						<pre>iframe.contentWindow.postMessage({
  type: 'directus-form-prefill',
  data: { email: 'user@example.com' }
}, directusUrl);</pre>
					</div>
					<ul>
						<li>Dynamic data based on user session</li>
						<li>Complex nested objects</li>
						<li>Sensitive information (not in URL)</li>
					</ul>
				</div>
			</div>

			<!-- Iframe Communication -->
			<div class="section">
				<h2 class="type-title">Iframe Events</h2>
				<p>Forms communicate with parent pages through these events:</p>

				<table class="events-table">
					<thead>
						<tr>
							<th>Event</th>
							<th>When</th>
							<th>Data</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>directus-form-ready</code></td>
							<td>Form loaded and ready</td>
							<td>{ collection }</td>
						</tr>
						<tr>
							<td><code>directus-form-resize</code></td>
							<td>Form height changes</td>
							<td>{ height }</td>
						</tr>
						<tr>
							<td><code>directus-form-submitted</code></td>
							<td>Form submitted successfully</td>
							<td>{ data, collection }</td>
						</tr>
						<tr>
							<td><code>directus-form-error</code></td>
							<td>Submission failed</td>
							<td>{ error, collection }</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Resources -->
			<div class="section">
				<h2 class="type-title">Resources</h2>
				<div class="resources-grid">
					<v-notice type="normal">
						<h3>Documentation</h3>
						<p>Complete guide with examples and troubleshooting</p>
						<v-button x-small secondary @click="openDocs">
							<v-icon name="book" left small />
							View Docs
						</v-button>
					</v-notice>
					<v-notice type="normal">
						<h3>Security</h3>
						<p>Ensure public role has create permissions for target collections</p>
						<v-button x-small secondary to="/settings/roles">
							<v-icon name="security" left small />
							Manage Permissions
						</v-button>
					</v-notice>
				</div>
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

						<p style="margin-top: 20px;">With query parameter prefill:</p>
						<div class="code-block">
							<pre>&lt;iframe
  src="{{ baseUrl }}/admin/forms/{{ selectedCollection.name }}?prefill[email]=user@example.com"
  width="100%"
  style="border: none;"
  scrolling="no"&gt;
&lt;/iframe&gt;</pre>
						</div>

						<p style="margin-top: 20px;">With postMessage prefill and auto-resize:</p>
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

  switch (event.data.type) {
    case 'directus-form-ready':
      // Send prefill data
      iframe.contentWindow.postMessage({
        type: 'directus-form-prefill',
        data: { email: 'user@example.com' }
      }, '{{ baseUrl }}');
      break;

    case 'directus-form-resize':
      // Auto-resize iframe
      iframe.style.height = event.data.data.height + 'px';
      break;

    case 'directus-form-submitted':
      console.log('Form submitted!', event.data.data);
      break;
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
	</private-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStores } from '@directus/extensions-sdk';

const stores = useStores();
const notificationsStore = stores.useNotificationsStore();

const baseUrl = computed(() => {
	return window.location.origin;
});

const demoUrl = computed(() => {
	return `${baseUrl.value}/dirserve/index.html`;
});

const selectedCollection = ref(null);
const showEmbedDialog = computed({
	get: () => selectedCollection.value !== null,
	set: (value) => {
		if (!value) selectedCollection.value = null;
	}
});

const demoCollections = [
	{
		name: 'newsletter_signups',
		label: 'Newsletter Signup',
		icon: 'email',
		description: 'Simple email subscription form with interest segmentation'
	},
	{
		name: 'contact_requests',
		label: 'Contact Request',
		icon: 'question_answer',
		description: 'Support and inquiry form with categorization'
	},
	{
		name: 'event_registrations',
		label: 'Event Registration',
		icon: 'event',
		description: 'Register for events with ticket types and preferences'
	},
	{
		name: 'job_applications',
		label: 'Job Application',
		icon: 'work',
		description: 'Career application form with resume uploads'
	},
	{
		name: 'lead_captures',
		label: 'Lead Capture',
		icon: 'trending_up',
		description: 'B2B lead generation with UTM tracking'
	},
	{
		name: 'article_comments',
		label: 'Article Comments',
		icon: 'comment',
		description: 'Reader comments and discussions with markdown support'
	},
	{
		name: 'quote_requests',
		label: 'Quote Request',
		icon: 'request_quote',
		description: 'Business quote and proposal requests with project details'
	},
	{
		name: 'support_tickets',
		label: 'Support Ticket',
		icon: 'support_agent',
		description: 'Customer support ticket system for tracking issues'
	},
	{
		name: 'survey_responses',
		label: 'Customer Survey',
		icon: 'poll',
		description: 'Satisfaction surveys and feedback collection'
	}
];

function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
	notificationsStore.add({
		title: 'Copied to clipboard',
		type: 'success',
	});
}

function copyEmbedCode(collection: any) {
	const code = `<iframe
  src="${baseUrl.value}/admin/forms/${collection.name}"
  width="100%"
  style="border: none;"
  scrolling="no">
</iframe>`;
	copyToClipboard(code);
}

function openDocs() {
	// Open README or documentation
	window.open('https://github.com/directus/directus', '_blank');
}
</script>

<style scoped>
.guide-container {
	padding: var(--content-padding);
	padding-top: 0;
	max-width: 1200px;
}

.section {
	margin-top: 40px;
}

.section h2 {
	margin-bottom: 16px;
}

.section p {
	color: var(--theme--foreground-subdued);
	margin-bottom: 16px;
}

.code-block {
	background: var(--theme--background-subdued);
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	padding: 16px;
	margin: 16px 0;
	position: relative;
	overflow-x: auto;
	font-family: 'Monaco', 'Menlo', monospace;
	font-size: 13px;
}

.code-block code,
.code-block pre {
	color: var(--theme--foreground);
	margin: 0;
	white-space: pre;
	font-family: inherit;
}

.code-block .highlight {
	color: var(--theme--primary);
	font-weight: 600;
}

.code-block .v-button {
	position: absolute;
	top: 8px;
	right: 8px;
}

.collections-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
	margin-top: 20px;
}

.collection-card {
	background: var(--theme--background-subdued);
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	padding: 20px;
	transition: all 0.2s;
}

.collection-card:hover {
	border-color: var(--theme--primary);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
}

.card-header h3 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.card-description {
	color: var(--theme--foreground-subdued);
	font-size: 14px;
	margin-bottom: 16px;
	min-height: 40px;
}

.card-actions {
	display: flex;
	gap: 8px;
}

.method-card {
	background: var(--theme--background-subdued);
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	padding: 20px;
	margin-bottom: 20px;
}

.method-card h3 {
	margin: 0 0 12px 0;
	display: flex;
	align-items: center;
	gap: 8px;
}

.method-card ul {
	margin: 12px 0 0 0;
	padding-left: 24px;
	color: var(--theme--foreground-subdued);
}

.method-card li {
	margin: 6px 0;
}

.events-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 16px;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	overflow: hidden;
}

.events-table th,
.events-table td {
	padding: 12px 16px;
	text-align: left;
	border-bottom: 1px solid var(--theme--form--field--input--border-color);
}

.events-table th {
	background: var(--theme--background-normal);
	font-weight: 600;
	color: var(--theme--foreground);
}

.events-table td {
	color: var(--theme--foreground-subdued);
}

.events-table code {
	background: var(--theme--background-normal);
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 12px;
	color: var(--theme--primary);
}

.resources-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 20px;
	margin-top: 16px;
}

.resources-grid .v-notice {
	margin: 0;
}

.resources-grid h3 {
	margin: 0 0 8px 0;
	font-size: 16px;
}

.resources-grid p {
	margin: 0 0 12px 0;
	font-size: 14px;
}

.demo-button {
	margin-top: 12px;
}

.v-card-text {
	max-height: 70vh;
	overflow-y: auto;
}

.setup-steps {
	margin-top: 20px;
}

.step-card {
	display: flex;
	gap: 20px;
	background: var(--theme--background-subdued);
	border: 1px solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	padding: 24px;
	margin-bottom: 20px;
	transition: all 0.2s;
}

.step-card:hover {
	border-color: var(--theme--primary);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-number {
	flex-shrink: 0;
	width: 40px;
	height: 40px;
	background: var(--theme--primary);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 18px;
}

.step-content {
	flex: 1;
}

.step-content h3 {
	margin: 0 0 12px 0;
	font-size: 18px;
	font-weight: 600;
	color: var(--theme--foreground);
}

.step-content p {
	margin: 8px 0;
	color: var(--theme--foreground-subdued);
}

.step-content ul {
	margin: 12px 0;
	padding-left: 24px;
	color: var(--theme--foreground-subdued);
}

.step-content li {
	margin: 6px 0;
}

.step-content .v-button {
	margin-top: 12px;
}

.permission-example {
	margin-top: 20px;
}

.permission-table {
	width: 100%;
	border-collapse: collapse;
	background: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	overflow: hidden;
}

.permission-table th,
.permission-table td {
	padding: 12px 16px;
	text-align: left;
	border-bottom: 1px solid var(--theme--form--field--input--border-color);
}

.permission-table th {
	background: var(--theme--background-normal);
	font-weight: 600;
	color: var(--theme--foreground);
}

.permission-table td {
	color: var(--theme--foreground-subdued);
}

.permission-table tbody tr:last-child td {
	border-bottom: none;
}
</style>
