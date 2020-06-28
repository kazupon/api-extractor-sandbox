## Date Model Spec

```json5
{
  packages: [{
    name: "vue-i18n",
    entries: {
      // defined variables
      variables: [{
        type: "Variable",
        identifier: "VERSION",
        summary: [
          { type: "text", value: "vue-i18n library version" }
        ],
        signature: "VERSION = \"1.0.0\"",
        remarks: [
          { type: "text", value: "about versioning format, see the" },
          { type: "link", value: "semver", url: "https://semver.org/" }
        ],
        examples: [
          [
            { type: "text", value: "app version:" },
            { type: "blank", value: "\n" },
            { type: "code", value: "x.y.z" }
          ]
        ]
      }, {
        ...
      }],
      // defined enumrations
      enumrations: [{
        type: "Enumration",
        identifier: "ErrorCodes",
        summary: [
          { type: "text", value: "error codes of application" }
        ],
        signature: "export declare enum ErrorCodes",
        members: [
          { name: "Success", value: "0", description: "Success" },
          { ... }
        ],
        remarks: [
          { ... }
        ],
        examples: [
          [
            { type: "text", value: "the bellow of basic usage:" },
            { type: "code", value: "let code = ErrorCodes.Success\ncode = foo('...')\nif (code === ErrorCodes.Fail) { ... }" }
          ]
        ]
      }, {
        ...
      }],
      // defined functions
      functions: [{
        type: "Function",
        identifier: "add",
        sumarry: [
          { type: "text", value: "add fucntion" }
        ],
        signature: "export declare function add(a: number, b: number): number;",
        parameters: [
          { name: "a", type: "number", description: "target a" },
          { ... }
        ],
        returns: [
          { type: "text", value: "result as" },
          { type: "code", value: "a" },
          { type: "text", value: " + " },
          { type: "code", value: "b" }
        ],
        throws: [
          { type: "linke": value "ArgumentError", url: "./enumrations.md#ArgumentError" },
          { type: "text": value ": invalid argument" }
        ],
        remarks: [
          { ... }
        ],
        examples: [
          [ ... ]
        ]
      }],
      // defined interfaces
      interfaces: [{
        type: "Interface",
        identifier: "Calcuratable",
        sumarry: [
          { type: "text", value: "Calculatable interface" }
        ],
        signature: "export interface Calculatable",
        methods: [
          {
            type: "Method",
            identifier: "add",
            sumarry: [
              { ... }
            ],
            signature: "add(a: number, b: number): number;",
            parameters: [
              { ... }
            ],
            returns: [
              { ... }
            ],
            throws: undefined,
            remarks: undefined,
            examples: undefind
          },
          { ... },
        ],
        properties: [
          {
            type: "Property",
            identifier: "PI",
            sumarry: [
              { ... }
            ],
            signature: "PI: number;",
            remarks: undefined,
            examples: undefind 
          }
        ]
      }, {
        ...
      }],
      // defined classes
      classes: [{
        type: "Class",
        identifier: "Calcurator",
        sumarry: [
          { type: "text", value: "Calcurator" }
        ],
        signature: "export declare class Calculator implements Calculatable",
        methods: [
          {
            type: "Method",
            identifier: "add",
            sumarry: [
              { ... }
            ],
            signature: "add(a: number, b: number): number;",
            parameters: [
              { ... }
            ],
            returns: [
              { ... }
            ]
          },
          { ... },
        ],
        properties: [
          {
            type: "Property",
            identifier: "PI",
            sumarry: [
              { ... }
            ],
            signature: "PI: number;",
            remarks: [
              { ... }
            ]
          }
        ]
      }, {
        ...
      }],
      // defined type aliases
      typeAliases: [{
        type: "typeAlias",
        identifier: "Locale",
        summary: [
          { ... }
        ],
        signature: "export declare type FallbackLocale = Locale | Locale[] | { [locale in string]: Locale[]; } | false;",
        remarks: [
          { ... }
        ]
      }, {
        ...
      }]
    }
  }, {
    // ...
  }]
}
```