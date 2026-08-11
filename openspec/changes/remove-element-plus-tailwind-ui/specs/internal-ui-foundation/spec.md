## ADDED Requirements

### Requirement: owned editor primitives
The editor SHALL render interactive controls through project-owned primitives instead of Element Plus components.

#### Scenario: editor shell renders
- **WHEN** a user opens the designer
- **THEN** the header, sidebars, panels, and dialogs SHALL render with project-owned controls

#### Scenario: no Element Plus controls in production runtime
- **WHEN** the package is consumed in a host application
- **THEN** the visible editor controls SHALL not require Element Plus components to be installed

### Requirement: Tailwind-based editor styling
The editor shell and owned primitives SHALL use project-owned Tailwind-based styling that is shipped with the package.

#### Scenario: package CSS is sufficient
- **WHEN** a consumer imports the package stylesheet
- **THEN** the editor SHALL render with its intended spacing, typography, and layout without host Tailwind configuration

#### Scenario: styling remains internal
- **WHEN** the editor is loaded in a different host application
- **THEN** the editor SHALL keep its own visual styling and SHALL NOT depend on host page utility classes

### Requirement: project-owned icon rendering
The editor SHALL use project-owned icon components or SVG assets for toolbar, action, and tab icons.

#### Scenario: toolbar actions render
- **WHEN** the editor renders action buttons and tabs
- **THEN** their icons SHALL come from the internal icon system

#### Scenario: no icon package dependency
- **WHEN** the package is built for release
- **THEN** icon rendering SHALL NOT require `@element-plus/icons-vue`

### Requirement: workflow parity for owned controls
Owned primitives SHALL preserve the editor workflows currently provided by the third-party controls, including focus handling, confirmation, selection, and form input behavior.

#### Scenario: destructive confirmation
- **WHEN** a user confirms deletion, clearing, or replacement actions
- **THEN** the owned dialog or confirmation primitive SHALL complete the same workflow outcome as before

#### Scenario: keyboard interaction
- **WHEN** a user navigates the editor using the keyboard
- **THEN** buttons, inputs, tabs, and toggles SHALL remain operable
