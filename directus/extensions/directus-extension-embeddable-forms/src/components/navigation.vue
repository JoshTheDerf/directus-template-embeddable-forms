<template>
	<v-list nav>
		<v-list-item to="/embeddable-forms" exact>
			<v-list-item-icon><v-icon name="grid_3x3" /></v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="'Overview'" />
			</v-list-item-content>
		</v-list-item>

		<v-list-item to="/embeddable-forms/setup">
			<v-list-item-icon><v-icon name="admin_panel_settings" /></v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="'Setup & Permissions'" />
			</v-list-item-content>
		</v-list-item>

		<v-list-item to="/embeddable-forms/embedding">
			<v-list-item-icon><v-icon name="code" /></v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="'Embedding & Prefill'" />
			</v-list-item-content>
		</v-list-item>
	</v-list>
</template>

<script setup lang="ts">
// Navigation component for Embeddable Forms module
// Follows Directus standard navigation pattern
</script>
