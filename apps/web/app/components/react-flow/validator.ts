import { Edge, Node } from "@xyflow/react";

export interface ValidationConfig {
  startNodeType: string;
  resultNodeType: string;
  conditionNodeTypes: string[];
  getNodeLabel: (node: Node) => string;
  requireNoPath?: boolean | ((node: Node) => boolean);
}

export const validateFlowTopology = (
  nodes: Node[],
  edges: Edge[],
  config: ValidationConfig
): string[] => {
  const errors: string[] = [];
  const {
    startNodeType,
    resultNodeType,
    conditionNodeTypes,
    getNodeLabel,
    requireNoPath = false,
  } = config;

  const startNode = nodes.find((n) => n.type === startNodeType);
  if (!startNode) errors.push("Başlangıç düğümü eksik.");

  const resultNodes = nodes.filter((n) => n.type === resultNodeType);
  if (resultNodes.length === 0)
    errors.push("En az bir Sonuç düğümü eklemelisiniz.");

  nodes.forEach((node) => {
    if (node.type === startNodeType) {
      const hasOutgoing = edges.some((e) => e.source === node.id);
      if (!hasOutgoing)
        errors.push("Başlangıç düğümü hiçbir yere bağlanmamış.");
    } else if (node.type && conditionNodeTypes.includes(node.type)) {
      const hasIncoming = edges.some((e) => e.target === node.id);
      if (!hasIncoming) {
        errors.push(`"${getNodeLabel(node)}" düğümünün girişi bağlı değil.`);
      }

      const hasYes = edges.some(
        (e) => e.source === node.id && e.sourceHandle === "yes"
      );
      const hasNo = edges.some(
        (e) => e.source === node.id && e.sourceHandle === "no"
      );

      if (!hasYes)
        errors.push(`"${getNodeLabel(node)}" için 'EVET' yolu eksik.`);

      let isNoRequired = true;

      if (typeof requireNoPath === "function") {
        isNoRequired = requireNoPath(node);
      } else {
        isNoRequired = requireNoPath;
      }

      if (isNoRequired && !hasNo) {
        errors.push(`"${getNodeLabel(node)}" için 'HAYIR' yolu eksik.`);
      }
    } else if (node.type === resultNodeType) {
      const hasIncoming = edges.some((e) => e.target === node.id);
      if (!hasIncoming) {
        errors.push(`"${getNodeLabel(node)}" sonucuna ulaşan bir yol yok.`);
      }
    }
  });

  return errors;
};
