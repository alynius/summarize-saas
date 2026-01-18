"use client";

import { useState } from "react";
import { useCurrentUser, useUsage } from "@/hooks";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  User,
  BarChart3,
  Sliders,
  Key,
  Crown,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { SUMMARY_LENGTHS, DEFAULT_MODEL } from "@/lib/constants";
import { AnimatedProgress } from "@/components/ui/animated-progress";

const AVAILABLE_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", tier: "free" },
  { value: "gemini-2.0-flash", label: "Gemini Flash", tier: "free" },
  { value: "gpt-4o", label: "GPT-4o", tier: "pro" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude Sonnet", tier: "pro" },
];

const LENGTH_LABELS: Record<string, string> = {
  short: "Short (~100 words)",
  medium: "Medium (~200 words)",
  long: "Long (~400 words)",
  xl: "Extended (~600 words)",
};

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="shrink-0 mt-0.5">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function UsageBar({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  // Determine variant based on usage
  const variant = isAtLimit ? "error" : isNearLimit ? "warning" : "success";

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">
          summaries this month
        </span>
      </div>

      <AnimatedProgress
        value={used}
        max={limit}
        variant={variant}
      />

      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          You&apos;re approaching your monthly limit
        </p>
      )}

      {isAtLimit && (
        <p className="text-xs text-destructive">
          You&apos;ve reached your monthly limit. Upgrade to continue.
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, clerkUser, isLoading: isUserLoading } = useCurrentUser();
  const { usage, isLoading: isUsageLoading } = useUsage(user?._id);
  const [defaultLength, setDefaultLength] = useState<string>("medium");
  const [defaultModel, setDefaultModel] = useState<string>(DEFAULT_MODEL);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Replace with Convex mutation to save preferences
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isLoading = isUserLoading || isUsageLoading;
  const tier = usage?.tier ?? "free";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings cards */}
        <div className="space-y-6">
          {/* Account Section */}
          <Card>
            <CardContent className="pt-6">
              <SettingsSection
                icon={<User className="size-4" />}
                title="Account"
                description="Your account information from Clerk"
              >
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    {clerkUser?.imageUrl && (
                      <img
                        src={clerkUser.imageUrl}
                        alt=""
                        className="size-10 rounded-full ring-2 ring-border"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {clerkUser?.fullName || clerkUser?.firstName || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {clerkUser?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="uppercase text-[10px] tracking-wider font-medium"
                  >
                    {tier}
                  </Badge>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>

          {/* Usage Section */}
          <Card>
            <CardContent className="pt-6">
              <SettingsSection
                icon={<BarChart3 className="size-4" />}
                title="Usage"
                description="Your summary usage for the current billing period"
              >
                <UsageBar
                  used={usage?.summaryCount ?? 0}
                  limit={usage?.limit ?? 10}
                />

                {tier === "free" && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-100 dark:border-violet-900/50">
                    <div className="flex items-start gap-3">
                      <Crown className="size-5 text-violet-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-violet-900 dark:text-violet-100">
                          Upgrade to Pro
                        </p>
                        <p className="text-xs text-violet-700 dark:text-violet-300 mt-1">
                          Get unlimited summaries, access to premium models, and
                          priority processing.
                        </p>
                        <Button
                          size="sm"
                          className="mt-3 bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          View plans
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </SettingsSection>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardContent className="pt-6">
              <SettingsSection
                icon={<Sliders className="size-4" />}
                title="Preferences"
                description="Customize your default summary settings"
              >
                <div className="space-y-5">
                  {/* Default Length */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="text-sm font-medium">
                        Default summary length
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pre-selected when creating new summaries
                      </p>
                    </div>
                    <Select value={defaultLength} onValueChange={setDefaultLength}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUMMARY_LENGTHS.map((length) => (
                          <SelectItem key={length} value={length}>
                            {LENGTH_LABELS[length]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Default Model */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="text-sm font-medium">
                        Default AI model
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose your preferred summarization model
                      </p>
                    </div>
                    <Select value={defaultModel} onValueChange={setDefaultModel}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem
                            key={model.value}
                            value={model.value}
                            disabled={
                              model.tier === "pro" && tier === "free"
                            }
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="size-3" />
                              <span>{model.label}</span>
                              {model.tier === "pro" && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1 py-0 uppercase"
                                >
                                  Pro
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[100px]"
                  >
                    {saved ? (
                      <>
                        <Check className="size-4 mr-1" />
                        Saved
                      </>
                    ) : isSaving ? (
                      "Saving..."
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>

          {/* API Keys Section (Future/Pro) */}
          <Card className="opacity-75">
            <CardContent className="pt-6">
              <SettingsSection
                icon={<Key className="size-4" />}
                title="API Keys"
                description="Use your own API keys for unlimited access"
              >
                <div className="p-4 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 border border-dashed border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      Coming Soon
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pro tier users will be able to add their own OpenAI, Anthropic,
                    or Google API keys for unlimited summarization without usage
                    limits.
                  </p>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Need help? Contact{" "}
          <a
            href="mailto:support@digestai.ai"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            support@digestai.ai
          </a>
        </p>
      </div>
    </div>
  );
}
