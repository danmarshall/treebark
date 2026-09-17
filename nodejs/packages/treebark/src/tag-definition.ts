export type TagDefinition = {
  attrs?: readonly string[];
  parents?: readonly TagDefinition[];
  selfParent?: true;
  void?: true;
  special?: true;
};
