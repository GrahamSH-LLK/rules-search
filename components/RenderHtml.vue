<script lang="ts">
export default {
  props: ["html"],
  async setup(props) {
   const Tooltip = resolveComponent("Tooltip");
    let html = props.html;

    const parser = new (window?.DOMParser ||
      (new (await import("jsdom")).JSDOM()).window.DOMParser)();
    const doc = parser.parseFromString(html, "text/html");

    function processNode(node) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        return text ? () => text : null;
      }

      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        
        const props = {};

        Array.from(node.attributes).forEach((attr) => {
          props[attr.name] = attr.value;
        });
        if (tag == 'body') {
         props['class'] = 'prose max-w-full dark:prose-invert overflow-x-auto px-4'
        }
        
        const children = Array.from(node.childNodes)
          .map(processNode)
          .filter(Boolean);
        return () =>
          h(
            tag == 'tooltip' ? Tooltip :tag == 'body' ? 'div': tag ,
            props,
            children.map((child) => child())
          );
      }

      return null;
    }

    return processNode(doc.body);
  },
};
</script>
