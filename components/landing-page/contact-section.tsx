"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container"

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  terms: boolean
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
  terms?: string
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    terms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    if (!formData.terms) {
      newErrors.terms = "You must accept the terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        terms: false,
      })
      setIsSubmitted(false)
    }, 3000)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      description: "Have a question or need help? Drop us an email, and we'll respond within 24 hours.",
      contact: "hello@relative.io",
      action: "mailto:hello@relative.io",
    },
  ]

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 border-none !pb-12">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Badge variant="outline" className="w-fit gap-1 px-3 text-sm font-normal tracking-tight shadow-sm">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                >
                  <Mail className="size-4" />
                </motion.div>
                <span>Reach Out</span>
              </Badge>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-3xl leading-tight tracking-tight md:text-4xl lg:text-6xl">Get in Touch</h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px] font-light">
              We're here to help—reach out with any questions or feedback. Our team is ready to assist you.
            </p>
          </FadeIn>
        </div>

        {/* Main Content */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact Form */}
          <FadeIn delay={0.6}>
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2">Send us a message</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                >
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                    <CheckCircle className="size-16 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`transition-all duration-200 ${
                          errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="size-3" />
                          {errors.name}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`transition-all duration-200 ${
                          errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="size-3" />
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className={`transition-all duration-200 ${
                        errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="size-3" />
                        {errors.subject}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className={`min-h-[120px] transition-all duration-200 ${
                        errors.message ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="size-3" />
                        {errors.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => handleInputChange("terms", checked as boolean)}
                      className={errors.terms ? "border-red-500" : ""}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the{" "}
                        <a href="/terms" className="underline hover:text-primary">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="underline hover:text-primary">
                          Privacy Policy
                        </a>
                      </Label>
                      {errors.terms && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="size-3" />
                          {errors.terms}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button type="submit" disabled={isSubmitting} className="w-full relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="size-4 border-2 border-current border-t-transparent rounded-full"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            Send Message
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </FadeIn>

          {/* Contact Information */}
          <FadeIn delay={0.8}>
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2">Get in touch via email</h2>
                <p className="text-muted-foreground">We'll respond to your email within 24 hours.</p>
              </div>

              <StaggerContainer className="space-y-6" staggerDelay={0.1}>
                {contactInfo.map((info, index) => (
                  <StaggerItem key={index}>
                    <motion.div
                      className="group p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300"
                      whileHover={{ y: -2, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="flex-shrink-0 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <info.icon className="size-5 text-primary" />
                        </motion.div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg">{info.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{info.description}</p>
                          {info.action ? (
                            <motion.a
                              href={info.action}
                              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              target={info.action.startsWith("http") ? "_blank" : undefined}
                              rel={info.action.startsWith("http") ? "noopener noreferrer" : undefined}
                            >
                              {info.contact}
                              {info.title === "Office" && <MapPin className="size-4" />}
                            </motion.a>
                          ) : (
                            <p className="font-medium text-primary">{info.contact}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Additional Info */}
              <motion.div
                className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h3 className="font-semibold mb-2">Quick Response Guarantee</h3>
                <p className="text-muted-foreground text-sm">
                  We typically respond to all inquiries within 2-4 hours during business hours. For urgent matters,
                  please call us directly.
                </p>
              </motion.div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
