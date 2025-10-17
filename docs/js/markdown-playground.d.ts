interface MarkdownExample {
    label?: string;
    markdown: string;
    data: any;
}
type MarkdownExamples = Record<string, MarkdownExample>;
declare const TREEBARK_BLOCK_REGEX: RegExp;
declare const examples: MarkdownExamples;
declare let currentMarkdownFormat: 'json' | 'yaml';
declare const markdownEditor: HTMLTextAreaElement;
declare const dataEditor: HTMLTextAreaElement;
declare const htmlOutput: HTMLElement;
declare const errorDisplay: HTMLElement;
declare const indentType: HTMLSelectElement;
declare const indentSize: HTMLInputElement;
declare const markdownFormatSelect: HTMLSelectElement;
declare function jsonToYaml(obj: any): string;
declare function yamlToJson(yamlStr: string): any;
declare function switchMarkdownFormat(): void;
declare function updateOutput(): void;
declare function loadExample(exampleId: string): void;
declare function populateExampleDropdown(): void;
declare function loadExampleFromDropdown(): void;
