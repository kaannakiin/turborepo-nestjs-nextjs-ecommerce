import { LogicalOperator } from "@repo/database/client";
import { z } from "zod";
import { ConditionOperator, TimeUnit } from "../common";
export const ConditionOperatorSchema = z.enum(ConditionOperator);
export const LogicalOperatorSchema = z.enum(LogicalOperator);
export const TimeUnitSchema = z.enum(TimeUnit);

export const NumericValueSchema = z.number();

export const RangeValueSchema = z
  .object({
    min: z.number(),
    max: z.number(),
  })
  .refine((data) => data.min <= data.max, {
    message: "Min değer max değerden büyük olamaz",
  });

export const DateValueSchema = z.iso.datetime({
  message: "Geçerli bir tarih formatı giriniz",
});

export const DateRangeValueSchema = z
  .object({
    from: DateValueSchema,
    to: DateValueSchema,
  })
  .refine((data) => new Date(data.from) <= new Date(data.to), {
    message: "Başlangıç tarihi bitiş tarihinden sonra olamaz",
  });

export const DurationValueSchema = z.object({
  amount: z
    .number()
    .int()
    .positive({ message: "Süre pozitif bir sayı olmalı" }),
  unit: TimeUnitSchema,
});

export const StringArraySchema = z
  .array(z.string())
  .min(1, "En az bir değer seçilmeli");

export const DecisionNodeType = {
  START: "start",
  CONDITION: "condition",
  CONDITION_GROUP: "conditionGroup",
  RESULT: "result",
} as const;

export type DecisionNodeTypeValue =
  (typeof DecisionNodeType)[keyof typeof DecisionNodeType];

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Position = z.infer<typeof PositionSchema>;

export const createConditionNodeSchema = <T extends z.ZodTypeAny>(
  conditionSchema: T
) =>
  z.object({
    id: z.string(),
    type: z.literal(DecisionNodeType.CONDITION),
    position: PositionSchema,
    data: z.object({
      condition: conditionSchema,
      label: z.string().optional(),
    }),
  });

export const createConditionGroupNodeSchema = <T extends z.ZodTypeAny>(
  conditionSchema: T
) =>
  z.object({
    id: z.string(),
    type: z.literal(DecisionNodeType.CONDITION_GROUP),
    position: PositionSchema,
    data: z.object({
      operator: LogicalOperatorSchema,
      conditions: z.array(conditionSchema).min(1, "En az bir koşul gerekli"),
      label: z.string().optional(),
    }),
  });

export const createDefaultDecisionTreeBase = (
  startNodeLabel: string = "Başlangıç"
) => ({
  nodes: [
    {
      id: "start",
      type: DecisionNodeType.START,
      position: { x: 250, y: 50 },
      data: { label: startNodeLabel },
    },
  ],
  edges: [],
});
export const BaseStartNodeSchema = z.object({
  id: z.string(),
  type: z.literal(DecisionNodeType.START),
  position: PositionSchema,
  data: z.object({
    label: z.string().min(1, "Başlık gerekli"),
  }),
});

export type BaseStartNode = z.infer<typeof BaseStartNodeSchema>;

export const createResultNodeSchema = <T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>
) =>
  z.object({
    id: z.string(),
    type: z.literal(DecisionNodeType.RESULT),
    position: PositionSchema,
    data: dataSchema,
  });

export const EdgeType = {
  DEFAULT: "default",
  YES: "yes",
  NO: "no",
} as const;

export type EdgeTypeValue = (typeof EdgeType)[keyof typeof EdgeType];

export const DecisionTreeEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z
    .enum(["default", "yes", "no", "output"])
    .nullable()
    .optional(),
  data: z
    .object({
      type: z.enum(["default", "yes", "no"]).optional(),
    })
    .optional(),
});

export type DecisionTreeEdge = z.infer<typeof DecisionTreeEdgeSchema>;

export const createNodeId = (type: DecisionNodeTypeValue): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createEdge = (
  source: string,
  target: string,
  type: EdgeTypeValue = EdgeType.DEFAULT
): DecisionTreeEdge => ({
  id: `edge-${source}-${target}-${Date.now()}`,
  source,
  target,
  sourceHandle: type === EdgeType.DEFAULT ? undefined : type,
  data: { type },
});

export const createDecisionTreeSchema = <TNode extends z.ZodTypeAny>(
  nodeSchema: TNode,
  options?: {
    minResultNodes?: number;
    customValidations?: Array<{
      validate: (data: {
        nodes: z.infer<TNode>[];
        edges: DecisionTreeEdge[];
      }) => boolean;
      message: string;
    }>;
  }
) => {
  const { minResultNodes = 1, customValidations = [] } = options ?? {};

  let schema = z
    .object({
      nodes: z.array(nodeSchema),
      edges: z.array(DecisionTreeEdgeSchema),
    })
    .refine(
      (data) => {
        const startNodes = data.nodes.filter(
          (n: any) => n.type === DecisionNodeType.START
        );
        return startNodes.length === 1;
      },
      { message: "Tam olarak bir başlangıç node'u gerekli" }
    )
    .refine(
      (data) => {
        const resultNodes = data.nodes.filter(
          (n: any) => n.type === DecisionNodeType.RESULT
        );
        return resultNodes.length >= minResultNodes;
      },
      { message: `En az ${minResultNodes} sonuç node'u gerekli` }
    )
    .refine(
      (data) => {
        const nodeIds = new Set(data.nodes.map((n: any) => n.id));
        return data.edges.every(
          (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
        );
      },
      {
        message:
          "Geçersiz edge bağlantısı: Var olmayan bir node'a bağlantı yapılmış.",
      }
    )
    .refine(
      (data) => {
        const targetNodeIds = new Set(data.edges.map((e) => e.target));

        const orphans = data.nodes.filter(
          (n: any) =>
            n.type !== DecisionNodeType.START && !targetNodeIds.has(n.id)
        );

        return orphans.length === 0;
      },
      {
        message:
          "Bağlantısı yapılmamış (boşta kalan) kutucuklar var. Lütfen tüm kutucukları birbirine bağlayın.",
      }
    );

  for (const { validate, message } of customValidations) {
    schema = schema.refine(validate as any, { message }) as any;
  }

  return schema;
};
export const isStartNode = <T extends { type: string }>(
  node: T
): node is T & { type: typeof DecisionNodeType.START } => {
  return node.type === DecisionNodeType.START;
};

export const isConditionNode = <T extends { type: string }>(
  node: T
): node is T & { type: typeof DecisionNodeType.CONDITION } => {
  return node.type === DecisionNodeType.CONDITION;
};

export const isConditionGroupNode = <T extends { type: string }>(
  node: T
): node is T & { type: typeof DecisionNodeType.CONDITION_GROUP } => {
  return node.type === DecisionNodeType.CONDITION_GROUP;
};

export const isResultNode = <T extends { type: string }>(
  node: T
): node is T & { type: typeof DecisionNodeType.RESULT } => {
  return node.type === DecisionNodeType.RESULT;
};
