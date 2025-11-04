"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { useConsultationStore } from "@/lib/store/consultation-store";
import { Suggestion } from "@/lib/types";

interface SuggestionsPanelProps {
  isGenerating: boolean;
}

export function SuggestionsPanel({ isGenerating }: SuggestionsPanelProps) {
  const { currentSession, toggleSelection } = useConsultationStore();

  if (!currentSession) return null;

  const renderSuggestionCategory = (
    title: string,
    suggestions: Suggestion[],
    selectedItems: string[],
    category: keyof typeof currentSession.selectedItems
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {selectedItems.length} selected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            {isGenerating ? 'Generating suggestions...' : 'No suggestions yet'}
          </p>
        ) : (
          suggestions.map((suggestion) => {
            const isSelected = selectedItems.includes(suggestion.text);
            return (
              <button
                key={suggestion.id}
                onClick={() => toggleSelection(category, suggestion.text)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted border-border'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{suggestion.text}</p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Suggestions</h2>
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </div>
        )}
      </div>

      {renderSuggestionCategory(
        'Symptoms',
        currentSession.suggestions.symptoms,
        currentSession.selectedItems.symptoms,
        'symptoms'
      )}

      {renderSuggestionCategory(
        'Diagnoses',
        currentSession.suggestions.diagnoses,
        currentSession.selectedItems.diagnoses,
        'diagnoses'
      )}

      {renderSuggestionCategory(
        'Medicines',
        currentSession.suggestions.medicines,
        currentSession.selectedItems.medicines,
        'medicines'
      )}
    </div>
  );
}
