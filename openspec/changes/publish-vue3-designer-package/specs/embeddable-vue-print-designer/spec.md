## ADDED Requirements

### Requirement: Vue plugin and component entrypoints
The package SHALL expose a default Vue plugin and a named `PrintTemplateStudio` component. Installing the plugin SHALL make Element Plus, package icons, and the component available to the host application.

#### Scenario: Host registers the package
- **WHEN** a Vue 3 host calls `app.use(PrintTemplateStudioPlugin)` and imports the package stylesheet
- **THEN** it can render `<PrintTemplateStudio>` without separately configuring Pinia, Element Plus, or package icons

### Requirement: Controlled template and runtime data
The component SHALL support `v-model:template` and `v-model:runtime-data`, normalize template input through TemplateDocument v1, emit editor changes, and expose load/read/runtime-data/print methods through its component ref.

#### Scenario: Host supplies a template and runtime JSON
- **WHEN** the host binds a template and runtime data to the component
- **THEN** the editor renders the template, preview and printing use the supplied JSON, and user edits emit the normalized template without an update loop

### Requirement: Isolated instances and persistence
Each mounted component SHALL use isolated editor state. When no repository is supplied, the component SHALL derive local template and preset storage keys from `storage-key`; hosts mounting multiple persistent instances MUST provide unique keys.

#### Scenario: Two designers share a host application
- **WHEN** two components mount with different storage keys
- **THEN** changing one designer's selection, history, runtime data, templates, or presets does not affect the other designer

### Requirement: Repository and error boundary
The component SHALL accept a repository implementing template list/read/save/delete operations, tolerate an unavailable optional clear operation, and emit repository or print failures through an `error` event while retaining in-component feedback.

#### Scenario: Repository save fails
- **WHEN** the user saves through a repository that rejects the request
- **THEN** the component remains editable and emits an error payload identifying the repository operation
