# Design

The template is corrected at the source of the scope error. Helper functions also become total functions: an absent field resolves to an empty key/error and does not mutate the error store. This protects the panel while computed schema sections change reactively.
