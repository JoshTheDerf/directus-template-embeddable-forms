<template>
	<div class="page-container">
		<p>
			Learn how to embed forms in your website with auto-resize, prefill data, and event handling.
		</p>


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
					<tr>
						<td><code>directus-form-prefill-applied</code></td>
						<td>Prefill data was applied</td>
						<td>{ source, fields, collection }</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Complete Example -->
		<div class="section">
			<h2 class="type-title">Complete Integration Example</h2>
			<div class="code-block">
				<pre>&lt;iframe
  id="contact-form"
  src="{{ baseUrl }}/admin/forms/contact_requests"
  width="100%"
  style="border: none;"
  scrolling="no"&gt;
&lt;/iframe&gt;

&lt;script&gt;
const iframe = document.getElementById('contact-form');

window.addEventListener('message', (event) => {
  if (event.origin !== '{{ baseUrl }}') return;

  switch (event.data.type) {
    case 'directus-form-ready':
      console.log('Form ready');
      // Send prefill data
      iframe.contentWindow.postMessage({
        type: 'directus-form-prefill',
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }, '{{ baseUrl }}');
      break;

    case 'directus-form-resize':
      // Auto-resize iframe
      iframe.style.height = event.data.data.height + 'px';
      break;

    case 'directus-form-submitted':
      console.log('Form submitted!', event.data.data);
      // Show thank you message, redirect, etc.
      break;

    case 'directus-form-error':
      console.error('Form error:', event.data.data.error);
      break;

    case 'directus-form-prefill-applied':
      console.log('Prefilled fields:', event.data.data.fields);
      break;
  }
});
&lt;/script&gt;</pre>
				<v-button x-small icon @click="copyExample">
					<v-icon name="content_copy" small />
				</v-button>
			</div>
		</div>

		<!-- Resources -->
		<div class="section">
			<div class="resources-grid">
				<v-notice type="normal">
					<h3>Interactive Demo</h3>
					<p>View live examples of all prefill methods</p>
					<v-button x-small secondary :href="demoUrl" target="_blank">
						<v-icon name="open_in_new" left small />
						Launch Demo
					</v-button>
				</v-notice>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStores } from '@directus/extensions-sdk';

const stores = useStores();
const notificationsStore = stores.useNotificationsStore();

const baseUrl = computed(() => window.location.origin);
const demoUrl = computed(() => `${baseUrl.value}/dirserve/index.html`);

function copyExample() {
	const code = document.querySelector('.code-block pre')?.textContent || '';
	navigator.clipboard.writeText(code);
	notificationsStore.add({ title: 'Copied to clipboard', type: 'success' });
}

function openDocs() {
	window.open('https://github.com/directus/directus', '_blank');
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
</style>
