"use client";

import { Breadcrumbs, Anchor } from "@mantine/core";
import { TreeNode } from "@repo/types";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { Route } from "next";

type PageType = "categories" | "brands" | "tags";

interface StoreBreadcrumbProps {
  treeNode: TreeNode;
  pageType: PageType;
}

const PAGE_TYPE_CONFIG = {
  categories: {
    baseUrl: "/categories",
    label: "Kategoriler",
  },
  brands: {
    baseUrl: "/brands",
    label: "Markalar",
  },
  tags: {
    baseUrl: "/tags",
    label: "Etiketler",
  },
} as const;

const StoreBreadcrumb = ({ treeNode, pageType }: StoreBreadcrumbProps) => {
  const config = PAGE_TYPE_CONFIG[pageType];

  const getParentChain = (node: TreeNode): TreeNode[] => {
    const chain: TreeNode[] = [];
    let current: TreeNode | undefined = node;

    while (current) {
      chain.unshift(current);
      current = current.parent;
    }

    return chain;
  };

  const parentChain = getParentChain(treeNode);

  return (
    <Breadcrumbs
      separator={<IconChevronRight size={16} />}
      separatorMargin="xs"
    >
      <Anchor component={Link} href="/" size="sm" c="dimmed">
        Ana Sayfa
      </Anchor>

      {parentChain.map((node, index) => {
        const isLast = index === parentChain.length - 1;

        return (
          <Anchor
            key={node.id}
            component={Link}
            href={isLast ? "#" : (`${config.baseUrl}/${node.slug}` as Route)}
            size="sm"
            c={isLast ? "inherit" : "dimmed"}
            fw={isLast ? 600 : 400}
            style={isLast ? { pointerEvents: "none" } : undefined}
          >
            {node.name}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
};

export default StoreBreadcrumb;
