import type { SubscriptionPlan } from "@/lib/subscription-runtime";
import { readFeatureLimit, type UsageFeature } from "@/lib/usage-runtime";

export type WorkspaceCapability = {
  id: string;
  label: string;
  detail: string;
  tone: "basic" | "standard" | "premium";
};

export type WorkspacePlanCapabilities = {
  plan: SubscriptionPlan;
  label: "Free" | "Plus" | "Pro";
  badge: string;
  summary: string;
  capabilities: WorkspaceCapability[];
};

const meteredCapabilityFeatures: Array<{
  id: string;
  label: string;
  feature: UsageFeature;
}> = [
  { id: "chat", label: "Chat with PDF", feature: "chat" },
  { id: "summary", label: "AI Summary", feature: "summary" },
  { id: "analyzer", label: "Document Analyzer", feature: "analyzer" },
];

const workspacePlanCopy: Record<
  SubscriptionPlan,
  Pick<WorkspacePlanCapabilities, "badge" | "summary">
> = {
  FREE: {
    badge: "Starter workspace",
    summary:
      "Basic document AI with local workspace records and daily usage limits.",
  },
  PRO: {
    badge: "Premium workspace",
    summary:
      "Premium document workspace status with high monthly AI limits and full local history.",
  },
};

export function getWorkspacePlanCapabilities(
  plan: SubscriptionPlan,
): WorkspacePlanCapabilities {
  const normalizedPlan = normalizePlan(plan);
  const meteredCapabilities = meteredCapabilityFeatures.map((item) => {
    const limit = readFeatureLimit(normalizedPlan, item.feature);
    return {
      id: item.id,
      label: item.label,
      detail: `${limit.limit.toLocaleString()} / ${limit.period}`,
      tone: capabilityTone(normalizedPlan),
    } satisfies WorkspaceCapability;
  });

  return {
    plan: normalizedPlan,
    label: getWorkspacePlanLabel(normalizedPlan),
    badge: workspacePlanCopy[normalizedPlan].badge,
    summary: workspacePlanCopy[normalizedPlan].summary,
    capabilities: [
      ...meteredCapabilities,
      {
        id: "history",
        label: "Saved workspace history",
        detail:
          normalizedPlan === "FREE"
            ? "Local browser records"
            : "Account-scoped local history",
        tone: capabilityTone(normalizedPlan),
      },
      {
        id: "knowledge",
        label: "Knowledge cards",
        detail:
          normalizedPlan === "PRO"
            ? "Premium review prompts"
            : "Core review prompts",
        tone: capabilityTone(normalizedPlan),
      },
      {
        id: "dashboard",
        label: "Workspace dashboard",
        detail:
          normalizedPlan === "PRO"
            ? "Premium plan and usage status"
            : "Plan and usage status",
        tone: capabilityTone(normalizedPlan),
      },
    ],
  };
}

export function getWorkspacePlanLabel(
  plan: SubscriptionPlan,
): WorkspacePlanCapabilities["label"] {
  if (plan === "PRO") {
    return "Pro";
  }

  return "Free";
}

export function getWorkspaceUpgradeMessage(plan: SubscriptionPlan) {
  if (plan === "PRO") {
    return "Pro workspace is active. Premium workspace capabilities are available.";
  }

  return "Upgrade to Pro for higher AI usage and a stronger workspace history experience.";
}

function normalizePlan(plan: SubscriptionPlan): SubscriptionPlan {
  if (plan === "PRO") {
    return plan;
  }

  return "FREE";
}

function capabilityTone(plan: SubscriptionPlan): WorkspaceCapability["tone"] {
  if (plan === "PRO") {
    return "premium";
  }

  return "basic";
}
