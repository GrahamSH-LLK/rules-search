<script lang="ts">
import { parse } from "dom-parse";

export default {
  props: ["html"],
  async setup(props) {
    const Tooltip = resolveComponent("Tooltip");
    let html = `<div class="prose max-w-full dark:prose-invert overflow-x-auto px-4">${props.html}</div>`;
    let doc;
    try {
      doc = parse(html);
    } catch (e) {
      console.error(e);
      return () => { 
         return h("p", "Failed to parse HTML");
      };
    }

    function processNode(node: Node): any {
      if (node.nodeType === 3) {
        const text = node.textContent;
        return text ? () => text : null;
      }

      if (node.nodeType == 1 || node instanceof Element) {
        const tag = node.tagName.toLowerCase();

        const props: Record<string, any> = {};

        Array.from(node.attributes).forEach((attr) => {
          props[attr.name] = attr.value;
        });

        const children = Array.from(node.childNodes)
          .map(processNode)
          .filter(Boolean);
        return () =>
          h(
            tag == "tooltip" ? Tooltip : tag,
            props,
            tag == "tooltip"
              ? { default: () => node.textContent }
              : children.map((child) => child())
          );
      }

      return null;
    }

    return processNode(doc.children[0]);
  },
};
</script>
