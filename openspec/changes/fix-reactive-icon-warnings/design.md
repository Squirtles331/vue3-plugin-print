# Design

Icon constructors are immutable Vue component definitions, not application state. The palette will mark each icon as raw when defining the palette metadata so that a consuming `ref`, `computed`, Pinia store, or component prop cannot proxy it. The collection itself may remain reactive because labels and availability are ordinary metadata.

This keeps the repair local to the palette boundary and avoids shallow-reactivity requirements at every consumer.
