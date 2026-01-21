import { Comment, Fragment, Text, type Slot, type VNode } from "vue";

/**
 * Returns true if the passed VNodes contain something renderable.
 * Ignores Vue's comment nodes and whitespace-only text nodes.
 *
 * Useful for `v-if` checks around slots.
 */
export function hasRenderableVNodes(nodes: VNode[]): boolean {
  const isRenderable = (n: VNode): boolean => {
    if (!n || n.type === Comment) return false;

    if (n.type === Text) {
      return String(n.children ?? "").trim().length > 0;
    }

    if (n.type === Fragment) {
      const children = Array.isArray(n.children) ? (n.children as VNode[]) : [];
      return children.some(isRenderable);
    }

    return true;
  };

  return nodes.some(isRenderable);
}

/**
 * Convenience wrapper that accepts a Vue slot function (e.g. `slots.media`) directly.
 */
export function hasRenderableSlot(slot?: Slot): boolean {
  return hasRenderableVNodes(slot?.() ?? []);
}
