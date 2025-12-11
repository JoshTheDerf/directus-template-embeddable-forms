<template>
	<div class="page-container">
		<p>
			Step-by-step guide to configure permissions and set up embeddable forms for any collection.
		</p>
		<br />
		<v-notice type="warning">
			<p><strong>Important:</strong> Forms require proper permissions to work. Follow these steps to set up a new
				embeddable form.</p>
		</v-notice>

		<div class="setup-steps">
			<div class="step-card">
				<div class="step-number">1</div>
				<div class="step-content">
					<h3>Create or Choose a Collection</h3>
					<p>Navigate to <strong>Settings → Data Model</strong> and either create a new collection or select an existing
						one.</p>
					<ul>
						<li>Add the fields you want in your form</li>
						<li>Mark required fields appropriately</li>
						<li>Set up validation rules as needed</li>
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
					<h3>Add System Collection Read Permissions</h3>
					<p>All forms need to be able to read schema information. Create a policy with read permissions for these
						system collections and attach it to the public role:
					</p>
					<ul>
						<li><code>directus_collections</code> - All Fields</li>
						<li><code>directus_fields</code> - All Fields</li>
						<li><code>directus_relations</code> - All Fields</li>
					</ul>
					<p>These allow the form to fetch field definitions and validation rules.</p>

					<v-notice type="warning" style="margin-top: 16px; margin-bottom: 16px;">
						<p><strong>Security Note:</strong> This grants the public role read access to your data model structure
							(collection names, field definitions, relationships). This does <strong>not</strong> expose actual data,
							only the schema. If your data model itself is sensitive, consider using a dedicated role instead of the
							public role.</p>
					</v-notice>

					<v-button x-small secondary to="/settings/roles/public">
						<v-icon name="admin_panel_settings" left small />
						Manage Public Role
					</v-button>
				</div>
			</div>

			<div class="step-card">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>Configure Target Collection Permissions</h3>
					<p>Your form collection needs three types of permissions:</p>

					<div style="margin-top: 20px;">
						<h4 style="margin-bottom: 8px; font-weight: 600;">A. Create Permission (Required)</h4>
						<p style="margin-bottom: 12px;">Allows public users to submit new items:</p>
						<ul>
							<li><strong>Action:</strong> Create</li>
							<li><strong>Fields:</strong> All Fields (or specific fields you want to allow)</li>
							<li><strong>Custom Access:</strong> None</li>
						</ul>
					</div>

					<div style="margin-top: 24px;">
						<h4 style="margin-bottom: 8px; font-weight: 600;">B. Partial Read Permissions</h4>
						<p style="margin-bottom: 12px;"><strong>Critical:</strong> Add a Read permission that blocks all data but
							allows schema access:</p>
						<div class="code-block">
							<pre>Paste the following in Read -> Use Custom -> Item Permissions
{
  "_and": [
    {
      "id": {
        "_null": true
      }
    }
  ]
}</pre>
							<v-button x-small icon @click="copyFilter" style="margin-top: 8px;">
								<v-icon name="content_copy" small />
							</v-button>
						</div>
						<ul style="margin-top: 12px;">
							<li>The filter <code>id._null: true</code> state is impossible (Primary keys are never null)</li>
							<li>This lets the form read field definitions without exposing actual data</li>
							<li><strong>Read -> Use Custom -> Field Permissions</strong> Only include fields that should appear in
								the form (exclude <code>id</code>,
								<code>status</code>, <code>user_created</code>, <code>date_created</code>)
							</li>
						</ul>
					</div>

					<div style="margin-top: 24px;">
						<h4 style="margin-bottom: 8px; font-weight: 600;">C. Related Collection Permissions (If Applicable)</h4>
						<p style="margin-bottom: 12px;">If your form has relationship fields (M2O, M2M), add read permissions for
							those collections:</p>
						<ul>
							<li>Example: Job application form → Read access to <code>job_postings</code></li>
							<li>Example: Event registration → Read access to <code>events</code></li>
							<li>Use <strong>normal read permissions</strong> (no impossible filter) for lookup data</li>
							<li>Only expose the fields needed in dropdowns (e.g., <code>id</code>, <code>name</code>,
								<code>title</code>)
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="step-card">
				<div class="step-number">4</div>
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
				<div class="step-number">5</div>
				<div class="step-content">
					<h3>Embed in Your Website</h3>
					<p>Once tested, get the embed code from the Overview page.</p>
					<p><strong>Best Practices:</strong></p>
					<ul>
						<li>Use HTTPS for secure form submissions</li>
						<li>Implement CORS properly if using postMessage</li>
						<li>Turn on Directus <a href="https://directus.io/docs/configuration/security-limits#rate-limiting"
								target="_blank">rate limiting</a> to reduce abuse surface.</li>
						<li>Set up email notifications for new submissions (via Directus flows)</li>
					</ul>
					<v-button x-small secondary to="/embeddable-forms">
						<v-icon name="arrow_back" left small />
						Back to Overview
					</v-button>
				</div>
			</div>
		</div>

		<div class="section" style="margin-top: 48px;">
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
							<td>name, email, phone, company, category, priority, subject, message<br><em>(exclude: id, status,
									date_created, user_created)</em></td>
							<td><code style="font-size: 11px;">{ "_and": [{ "id": { "_null": true }}]}</code></td>
						</tr>
					</tbody>
				</table>
			</div>

			<v-notice type="warning">
				<p><strong>Why the impossible filter?</strong> The filter <code>id._null: true</code> prevents reading actual
					items (since IDs are never null), but allows the form to access field schema information. Without any read
					permission, the form cannot fetch field definitions.</p>
			</v-notice>

			<br />

			<v-notice type="info">
				<p><strong>Security Tip:</strong> You can add validation rules via Directus flows to sanitize input, check for
					spam, or require email verification before accepting submissions.</p>
			</v-notice>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStores } from '@directus/extensions-sdk';

const stores = useStores();
const notificationsStore = stores.useNotificationsStore();

const baseUrl = computed(() => window.location.origin);

function copyFilter() {
	const filter = JSON.stringify({
		"_and": [
			{
				"id": {
					"_null": true
				}
			}
		]
	}, null, 2);

	navigator.clipboard.writeText(filter);
	notificationsStore.add({ title: 'Copied to clipboard', type: 'success' });
}
</script>

<style scoped>
@import './shared-styles.css';

.compact-info {
	margin-bottom: 24px;
}

.compact-info :deep(.type-text) {
	font-size: 14px;
	line-height: 1.5;
}
</style>
