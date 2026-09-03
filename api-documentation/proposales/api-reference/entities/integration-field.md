> ## Documentation Index
> Fetch the complete documentation index at: https://docs.proposales.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Integration Field

Proposales uses a simple JSON based schema for defining UI layouts. These
allow the user to customize parts of the UI.
Currently customization is possible in the following places:
[integration config](/webhooks/integration-config-schema),
[proposal content details](/webhooks/content-details),
[proposal editor widget](/webhooks/editor-widget), and
[proposal data widget](/webhooks/data-widget).

## Icons

Some of the integration fields can be customized with an icon. The icon is
specified by name. Currently the following icons are supported:

```typescript theme={null}
type IconName =
  | 'person'
  | 'attendees' // Alias for person
  | 'accommodation'
  | 'chevron-right'
  | 'add'
```

## Select

The select field creates a select input.

<img height="64" className="h-8" noZoom src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/Select.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=51959a55183f33f16ac87342786144f8" data-path="images/integration-fields/Select.png" />

```typescript Select Field theme={null}
type IntegrationSelectField = {
  type: 'select';
  id: string; // the value will be stored in data using this key
  helpLabel?: string; // this text will be displayed underneath the field
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: {
    name: string;
    value?: string;
  }[];
};
```

## Text Input

The text input can be of various HTML text input types, and can be customized
with optional [icons](#icons).

<img height="32" className="h-8" noZoom alt="Text input" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/Input_text.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=ee5378ed4856144648f866ea87433bb9" data-path="images/integration-fields/Input_text.png" />

<img height="64" className="h-16" noZoom alt="Input with help label" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/Input_helptext.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=803a5a16e6d0a6170d60774e280e406e" data-path="images/integration-fields/Input_helptext.png" />

```typescript Text Field theme={null}
type IntegrationTextField = {
  type: 'text' | 'url' | 'tel' | 'email' | 'password';
  id: string; // the value will be stored in data using this key
  helpLabel?: string; // this text will be displayed underneath the field
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  icon?: IconName;
};
```

## Number Input

This works the same as text fields, but with numeric values.

<img height="64" className="h-8" noZoom alt="Input with icon" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/Input_number.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=92a4512fd9fefc77551a822d5fd5e532" data-path="images/integration-fields/Input_number.png" />

<img height="64" className="h-8" noZoom alt="Input with icon" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/Input_icon.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=b8b01307661c5d3a703cac5fbbf75e10" data-path="images/integration-fields/Input_icon.png" />

```typescript Number Field theme={null}
type IntegrationNumberField = {
  type: 'number';
  defaultValue?: number | string;
  id: string; // the value will be stored in data using this key
  helpLabel?: string; // this text will be displayed underneath the field
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  icon?: IconName;
  min?: number;
  max?: number;
  integerOnly?: boolean; // restricts the value to be an integer within the range defined by min (default 0) and max
};
```

## Hidden field

Hidden fields are useful for setting properties internally without
showing them them to the user. For example default values in a integration config.
These are not visible in the UI, and are set to the default value specified.

```typescript Hidden field theme={null}
type IntegrationHiddenField = {
  type: 'hidden';
  defaultValue?: string | number | boolean;
};
```

## Switch

A toggleable switch for boolean values.

<img height="64" className="h-8" noZoom alt="Input with icon" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/toggle.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=139d869a61bfc2bd563c73b0a77cc6a9" data-path="images/integration-fields/toggle.png" />

```typescript Switch Field theme={null}
type IntegrationSwitchField = {
  type: 'switch';
  defaultValue?: boolean;
  id: string; // the value will be stored in data using this key
  helpLabel?: string; // this text will be displayed underneath the field
  readOnly?: boolean;
};
```

## Link button

A button linking to an external page.

<img height="64" className="h-8" noZoom alt="Link button" src="https://mintcdn.com/proposalesab/-5otOw2eXOA6LlgK/images/integration-fields/button_external.png?fit=max&auto=format&n=-5otOw2eXOA6LlgK&q=85&s=7151966c27e0e057520d8c801b27389f" data-path="images/integration-fields/button_external.png" />

```typescript Link button theme={null}
type LinkButtonField = {
  type: 'linkButton';
  label: string;
  href: string;
  icon: IconName;
};
```

## Divider

A horizontal divider with an optional label

```typescript Divider theme={null}
type DividerField = {
  type: 'divider';
  text?: string;
};
```

## Header

A header for dividing fields into sections.

```typescript Header theme={null}
type HeaderField = {
  type: 'header';
  text: string;
};
```

## Text

A section of text, with optional markdown support.

```typescript Text body theme={null}
type TextBodyField = {
  type: 'textBody',
  text: string;
  markdown?: boolean;
}
```
