<template>
	<private-view title="Embeddable Forms">
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="dynamic_form" />
			</v-button>
		</template>

		<template #actions>
			<v-button v-tooltip.bottom="'View Live Demo'" rounded icon
				:href="`${baseUrl}/dirserve/index.html`" target="_blank">
				<v-icon name="open_in_new" />
			</v-button>
		</template>

		<template #navigation>
			<EmbeddableFormsNavigation />
		</template>

		<router-view />
	</private-view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EmbeddableFormsNavigation from './components/navigation.vue';

const baseUrl = computed(() => window.location.origin);
</script>

<style scoped>
.header-icon {
	--v-button-width: 44px;
	--v-button-height: 44px;
	--v-button-background-color: var(--theme--primary-background);
	--v-button-color: var(--theme--primary);
}
</style>
