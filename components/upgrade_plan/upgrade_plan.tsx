"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, MoveRight, PhoneCall, Crown, Zap, Building2 } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { usePayment } from "@/hooks/usePayment";

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
  starter_monthly: 1,
  starter_yearly: 2,
  professional_monthly: 3,
  professional_yearly: 4,
  enterprise_monthly: 5,
  enterprise_yearly: 6
};

const plans = {
  monthly: [
    {
      id: PLAN_MAPPING.starter_monthly,
      name: "Starter",
      planIdentifier: "starter_monthly",
      price: 29,
      description: "Perfect for individuals and small teams getting started with AI-powered content creation.",
      icon: Zap,
      features: [
        { title: "5 AI Agents", description: "Create and manage up to 5 AI agents for your projects." },
        { title: "Basic Analytics", description: "Track performance with essential analytics and insights." },
        { title: "Email Support", description: "Get help when you need it with our email support team." },
        { title: "Standard Templates", description: "Access to our library of standard content templates." }
      ]
    },
    {
      id: PLAN_MAPPING.professional_monthly,
      name: "Professional",
      planIdentifier: "professional_monthly",
      price: 79,
      description: "Ideal for growing businesses that need advanced features and team collaboration.",
      icon: Crown,
      popular: true,
      features: [
        { title: "25 AI Agents", description: "Scale up with up to 25 AI agents for multiple projects." },
        { title: "Advanced Analytics", description: "Comprehensive analytics with custom reporting and insights." },
        { title: "Priority Support", description: "Get faster responses with our priority support channel." },
        { title: "Custom Templates", description: "Create and save your own custom content templates." },
        { title: "Team Collaboration", description: "Invite team members and collaborate on projects together." },
        { title: "API Access", description: "Integrate with your existing tools via our API." }
      ]
    },
    {
      id: PLAN_MAPPING.enterprise_monthly,
      name: "Enterprise",
      planIdentifier: "enterprise_monthly",
      price: 199,
      description: "For large organizations requiring unlimited scale and dedicated support.",
      icon: Building2,
      features: [
        { title: "Unlimited AI Agents", description: "No limits on the number of AI agents you can create." },
        { title: "Custom Analytics", description: "Build custom dashboards and analytics for your specific needs." },
        { title: "Dedicated Support", description: "Get a dedicated account manager and 24/7 phone support." },
        { title: "Custom Integrations", description: "We'll build custom integrations for your specific workflow." },
        { title: "Advanced Security", description: "Enterprise-grade security with SSO and advanced permissions." },
        { title: "Custom Training", description: "Get personalized training sessions for your team." }
      ]
    }
  ],
  yearly: [
    {
      id: PLAN_MAPPING.starter_yearly,
      name: "Starter",
      planIdentifier: "starter_yearly",
      price: 228, // 29*12*0.65 = 226.2, rounded for display
      description: "Perfect for individuals and small teams getting started with AI-powered content creation.",
      icon: Zap,
      features: [
        { title: "5 AI Agents", description: "Create and manage up to 5 AI agents for your projects." },
        { title: "Basic Analytics", description: "Track performance with essential analytics and insights." },
        { title: "Email Support", description: "Get help when you need it with our email support team." },
        { title: "Standard Templates", description: "Access to our library of standard content templates." }
      ]
    },
    {
      id: PLAN_MAPPING.professional_yearly,
      name: "Professional",
      planIdentifier: "professional_yearly",
      price: 616, // 79*12*0.65 = 615.6
      description: "Ideal for growing businesses that need advanced features and team collaboration.",
      icon: Crown,
      popular: true,
      features: [
        { title: "25 AI Agents", description: "Scale up with up to 25 AI agents for multiple projects." },
        { title: "Advanced Analytics", description: "Comprehensive analytics with custom reporting and insights." },
        { title: "Priority Support", description: "Get faster responses with our priority support channel." },
        { title: "Custom Templates", description: "Create and save your own custom content templates." },
        { title: "Team Collaboration", description: "Invite team members and collaborate on projects together." },
        { title: "API Access", description: "Integrate with your existing tools via our API." }
      ]
    },
    {
      id: PLAN_MAPPING.enterprise_yearly,
      name: "Enterprise",
      planIdentifier: "enterprise_yearly",
      price: 1554, // 199*12*0.65 = 1551.8
      description: "For large organizations requiring unlimited scale and dedicated support.",
      icon: Building2,
      features: [
        { title: "Unlimited AI Agents", description: "No limits on the number of AI agents you can create." },
        { title: "Custom Analytics", description: "Build custom dashboards and analytics for your specific needs." },
        { title: "Dedicated Support", description: "Get a dedicated account manager and 24/7 phone support." },
        { title: "Custom Integrations", description: "We'll build custom integrations for your specific workflow." },
        { title: "Advanced Security", description: "Enterprise-grade security with SSO and advanced permissions." },
        { title: "Custom Training", description: "Get personalized training sessions for your team." }
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
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { handlePayment, isLoading } = usePayment();
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>(
    currentBillingType === 'yearly' ? 'yearly' : 'monthly'
  );

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = Cookies.get("access_token");
    setIsAuthenticated(!!accessToken);
  }, []);

  const handlePlanSelect = async (planId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setSelectedPlan(planId);
    
    if (onPlanSelect) {
      onPlanSelect(planId);
      return;
    }

    // Use the payment hook
    await handlePayment(planId);
  };

  const handleContactSales = () => {
    // You can implement this to open a contact form or redirect to a contact page
    toast({
      title: "Contact Sales",
      description: "Our sales team will contact you shortly.",
      variant: "default",
    });
  };

  return (
    <div className="w-full py-20 lg:py-20 bg-gradient-to-br from-background via-background/80 to-background/60">
      <div className="container mx-auto px-4">
        <div className="flex text-center justify-center items-center gap-4 flex-col">
          <Badge variant="secondary" className="text-sm">
            {showCurrentPlan && currentPlan ? `Current Plan: ${currentPlan} (${currentBillingType})` : "Upgrade Your Plan"}
          </Badge>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center font-regular">
              Choose the perfect plan for your needs
            </h2>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-center">
              Scale your AI-powered content creation with our flexible pricing plans.
            </p>
          </div>
          {/* Pricing tab for monthly/yearly */}
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
          <div className="grid pt-10 text-left grid-cols-1 lg:grid-cols-3 w-full gap-8 max-w-7xl">
            {plans[frequency].map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              return (
                <Card 
                  key={plan.id} 
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
                        onClick={() => handlePlanSelect(plan.id)}
                        disabled={isLoading}
                      >
                        {isLoading && selectedPlan === plan.id ? (
                          "Processing..."
                        ) : plan.name === "Enterprise" ? (
                          <>
                            Contact Sales <PhoneCall className="w-4 h-4" />
                          </>
                        ) : currentPlanId === plan.id ? (
                          "Current Plan"
                        ) : (
                          <>
                            {isAuthenticated ? "Subscribe" : "Get Started"} 
                            <MoveRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {!isAuthenticated && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Already have an account? 
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </Button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
