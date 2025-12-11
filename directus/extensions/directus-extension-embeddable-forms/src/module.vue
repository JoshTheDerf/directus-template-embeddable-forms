<template>
	<div class="embeddable-form-container">
		<div v-if="formState === 'loading'" class="loading">
			<v-progress-circular indeterminate />
			<p>Loading form...</p>
		</div>

		<div v-else-if="formState === 'submitted'" class="success">
			<v-notice type="success">
				<h2>Success!</h2>
				<p>Your form has been successfully submitted.</p>
			</v-notice>
			<v-button @click="resetForm" class="reset-button">
				Submit Another
			</v-button>
		</div>

		<div v-else ref="formWrapper" style="overflow: auto;">
			<v-form
				v-model="formData"
				:collection="collection"
				:loading="formState === 'submitting'"
				ref="form"
				:validationErrors=validationErrors
				style="padding: 2px;"
				:rawEditorEnabled="false"
				:disabledMenu="true"
			/>

			<div class="form-actions" style="padding-left: 2px;">
				<v-button
					:loading="formState === 'submitting'"
					:disabled="formState === 'submitting'"
					@click="submitForm"
					full-width
				>
					Submit
				</v-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, useTemplateRef, getCurrentInstance } from 'vue';
import { useSdk, useStores } from '@directus/extensions-sdk';
import { createRequest, createItem } from '@directus/sdk';

interface Props {
	collection: string;
	theme?: string;
}

// Remove the color scheme meta tag as it interferes with transparency.
document.querySelector('meta[name="color-scheme"]')?.remove()

// Define the possible states for our state machine
type FormState = 'loading' | 'idle' | 'submitting' | 'submitted';

const props = withDefaults(defineProps<Props>(), {
	theme: 'default',
});

const sdk = useSdk();
const stores = useStores();
const fieldsStore = stores.useFieldsStore();
const collectionsStore = stores.useCollectionsStore();
const relationsStore = stores.useRelationsStore();
const userStore = stores.useUserStore();
const permissionsStore = stores.usePermissionsStore();

// Access route from app instance instead of importing useRoute
const instance = getCurrentInstance();
const route = computed(() => instance?.proxy?.$route);

// State machine implementation
const formState = ref<FormState>('loading');
const formData = ref<Record<string, any>>({});
const form = ref()
const validationErrors = ref([])
const formWrapper = useTemplateRef<HTMLElement>('formWrapper')

// Detect if we're in an iframe
const isIframe = computed(() => {
	return window.self !== window.top;
});

// Function to communicate with parent iframe
function sendMessageToParent(type: string, data: any = {}) {
	if (isIframe.value && window.parent) {
		window.parent.postMessage({
			type: `directus-form-${type}`,
			data: {
				...data,
				collection: props.collection
			}
		}, '*');
	}
}

// Function to update iframe height
function updateIframeHeight() {
	if (!isIframe.value || !formWrapper.value) return;

	const height = formWrapper.value.offsetHeight;
	sendMessageToParent('resize', { height });
}

// Helper function to get valid field names for the collection
function getValidFieldNames(): Set<string> {
	const fields = fieldsStore.getFieldsForCollection(props.collection);
	return new Set(fields.map(f => f.field));
}

// Helper function to convert string values to appropriate types based on field schema
function convertFieldValue(fieldName: string, value: any): any {
	if (value === null || value === undefined) return value;

	const field = fieldsStore.getField(props.collection, fieldName);
	if (!field) return value;

	// If value is already the right type, return as-is
	if (typeof value !== 'string') return value;

	// Convert based on field type
	switch (field.type) {
		case 'integer':
		case 'bigInteger':
			const intVal = parseInt(value, 10);
			return isNaN(intVal) ? value : intVal;

		case 'float':
		case 'decimal':
			const floatVal = parseFloat(value);
			return isNaN(floatVal) ? value : floatVal;

		case 'boolean':
			return value === 'true' || value === '1' || value === 'yes';

		case 'json':
			try {
				return JSON.parse(value);
			} catch {
				return value;
			}

		case 'csv':
			// Convert comma-separated string to array
			return value.split(',').map(v => v.trim());

		default:
			return value;
	}
}

// Function to apply prefill data to the form
function applyPrefillData(prefillData: Record<string, any>, source: 'query' | 'postMessage' = 'query') {
	const validFields = getValidFieldNames();
	const appliedFields: string[] = [];

	for (const [field, value] of Object.entries(prefillData)) {
		// Skip invalid fields
		if (!validFields.has(field)) {
			console.warn(`[Embeddable Forms] Ignoring invalid field for prefill: ${field}`);
			continue;
		}

		// Convert value to appropriate type
		const convertedValue = convertFieldValue(field, value);

		// Apply to form data
		formData.value[field] = convertedValue;
		appliedFields.push(field);
	}

	if (appliedFields.length > 0) {
		console.log(`[Embeddable Forms] Applied prefill from ${source}:`, appliedFields);

		// Notify parent of prefill applied
		sendMessageToParent('prefill-applied', {
			source,
			fields: appliedFields
		});
	}
}

