interface Example {
    label?: string;
    template: any;
    data: any;
}
type Examples = Record<string, Example>;
declare const examples: Examples;
declare let currentTemplateFormat: 'json' | 'yaml';
declare const templateEditor: HTMLTextAreaElement;
declare const dataEditor: HTMLTextAreaElement;
declare const htmlOutput: HTMLElement;
declare const errorDisplay: HTMLElement;
declare const indentType: HTMLSelectElement;
declare const indentSize: HTMLInputElement;
declare const templateFormatSelect: HTMLSelectElement;
declare function jsonToYaml(obj: any): string;
declare function yamlToJson(yamlStr: string): any;
declare function switchTemplateFormat(): void;
declare function updateOutput(): void;
declare function escapeHtml(text: string): string;
declare function loadExample(exampleId: string): void;
declare function populateExampleDropdown(): void;
declare function loadExampleFromDropdown(): void;
