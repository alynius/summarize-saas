"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UrlInput } from "@/components/summarize/url-input";
import { TextInput } from "@/components/summarize/text-input";
import { LengthSelector } from "@/components/summarize/length-selector";
import { ModelSelector } from "@/components/summarize/model-selector";
import { SummaryCard } from "@/components/summarize/summary-card";
import { Link, FileText, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import type { SummaryLength } from "@/lib/summarize/types";
import { useCurrentUser } from "@/hooks/use-user";
import { useSummarize } from "@/hooks/use-summarize";

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { summarizeUrl, summarizeText, isLoading, error, result, reset } = useSummarize();

  const [length, setLength] = useState<SummaryLength>("medium");
  const [model, setModel] = useState("gpt-4o");

  const handleUrlSubmit = async (url: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeUrl(user._id, url, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleTextSubmit = async (text: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeText(user._id, text, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  // Show loading state while user is being fetched
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Options Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LengthSelector
              value={length}
              onChange={setLength}
              disabled={isLoading}
            />
            <ModelSelector
              value={model}
              onChange={setModel}
              disabled={isLoading}
            />
          </div>

          {/* Input Tabs */}
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-2" disabled={isLoading}>
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2" disabled={isLoading}>
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="mt-4">
              <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Result Section */}
      {result ? (
        <SummaryCard
          title={result.title}
          summary={result.summary}
          model={model}
          length={length}
          wordCount={result.wordCount}
          timestamp={new Date()}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No summary yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Enter a URL or paste text above to generate a summary using AI.
              Your summary will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
