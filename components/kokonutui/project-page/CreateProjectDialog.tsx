import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, FileText, X } from "lucide-react";
import { projectCategories, priorityLevels } from "./projectConstants";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: any;
  setNewProject: (project: any) => void;
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (b: boolean) => void;
  analysisError: string;
  setAnalysisError: (msg: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  competitorInput: string;
  setCompetitorInput: (s: string) => void;
  keywordInput: string;
  setKeywordInput: (s: string) => void;
  excludedKeywordInput: string;
  setExcludedKeywordInput: (s: string) => void;
  addCompetitor: () => void;
  removeCompetitor: (c: string) => void;
  addKeyword: () => void;
  removeKeyword: (k: string) => void;
  addExcludedKeyword: () => void;
  removeExcludedKeyword: (k: string) => void;
  handleAnalyzeWebsite: () => Promise<void>;
  handleCreateProject: () => Promise<void>;
  canCreate: boolean;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  newProject,
  setNewProject,
  websiteUrl,
  setWebsiteUrl,
  isAnalyzing,
  setIsAnalyzing,
  analysisError,
  setAnalysisError,
  activeTab,
  setActiveTab,
  competitorInput,
  setCompetitorInput,
  keywordInput,
  setKeywordInput,
  excludedKeywordInput,
  setExcludedKeywordInput,
  addCompetitor,
  removeCompetitor,
  addKeyword,
  removeKeyword,
  addExcludedKeyword,
  removeExcludedKeyword,
  handleAnalyzeWebsite,
  handleCreateProject,
  canCreate,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Fill in the details below to create a new project. You can always edit these later.
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            From Website URL
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>
        <TabsContent value="url" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label htmlFor="website-url">Website URL</Label>
            <div className="flex gap-1.5">
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={isAnalyzing}
                className="flex-1"
              />
              <Button onClick={handleAnalyzeWebsite} disabled={isAnalyzing || !websiteUrl} className="gap-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            {analysisError && <p className="text-sm text-destructive mt-1">{analysisError}</p>}
            <p className="text-xs text-muted-foreground">
              Enter a website URL to automatically extract project information. You can edit the details before saving.
            </p>
          </div>
          {isAnalyzing ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Analyzing website content...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
            </div>
          ) : (
            newProject.title && (
              <div className="space-y-3 border rounded-md p-3 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Project Name (Required)</Label>
                    <Input
                      id="project-title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website-link">Website URL (Optional)</Label>
                    <Input
                      id="website-link"
                      value={newProject.websiteUrl}
                      onChange={(e) => setNewProject({ ...newProject, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description (Required)</Label>
                  <Textarea
                    id="project-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe your project"
                    rows={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-audience">Target Audience (Required)</Label>
                  <Textarea
                    id="target-audience"
                    value={newProject.targetAudience}
                    onChange={(e) => setNewProject({ ...newProject, targetAudience: e.target.value })}
                    placeholder="Define your target audience"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competitors">Competitors (Optional)</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                    {newProject.competitors.map((competitor: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm flex items-center gap-1 px-2.5 py-1 bg-muted/30 text-foreground/80 border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        {competitor}
                        <button
                          onClick={() => removeCompetitor(competitor)}
                          className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      id="competitors"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      placeholder="Add a competitor"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCompetitor();
                        }
                      }}
                    />
                    <Button type="button" onClick={addCompetitor} variant="outline" size="sm" className="h-9">
                      Add
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (Required)</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                      {newProject.keywords.map((keyword: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm font-normal flex items-center gap-1 px-2.5 py-1 bg-secondary/20 text-foreground/60 hover:bg-secondary/40 transition-colors"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1.5 rounded-full hover:bg-secondary/70 transition-colors p-0.5"
                          >
                            <X className="h-3 w-3 text-foreground/60" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        id="keywords"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add a keyword"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                      />
                      <Button type="button" onClick={addKeyword} variant="outline" size="sm" className="h-9">
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excluded-keywords">Excluded Keywords (Optional)</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                      {newProject.excludedKeywords.map((keyword: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm text-muted-foreground flex items-center gap-1 px-2.5 py-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          {keyword}
                          <button
                            onClick={() => removeExcludedKeyword(keyword)}
                            className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        id="excluded-keywords"
                        value={excludedKeywordInput}
                        onChange={(e) => setExcludedKeywordInput(e.target.value)}
                        placeholder="Add an excluded keyword"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addExcludedKeyword();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addExcludedKeyword}
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </TabsContent>
        <TabsContent value="manual" className="space-y-3 mt-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="manual-project-title">Project Name (Required)</Label>
              <Input
                id="manual-project-title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-website-link">Website URL (Optional)</Label>
              <Input
                id="manual-website-link"
                value={newProject.websiteUrl}
                onChange={(e) => setNewProject({ ...newProject, websiteUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-project-description">Description (Required)</Label>
            <Textarea
              id="manual-project-description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe your project"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-target-audience">Target Audience (Required)</Label>
            <Textarea
              id="manual-target-audience"
              value={newProject.targetAudience}
              onChange={(e) => setNewProject({ ...newProject, targetAudience: e.target.value })}
              placeholder="Define your target audience"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-competitors">Competitors (Optional)</Label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
              {newProject.competitors.map((competitor: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm flex items-center gap-1 px-2.5 py-1 bg-muted/30 text-foreground/80 border-border/40 hover:bg-muted/50 transition-colors"
                >
                  {competitor}
                  <button
                    onClick={() => removeCompetitor(competitor)}
                    className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                id="manual-competitors"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                placeholder="Add a competitor"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCompetitor();
                  }
                }}
              />
              <Button type="button" onClick={addCompetitor} variant="outline" size="sm" className="h-9">
                Add
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="manual-keywords">Keywords (Required)</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                {newProject.keywords.map((keyword: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm flex items-center gap-1 px-2.5 py-1 bg-secondary/30 text-foreground/80 hover:bg-secondary/50 transition-colors"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1.5 rounded-full hover:bg-secondary/80 transition-colors p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  id="manual-keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add a keyword"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword} variant="outline" size="sm" className="h-9">
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-excluded-keywords">Excluded Keywords (Optional)</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-background/60">
                {newProject.excludedKeywords.map((keyword: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sm text-muted-foreground flex items-center gap-1 px-2.5 py-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    {keyword}
                    <button
                      onClick={() => removeExcludedKeyword(keyword)}
                      className="ml-1.5 rounded-full hover:bg-muted/80 transition-colors p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  id="manual-excluded-keywords"
                  value={excludedKeywordInput}
                  onChange={(e) => setExcludedKeywordInput(e.target.value)}
                  placeholder="Add an excluded keyword"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExcludedKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addExcludedKeyword} variant="outline" size="sm" className="h-9">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateProject}
          disabled={!canCreate}
        >
          Create Project
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
