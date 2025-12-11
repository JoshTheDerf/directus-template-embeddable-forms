# Directus Extension: Embeddable Forms

> Create public, embeddable forms for any Directus collection with prefill support, iframe communication, and auto-resize.

A Directus module extension that transforms any collection into a public submission form that can be embedded in external websites, with full support for conditions, validations, and custom interfaces. Perfect for contact forms, newsletter signups, event registrations, and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Prefilling Form Data](#prefilling-form-data)
  - [Iframe Communication Events](#iframe-communication-events)
- [How It Works](#how-it-works)
- [Permissions](#permissions)
- [Security Considerations](#security-considerations)
- [Development](#development)
- [Demo & Examples](#demo--examples)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Public Access**: Forms are accessible without authentication
- **Dynamic Form Generation**: Automatically generates form fields based on collection schema
- **Smart Field Mapping**: Maps Directus field types to appropriate input interfaces
- **Validation**: Respects required fields and validation rules
- **Success Feedback**: Shows success message after submission
- **Reset Functionality**: Allows users to submit multiple entries
- **Prefill Support**: Populate form fields via query parameters or postMessage API
- **Iframe Communication**: Bidirectional messaging between form and parent page
- **Auto-resize**: Forms automatically resize to fit content when embedded

## Installation

### From npm (Recommended)

```bash
npm install directus-extension-embeddable-forms
```

Then restart your Directus instance.

### Manual Installation

1. Copy this extension to your Directus extensions folder:
   ```bash
   cp -r directus-extension-embeddable-forms /path/to/directus/extensions/
   ```

2. Install dependencies:
   ```bash
   cd /path/to/directus/extensions/directus-extension-embeddable-forms
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Restart your Directus instance

## Usage

### Basic Usage

Access any collection form using the following URL pattern:

```
https://your-directus-instance.com/admin/forms/COLLECTION_NAME
```

#### Example

For a `contact_requests` collection:

```html
<iframe src="https://your-directus-instance.com/admin/forms/contact_requests"></iframe>
```

### Prefilling Form Data

The extension supports two methods for prefilling form fields: query parameters and postMessage API.

#### Method 1: Query Parameters

Prefill fields by adding query parameters to the iframe URL. Supports two formats:

**Bracket Notation:**
```html
<iframe src="https://your-directus.com/admin/forms/newsletter_signups?prefill[email]=user@example.com&prefill[source]=homepage"></iframe>
```

**Dot Notation:**
```html
<iframe src="https://your-directus.com/admin/forms/newsletter_signups?prefill.email=user@example.com&prefill.source=homepage"></iframe>
```

**Use Cases:**
- Simple prefills (email, name, referral codes)
- Shareable URLs with prefilled data
- Static embeds without JavaScript
- Marketing attribution (UTM parameters)

**Limitations:**
- URL length limits (~2000 characters typically)
- All data visible in URL
- Not ideal for sensitive information

#### Method 2: PostMessage API

Send prefill data from the parent page after the form is ready:

```javascript
// Listen for the form ready event
window.addEventListener('message', (event) => {
  if (event.data.type === 'directus-form-ready') {
    const iframe = document.getElementById('my-form');

    // Send prefill data to the iframe
    iframe.contentWindow.postMessage({
      type: 'directus-form-prefill',
      data: {
        email: 'user@example.com',
        name: 'John Doe',
        source: 'referral',
        utm_campaign: 'spring_2024'
      }
    }, 'https://your-directus-instance.com');
  }
});
```

**Use Cases:**
- Complex nested objects
- Dynamic data based on user session
- Sensitive information (not in URL)
- Marketing attribution with analytics
- Authenticated user context

#### Method 3: Hybrid Approach

Combine both methods for maximum flexibility. PostMessage values override query parameters:

```html
<!-- Static data via query params -->
<iframe
  id="event-form"
  src="https://your-directus.com/admin/forms/event_registrations?prefill[event_id]=workshop-2024&prefill[ticket_type]=standard">
</iframe>

<script>
// Dynamic data via postMessage
window.addEventListener('message', (event) => {
  if (event.data.type === 'directus-form-ready') {
    const iframe = document.getElementById('event-form');
    iframe.contentWindow.postMessage({
      type: 'directus-form-prefill',
      data: {
        attendee_name: 'Jane Smith',
        attendee_email: 'jane@example.com',
        dietary_restrictions: 'Vegetarian'
      }
    }, 'https://your-directus-instance.com');
  }
});
</script>
```

### Type Conversion

Query parameter strings are automatically converted to appropriate field types:

- **Integers/Floats**: `"5"` → `5`, `"3.14"` → `3.14`
- **Booleans**: `"true"`, `"1"`, `"yes"` → `true`
- **JSON**: `"{\"key\":\"value\"}"` → `{key: "value"}`
- **CSV**: `"tag1,tag2,tag3"` → `["tag1", "tag2", "tag3"]`

PostMessage data is used as-is with proper types already applied.

### Iframe Communication Events

The form communicates with the parent page through postMessage events:

#### Events Sent by Form (child → parent):

| Event | When | Data |
|-------|------|------|
| `directus-form-ready` | Form is loaded and ready | `{ collection }` |
| `directus-form-resize` | Form height changes | `{ height }` |
| `directus-form-submitted` | Form successfully submitted | `{ data, collection }` |
| `directus-form-error` | Form submission failed | `{ error, collection }` |
| `directus-form-prefill-applied` | Prefill data was applied | `{ source, fields, collection }` |

#### Events Received by Form (parent → child):

| Event | Purpose | Data |
|-------|---------|------|
| `directus-form-prefill` | Prefill form fields | `{ field1: value1, field2: value2, ... }` |

**Complete Example:**

```javascript
const iframe = document.getElementById('my-form');

// Listen for all form events
window.addEventListener('message', (event) => {
  // Verify origin for security
  if (event.origin !== 'https://your-directus-instance.com') return;

  switch (event.data.type) {
    case 'directus-form-ready':
      console.log('Form ready for collection:', event.data.data.collection);
      // Send prefill data
      iframe.contentWindow.postMessage({
        type: 'directus-form-prefill',
        data: { email: 'user@example.com' }
      }, event.origin);
      break;

    case 'directus-form-resize':
      // Auto-resize iframe
      iframe.style.height = event.data.data.height + 'px';
      break;

    case 'directus-form-submitted':
      console.log('Form submitted successfully:', event.data.data.data);
      // Show thank you message, redirect, etc.
      break;

    case 'directus-form-error':
      console.error('Form error:', event.data.data.error);
      // Show error message to user
      break;

    case 'directus-form-prefill-applied':
      console.log('Prefilled fields:', event.data.data.fields);
      break;
  }
});
```

## How It Works

1. **Route Registration**: The extension registers a public route at `/forms/:collection`
2. **Schema Fetching**: When accessed, it fetches the collection's field schema
3. **Form Rendering**: Dynamically renders form fields based on the schema
4. **Prefill Processing**: Applies query parameters and listens for postMessage prefill data
5. **Field Filtering**: Automatically excludes system fields (id, dates, user tracking)
6. **Field Validation**: Only accepts prefill data for fields that exist in the collection
7. **Type Conversion**: Converts string values to appropriate field types
8. **Submission**: Creates a new item in the specified collection via the API
9. **Feedback**: Shows success or error messages and notifies parent page
10. **Auto-resize**: Continuously monitors and communicates height changes to parent

## Excluded Fields

The following fields are automatically excluded from forms:
- `id`
- `user_created`
- `user_updated`
- `date_created`
- `date_updated`
- `sort`
- Any field marked as `hidden` or `readonly`

## Field Type Mapping

The extension automatically maps Directus field types to appropriate interfaces:

- **string** → input
- **text** → input-multiline (or input-rich-text-md if specified)
- **integer/float/decimal** → input (numeric)
- **boolean** → boolean toggle
- **datetime/date/time** → datetime picker
- **json** → code editor
- **csv** → tags

## Security Considerations

### Field Validation

The extension validates all prefill data to ensure security:

1. **Field Existence**: Only fields that exist in the collection schema are accepted
2. **Type Safety**: Values are converted to appropriate types based on field definitions
3. **No System Fields**: System fields (id, user_created, etc.) cannot be prefilled
4. **Read-only Fields**: Fields marked as readonly are excluded from prefill

### Origin Verification

When implementing postMessage communication, always verify the origin:

```javascript
window.addEventListener('message', (event) => {
  // Verify the origin matches your Directus instance
  if (event.origin !== 'https://your-directus-instance.com') {
    console.warn('Ignoring message from unknown origin:', event.origin);
    return;
  }
  // Process the message
});
```

### Data Sanitization

- Query parameters are sanitized and type-checked before being applied
- Invalid field names are logged and ignored
- Malformed JSON in query parameters is caught and the original string is used

## Permissions

Since forms are public, ensure your Directus permissions allow public role to:
- **Create** items in the target collection
- **Read** field definitions (required for schema fetching)

**Important**: The public role should NOT have read access to items in the collection unless you want users to see existing submissions.

### Recommended Permission Setup

For a typical contact form, configure these permissions for the Public role:

1. **System Collections** (Read):
   - `directus_collections` - All Fields
   - `directus_fields` - All Fields
   - `directus_relations` - All Fields

2. **Target Collection** (e.g., `contact_requests`):
   - **Create** - All Fields
   - **Read** - Selected fields only, with impossible filter: `{ "_and": [{ "id": { "_null": true }}]}`

This allows the form to access schema information while preventing data exposure.

## Development

### Build for development with watch mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Link extension for development:
```bash
npm run link
```

## Requirements

- Directus ^11.0.0
- Node.js >=18.0.0

## Demo & Examples

Access the live demo at `/dirserve/index.html` for:
- Live working examples of all prefill methods
- Multiple real-world use cases
- Complete implementation patterns
- Marketing attribution examples
- Copy-paste ready code snippets

## Troubleshooting

### Prefill not working

1. **Check field names**: Ensure field names in prefill data match exactly with collection schema
2. **Check browser console**: Look for validation warnings about invalid fields
3. **Verify collection hydration**: Wait for `directus-form-ready` event before sending postMessage
4. **Check permissions**: Ensure public role can create items in the target collection

### Iframe height issues

The form automatically resizes, but ensure your iframe styling allows height changes:

```css
iframe {
  width: 100%;
  border: none;
  /* Don't set a fixed height */
}
```

### PostMessage not received

1. **Verify origin**: Check that the origin in postMessage matches your Directus URL
2. **Wait for ready event**: Only send prefill data after receiving `directus-form-ready`
3. **Check for errors**: Look in browser console for blocked messages

## License

MIT