// Function to parse query parameters for prefill
function parsePrefillFromQuery(): Record<string, any> {
	const prefillData: Record<string, any> = {};
	const currentRoute = route.value;

	// Check redirectedFrom first (when route is registered after initial navigation)
	// then fall back to current route query
	let query = currentRoute?.query;

	if (!query || Object.keys(query).length === 0) {
		if (currentRoute?.redirectedFrom?.query) {
			query = currentRoute.redirectedFrom.query;
		}
	}

	if (!query || Object.keys(query).length === 0) {
		return prefillData;
	}

	// Support both prefill[field]=value and prefill.field=value formats
	for (const [key, value] of Object.entries(query)) {
		// Handle prefill[field] format
		const bracketMatch = key.match(/^prefill\[(.+)\]$/);
		if (bracketMatch) {
			prefillData[bracketMatch[1]] = value;
			continue;
		}

		// Handle prefill.field format
		if (key.startsWith('prefill.')) {
			const fieldName = key.substring('prefill.'.length);
			prefillData[fieldName] = value;
			continue;
		}
	}

	return prefillData;
}

// Listen for prefill messages from parent
function setupPrefillListener() {
	window.addEventListener('message', (event) => {
		// Basic security check
		if (!event.data || typeof event.data !== 'object') return;

		if (event.data.type === 'directus-form-prefill') {
			const prefillData = event.data.data || {};
			applyPrefillData(prefillData, 'postMessage');
		}
	});
}

async function submitForm() {
	try {
		// Transition to submitting state
		formState.value = 'submitting';

		// Create item in the collection
		await sdk.request(createItem(props.collection, formData.value))

		// Transition to submitted state
		formState.value = 'submitted';

		// Notify parent of successful submission
		sendMessageToParent('submitted', {
			data: JSON.parse(JSON.stringify(formData.value))
		});

		// Update iframe height after submission
		await nextTick();
		updateIframeHeight();
	} catch (error: any) {
		validationErrors.value = error?.errors?.map(e => e.extensions)
		console.error('Error submitting form:', error);
		// Return to idle state on error
		formState.value = 'idle';

		// Notify parent of error
		sendMessageToParent('error', {
			error: { message: error.messageCallback, errors: error.errors }
		});
	}
}

function resetForm() {
	formData.value = {};
	validationErrors.value = [];
	formState.value = 'idle';

	// Update iframe height after reset
	nextTick(() => {
		updateIframeHeight();
	});
}

onMounted(async () => {
	// Set up prefill listener early
	setupPrefillListener();

	// TODO: Figure out how to populate permissions
	permissionsStore.permissions = {}
	await collectionsStore.hydrate()
	await fieldsStore.hydrate()
	await relationsStore.hydrate()

	// Apply query parameter prefills after stores are loaded
	const queryPrefills = parsePrefillFromQuery();
	if (Object.keys(queryPrefills).length > 0) {
		applyPrefillData(queryPrefills, 'query');
	}

	// Transition from loading to idle state
	formState.value = 'idle';

	// Notify parent that form is ready
	sendMessageToParent('ready', {
		collection: props.collection
	});

	await nextTick()
	// Set up resize observer to track height changes
	if (isIframe.value && formWrapper.value) {
		const resizeObserver = new ResizeObserver(() => {
			updateIframeHeight();
		});

		resizeObserver.observe(formWrapper.value);

		// Initial height update
		nextTick(() => {
			updateIframeHeight();
		});
	}
});

// Watch for form state changes to update iframe height
watch(formState, async () => {
	await nextTick();
	updateIframeHeight();
});
</script>

<style scoped>
.embeddable-form-container {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	width: 100%;
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;
	min-height: 400px;
}

.form-actions {
	margin-top: 24px;
	display: flex;
	justify-content: flex-end;
}

.reset-button {
	margin-top: 16px;
}

.success h2 {
	margin: 0 0 8px 0;
	font-size: 24px;
}

.success p {
	margin: 0;
	font-size: 16px;
}

/* Global styles for iframe embedding */
:global(body) {
	margin: 0;
	padding: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	background-color: transparent !important;
}

/* Remove with-fill capability */
.v-form.with-fill {
	grid-template-columns: [start] minmax(0,1fr) [half] minmax(0,1fr) [full];
}
</style>
