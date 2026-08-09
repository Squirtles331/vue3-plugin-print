## ADDED Requirements

### Requirement: Duplicate selected elements deterministically
The system SHALL provide a duplicate command for one or more selected unlocked elements on the current page. It MUST create new element IDs, retain normalized printable properties, apply a visible deterministic offset in document millimetres, and record one undoable history transaction.

#### Scenario: Duplicate a multi-selection
- **WHEN** a user duplicates multiple unlocked selected elements
- **THEN** the system creates one new copy per source element with new IDs, preserves their relative geometry, and allows the whole operation to be undone and redone as one action

### Requirement: Align and distribute selected elements
The system SHALL provide left, horizontal-centre, right, top, vertical-centre, bottom, horizontal-distribution, and vertical-distribution commands for two or more selected unlocked elements. Commands MUST calculate in document coordinates, preserve the appropriate dimensions, and use selection bounds or the active page bounds as the command requires.

#### Scenario: Align selected elements
- **WHEN** a user aligns three selected elements to the left
- **THEN** their canonical x positions match the left selection bound and their widths and y positions remain unchanged

#### Scenario: Distribute selected elements
- **WHEN** a user distributes three or more selected elements horizontally
- **THEN** the first and last elements retain their horizontal bounds and intermediate gaps are equal within the document rounding precision

### Requirement: Respect element protection and page boundaries
The system SHALL exclude locked elements from layout mutations, provide feedback when no eligible selection remains, and prevent commands from producing non-finite geometry. Where a command would overflow the printable page area, it MUST follow one documented policy consistently: clamp with feedback or retain overflow when overflow is explicitly allowed by document settings.

#### Scenario: Align a selection containing a locked element
- **WHEN** a user runs an alignment command on selected elements including a locked element
- **THEN** the locked element remains unchanged and the result identifies the excluded element

### Requirement: Persist layout results without viewport state
The system SHALL serialize layout command results as element geometry and order only. Zoom, pan, guides, selection handles, and other editor-view state MUST NOT affect or appear in saved, imported, previewed, or printed template data.

#### Scenario: Run commands at different zoom levels
- **WHEN** the same layout command is run against equivalent selections at different editor zoom levels
- **THEN** the resulting serialized element geometry is identical within document rounding precision

