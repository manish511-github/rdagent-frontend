"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, MoveRight, Crown, Zap, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tab } from "@/components/ui/pricing-tab";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { usePayment } from "@/hooks/usePayment";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  planIdentifier: string; // e.g., "starter_monthly", "pro_yearly"
}

interface UpgradePlanProps {
  currentPlan?: string;
  onPlanSelect?: (planId: number) => void;
  showCurrentPlan?: boolean;
  currentPlanId?: number | null;
  currentBillingType?: string;
}


const PLAN_MAPPING = {
  trial: 0,
  pro_monthly: 1, // previously basic_monthly
  pro_yearly: 2,  // previously basic_yearly
  ultra_monthly: 3,   // previously pro_monthly
  ultra_yearly: 4     // previously pro_yearly
};

const plans = {
  monthly: [
    {
      id: PLAN_MAPPING.trial,
      name: "Trial",
      planIdentifier: "trial",
      price: 0,
      description: "Explore core features for free — no credit card required.",
      icon: BadgeCheck,
      features: [
        { title: "1 Project", description: "Set up and manage a single project to experience the platform." },
        { title: "1 Agent", description: "Deploy one AI agent to automate content creation." },
        { title: "10 Keywords", description: "Track up to 10 keywords with basic insights." },
        { title: "10 Credits", description: "Use credits for generating AI-powered content, replies, and competitor analysis." },
        { title: "Weekly Scheduling", description: "Automate content delivery once per week." }
      ]
    },
    {
      id: PLAN_MAPPING.pro_monthly,
      name: "Pro",
      planIdentifier: "pro_monthly",
      price: 29,
      description: "Ideal for individuals or small teams starting their AI content journey.",
      icon: Zap,
      features: [
        { title: "2 Projects", description: "Run and manage up to two separate projects." },
        { title: "5 Agents", description: "Use up to five AI agents for different workflows." },
        { title: "20 Keywords", description: "Track 20 keywords with improved analytics." },
        { title: "200 Credits", description: "Generate more AI content, replies, and competitor analysis with 200 monthly credits." },
        { title: "Weekly Scheduling", description: "Automate agent activity on a weekly basis." },
        { title: "Email Support", description: "Get direct assistance from our support team." }
      ]
    },
    {
      id: PLAN_MAPPING.ultra_monthly,
      name: "Ultra",
      planIdentifier: "ultra_monthly",
      price: 49,
      description: "Perfect for growing teams who need speed, scale, and collaboration.",
      icon: Crown,
      popular: true,
      features: [
        { title: "5 Projects", description: "Manage up to five active projects simultaneously." },
        { title: "10 Agents", description: "Deploy and manage 10 AI agents across all projects." },
        { title: "50 Keywords per Agent", description: "Track 50 keywords per agent for deeper insights." },
        { title: "500 Credits", description: "Power large-scale AI content generation, replies, and competitor analysis with 500 credits." },
        { title: "Twice-Weekly Scheduling", description: "Automate agent tasks two times per week." },
        { title: "Priority Support", description: "Receive faster help from our priority support channel." }
      ]
    }
  ],
  yearly: [
    {
      id: PLAN_MAPPING.trial,
      name: "Trial",
      planIdentifier: "trial",
      price: 0,
      description: "Explore core features for free — no credit card required.",
      icon: BadgeCheck,
      features: [
        { title: "1 Project", description: "Set up and manage a single project to experience the platform." },
        { title: "1 Agent", description: "Deploy one AI agent to automate content creation." },
        { title: "10 Keywords", description: "Track up to 10 keywords with basic insights." },
        { title: "10 Credits", description: "Use credits for generating AI-powered content, replies, and competitor analysis." },
        { title: "Weekly Scheduling", description: "Automate content delivery once per week." }
      ]
    },
    {
      id: PLAN_MAPPING.pro_yearly,
      name: "Pro",
      planIdentifier: "pro_yearly",
      price: 226, // 29 x 12 with 35% discount
      description: "Ideal for individuals or small teams starting their AI content journey — save with yearly billing.",
      icon: Zap,
      features: [
        { title: "2 Projects", description: "Run and manage up to two separate projects." },
        { title: "5 Agents", description: "Use up to five AI agents for different workflows." },
        { title: "20 Keywords", description: "Track 20 keywords with improved analytics." },
        { title: "100 Credits", description: "Generate more AI content, replies, and competitor analysis with 100 monthly credits." },
        { title: "Weekly Scheduling", description: "Automate agent activity on a weekly basis." },
        { title: "Email Support", description: "Get direct assistance from our support team." }
      ]
    },
    {
      id: PLAN_MAPPING.ultra_yearly,
      name: "Ultra",
      planIdentifier: "ultra_yearly",
      price: 382, // 49 x 12 with 35% discount
      description: "Perfect for growing teams who need speed, scale, and collaboration — save with yearly billing.",
      icon: Crown,
      popular: true,
      features: [
        { title: "5 Projects", description: "Manage up to five active projects simultaneously." },
        { title: "10 Agents", description: "Deploy and manage 10 AI agents across all projects." },
        { title: "50 Keywords per Agent", description: "Track 50 keywords per agent for deeper insights." },
        { title: "500 Credits", description: "Power large-scale AI content generation, replies, and competitor analysis with 500 credits." },
        { title: "Twice-Weekly Scheduling", description: "Automate agent tasks two times per week." },
        { title: "Priority Support", description: "Receive faster help from our priority support channel." }
      ]
    }
  ]
};


