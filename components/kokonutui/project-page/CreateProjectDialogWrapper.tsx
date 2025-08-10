import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchProjects,
  fetchProjectSummary,
} from "@/store/slices/projectsSlice";
import { useToast } from "@/components/ui/use-toast";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { getApiUrl } from "../../../lib/config";
import Cookies from "js-cookie";
import { refreshAccessToken } from "@/lib/utils";

interface WebsiteAnalysisResult {
  url: string;
  title: string;
  description: string;
  target_audience: string;
  keywords: string[];
  main_category: string;
}

// Replace mock function with API call
const analyzeWebsite = async (url: string) => {
  try {
    const response = await fetch(getApiUrl("scraper/scrape-website"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      // Attempt to read error message from response body if available
      const errorBody = await response
        .json()
        .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: WebsiteAnalysisResult = await response.json();

    // Map API response to the expected project structure
    return {
      title: data.title,
      description: data.description,
      targetAudience: data.target_audience,
      // The API does not provide competitors, excludedKeywords, or priority.
      // We will initialize them as empty or default values.
      competitors: [],
      keywords: data.keywords,
      excludedKeywords: [],
      category: data.main_category || "marketing", // Default to 'marketing' if category is missing
      priority: "medium", // Default to 'medium' if priority is missing
    };
  } catch (error: any) {
    console.error("Error analyzing website:", error);
    throw new Error(
      `Failed to analyze website: ${error.message || "Unknown error"}`
    );
  }
};

interface CreateProjectDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectDialogWrapper: React.FC<
  CreateProjectDialogWrapperProps
> = ({ open, onOpenChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    targetAudience: "",
    websiteUrl: "",
    category: "marketing",
    priority: "medium",
    dueDate: "",
    budget: "",
    team: [],
    tags: "",
    competitors: [] as string[],
    keywords: [] as string[],
    excludedKeywords: [] as string[],
  });

  // URL analysis state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  // Competitor, keyword, and excluded keyword input states
  const [competitorInput, setCompetitorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [excludedKeywordInput, setExcludedKeywordInput] = useState("");

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (open) {
      setNewProject({
        title: "",
        description: "",
        targetAudience: "",
        websiteUrl: "",
        category: "marketing",
        priority: "medium",
        dueDate: "",
        budget: "",
        team: [],
        tags: "",
        competitors: [],
        keywords: [],
        excludedKeywords: [],
      });
      setWebsiteUrl("");
      setIsAnalyzing(false);
      setAnalysisError("");
      setActiveTab("url");
    }
  }, [open]);

  // Handle website URL analysis
  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      setAnalysisError("Please enter a website URL");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError("");

      // Call the API function
      const result = await analyzeWebsite(websiteUrl);

      // Update the form with the results
      setNewProject({
        ...newProject,
        title: result.title,
        description: result.description,
        targetAudience: result.targetAudience,
        websiteUrl: websiteUrl,
        category: result.category,
        priority: result.priority,
        competitors: result.competitors,
        keywords: result.keywords,
        excludedKeywords: result.excludedKeywords,
      });
    } catch (error) {
      setAnalysisError(
        "Failed to analyze website. Please try again or enter details manually."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle adding a competitor
  const addCompetitor = () => {
    if (
      competitorInput.trim() &&
      !newProject.competitors.includes(competitorInput.trim())
    ) {
      setNewProject({
        ...newProject,
        competitors: [...newProject.competitors, competitorInput.trim()],
      });
      setCompetitorInput("");
    }
  };

  // Handle removing a competitor
  const removeCompetitor = (competitor: string) => {
    setNewProject({
      ...newProject,
      competitors: newProject.competitors.filter((c) => c !== competitor),
    });
  };

  // Handle adding a keyword
  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !newProject.keywords.includes(keywordInput.trim())
    ) {
      setNewProject({
        ...newProject,
        keywords: [...newProject.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    setNewProject({
      ...newProject,
      keywords: newProject.keywords.filter((k) => k !== keyword),
    });
  };

  // Handle adding an excluded keyword
  const addExcludedKeyword = () => {
    if (
      excludedKeywordInput.trim() &&
      !newProject.excludedKeywords.includes(excludedKeywordInput.trim())
    ) {
      setNewProject({
        ...newProject,
        excludedKeywords: [
          ...newProject.excludedKeywords,
          excludedKeywordInput.trim(),
        ],
      });
      setExcludedKeywordInput("");
    }
  };

  // Handle removing an excluded keyword
  const removeExcludedKeyword = (keyword: string) => {
    setNewProject({
      ...newProject,
      excludedKeywords: newProject.excludedKeywords.filter(
        (k) => k !== keyword
      ),
    });
  };

  // Handle creating a new project
  const handleCreateProject = async () => {
    try {
      // Prepare project data matching the backend model
      const projectData = {
        title: newProject.title,
        description: newProject.description || null,
        target_audience: newProject.targetAudience || null,
        website_url: newProject.websiteUrl || null,
        category: newProject.category || null,
        priority: newProject.priority || null,
        due_date: newProject.dueDate || null,
        budget: newProject.budget || null,
        team: newProject.team || null,
        tags: newProject.tags || null,
        competitors: newProject.competitors || null,
        keywords: newProject.keywords || null,
        excluded_keywords: newProject.excludedKeywords || null,
      };

      console.log("Creating new project:", projectData);
      let token = Cookies.get("access_token");

      let response = await fetch(getApiUrl("projects"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      // If unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(getApiUrl("projects"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(projectData),
          });
        }
      }

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(
          errorBody.message || `HTTP error! status: ${response.status}`
        );
      }

      const createdProject = await response.json();
      console.log("Project created successfully:", createdProject);

      toast({
        title: "Project Created",
        description: `Project "${createdProject.title}" created successfully.`,
        variant: "default",
      });

      // Refetch projects and summary to show the new project instantly
      dispatch(fetchProjects());
      dispatch(fetchProjectSummary());
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to Create Project",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      onOpenChange(false);
    }
  };

  const canCreate =
    !!newProject.title &&
    !!newProject.description &&
    !!newProject.targetAudience &&
    newProject.keywords.length > 0;

  return (
    <CreateProjectDialog
      open={open}
      onOpenChange={onOpenChange}
      newProject={newProject}
      setNewProject={setNewProject}
      websiteUrl={websiteUrl}
      setWebsiteUrl={setWebsiteUrl}
      isAnalyzing={isAnalyzing}
      setIsAnalyzing={setIsAnalyzing}
      analysisError={analysisError}
      setAnalysisError={setAnalysisError}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      competitorInput={competitorInput}
      setCompetitorInput={setCompetitorInput}
      keywordInput={keywordInput}
      setKeywordInput={setKeywordInput}
      excludedKeywordInput={excludedKeywordInput}
      setExcludedKeywordInput={setExcludedKeywordInput}
      addCompetitor={addCompetitor}
      removeCompetitor={removeCompetitor}
      addKeyword={addKeyword}
      removeKeyword={removeKeyword}
      addExcludedKeyword={addExcludedKeyword}
      removeExcludedKeyword={removeExcludedKeyword}
      handleAnalyzeWebsite={handleAnalyzeWebsite}
      handleCreateProject={handleCreateProject}
      canCreate={canCreate}
    />
  );
};
