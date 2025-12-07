"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UpgradePlan } from "@/components/upgrade_plan";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { Loader2, AlertCircle } from "lucide-react";
import { useSelector } from 'react-redux';
import { selectUserPlanId, selectUserBillingType } from '@/store/slices/userSlice';

export default function UpgradePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  // Debug: log the full Redux state
  useSelector(state => { console.log('Full Redux state:', state); return state; });
  const currentPlanId = useSelector(state => {
    const value = selectUserPlanId(state);
    console.log('selectUserPlanId:', value);
    return value;
  });
  const currentBillingType = useSelector(state => {
    const value = selectUserBillingType(state);
    console.log('selectUserBillingType:', value);
    return value;
  });

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const accessToken = Cookies.get("access_token");
      const isAuth = !!accessToken;
      
      setIsAuthenticated(isAuth);
      setIsLoading(false);
      
      if (!isAuth) {
        // Show redirect message first
        setShowRedirectMessage(true);
        
        // Show toast after a brief delay to ensure component is mounted
        setTimeout(() => {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the upgrade page.",
            variant: "destructive",
          });
        }, 100);
        
        // Redirect after showing the message
        setTimeout(() => {
          router.push("/login");
        }, 3000); // 3 second delay
      }
    };

    checkAuth();
  }, [router, toast]);

  const handlePlanSelect = (planId: number) => {
    const planNames = ["", "Starter", "Professional", "Enterprise"];
    const selectedPlan = planNames[planId];
    
    toast({
      title: "Plan Selected",
      description: `You selected the ${selectedPlan} plan.`,
      variant: "default",
    });
    
    console.log("Selected plan ID:", planId);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated && showRedirectMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to access the upgrade page.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">Redirecting to sign-in...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade page only if authenticated
  return (
    <div className="min-h-screen bg-background">
      <UpgradePlan 
        currentPlanId={currentPlanId ?? undefined}
        currentBillingType={currentBillingType}
        showCurrentPlan={true}
      />
    </div>
  );
} 