export default function UpgradePlan({ 
  currentPlan, 
  onPlanSelect, 
  showCurrentPlan = true,
  currentPlanId,
  currentBillingType
}: UpgradePlanProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { handlePayment, isLoading } = usePayment();
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>(
    currentBillingType === 'yearly' ? 'yearly' : 'monthly'
  );
  const userEmail = useSelector((state: RootState) => state.user.info?.email);

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = Cookies.get("access_token");
    setIsAuthenticated(!!accessToken);
  }, []);

  const handlePlanSelect = async (planId: number, email?: string) => {
    setSelectedPlan(planId);
    
    if (onPlanSelect) {
      onPlanSelect(planId);
      return;
    }

    // Use the payment hook
    await handlePayment(planId, email);
  };

  // No enterprise/sales flow for now
  

  return (
    <div className="w-full py-1 lg:py-1 bg-gradient-to-br from-background via-background/80 to-background/60">
      <div className="container mx-auto px-4">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <FadeIn>
            <Badge variant="secondary" className="text-sm">
              {showCurrentPlan && currentPlan ? `Current Plan: ${currentPlan} (${currentBillingType})` : "Upgrade Your Plan"}
            </Badge>
          </FadeIn>
          <div className="flex gap-2 flex-col">
            <FadeIn delay={0.1}>
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center font-regular">
                Choose the perfect plan for your needs
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-center">
                Scale your AI-powered content creation with our flexible pricing plans.
              </p>
            </FadeIn>
          </div>
          {/* Pricing tab for monthly/yearly */}
          <FadeIn delay={0.25}>
            <div className="flex w-fit rounded-full bg-muted p-1 mx-auto my-8">
              <Tab
                text="monthly"
                selected={frequency === 'monthly'}
                setSelected={() => setFrequency('monthly')}
              />
              <Tab
                text="yearly"
                selected={frequency === 'yearly'}
                setSelected={() => setFrequency('yearly')}
                discount
              />
            </div>
          </FadeIn>
          <StaggerContainer className="grid pt-10 text-left grid-cols-1 lg:grid-cols-3 w-full gap-8 max-w-7xl" staggerDelay={0.12}>
            {plans[frequency].map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              return (
                <StaggerItem key={plan.id}>
                  <Card 
                    className={`w-full rounded-md transition-all duration-200 hover:shadow-lg ${
                      plan.popular 
                        ? 'shadow-2xl border-primary/20 relative' 
                        : 'border-border'
                    } ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>
                        <span className="flex flex-row gap-4 items-center font-normal">
                          <Icon className="w-6 h-6 text-primary" />
                          {plan.name}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-8 justify-start">
                        <p className="flex flex-row items-center gap-2 text-xl">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-sm text-muted-foreground">
                            {frequency === 'monthly' ? '/ month' : '/ year'}
                          </span>
                        </p>
                        <div className="flex flex-col gap-4 justify-start">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex flex-row gap-4">
                              <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                              <div className="flex flex-col">
                                <p className="font-medium">{feature.title}</p>
                                <p className="text-muted-foreground text-sm">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant={plan.popular ? "default" : "outline"}
                          className="gap-4 w-full"
                          onClick={() => {
                            // If this is the current plan, do not initiate a new checkout
                            if (currentPlanId === plan.id) {
                              toast("You’re already subscribed to this plan.");
                              return;
                            }

                            if (plan.name === "Trial") {
                              if (!isAuthenticated) router.push("/signup");
                              else router.push("/projects");
                              return;
                            }
                            if (!isAuthenticated) {
                              router.push("/login");
                            } else {
                              handlePlanSelect(plan.id, userEmail);
                            }
                          }}
                          disabled={isLoading || currentPlanId === plan.id}
                        >
                          {isLoading && selectedPlan === plan.id ? (
                            "Processing..."
                          ) : currentPlanId === plan.id ? (
                            "Current Plan"
                          ) : (
                            <>
                              {plan.name === "Trial" ? "Start Free" : (!isAuthenticated ? "Get Started" : "Subscribe")} 
                              <MoveRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
          
        </div>
      </div>
    </div>
  );
}
