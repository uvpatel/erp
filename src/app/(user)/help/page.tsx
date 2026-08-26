"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Boxes,
  ChevronDown,
  ExternalLink,
  Factory,
  FileQuestion,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "Products & Stock" | "Sales & Orders" | "Manufacturing" | "Admin & Access";
}

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "How do I create a new product and track its real-time inventory?",
    answer: "Navigate to Dashboard > Products and click '+ New Product'. Enter the SKU, name, pricing, and ensure 'Track Inventory' is enabled. You can then record incoming receipts or stock adjustments in the Inventory module.",
    category: "Products & Stock",
  },
  {
    id: "faq-2",
    question: "How does stock decrement when a Sales Order is fulfilled?",
    answer: "When a Sales Quotation is confirmed into a Sales Order and marked as Delivered/Shipped, the ERP automatically deducts the reserved quantities from your on-hand warehouse balances and creates an audit ledger entry.",
    category: "Sales & Orders",
  },
  {
    id: "faq-3",
    question: "How do Bill of Materials (BOM) work in Manufacturing Work Orders?",
    answer: "A Bill of Materials (BOM) specifies the exact raw components required to build a finished good. When you launch a Manufacturing Order, the system reserves the required raw items and creates the finished unit upon completion.",
    category: "Manufacturing",
  },
  {
    id: "faq-4",
    question: "How can an administrator change employee roles or grant admin access?",
    answer: "Only users with the 'Admin' role can manage access. Go to Admin > Users, click the three dots next to any account, select 'Edit & Assign Role', and choose the desired organizational persona.",
    category: "Admin & Access",
  },
];

const moduleGuides = [
  {
    title: "Product Catalog & Stock",
    icon: Boxes,
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgClass: "bg-cyan-500/10",
    description: "Learn how to manage SKUs, track unit economics, calculate profit margins, and audit stock movements.",
    link: "/dashboard/products",
  },
  {
    title: "Sales Orders & Quotations",
    icon: ShoppingCart,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    description: "Master quotation generation, line item discounts, customer invoicing, and delivery tracking.",
    link: "/dashboard/sales",
  },
  {
    title: "Manufacturing & BOM",
    icon: Factory,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
    description: "Configure multi-level Bill of Materials, route work orders through assembly stations, and track yields.",
    link: "/dashboard/manufacturing",
  },
  {
    title: "Roles & Permission Matrix",
    icon: ShieldCheck,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
    description: "Understand organizational personas (Sales, Purchase, Manufacturing, Inventory, Owner, Admin).",
    link: "/admin/roles",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedFaq, setExpandedFaq] = React.useState<string | null>("faq-1");
  const [isTicketOpen, setIsTicketOpen] = React.useState(false);
  const [ticketSubject, setTicketSubject] = React.useState("");
  const [ticketMessage, setTicketMessage] = React.useState("");
  const [ticketSubmitting, setTicketSubmitting] = React.useState(false);

  const filteredFaqs = React.useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Please fill in both subject and description.");
      return;
    }
    setTicketSubmitting(true);
    setTimeout(() => {
      setTicketSubmitting(false);
      setIsTicketOpen(false);
      setTicketSubject("");
      setTicketMessage("");
      toast.success("Support ticket #TK-8491 created! Our technical team will respond shortly.");
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Header & Hero */}
      <div className="flex flex-col items-center text-center gap-3 py-6 px-4 rounded-2xl border bg-card shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LifeBuoy className="size-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Help & Documentation Hub</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Everything you need to master your ERP workflows, resolve common queries, and get priority assistance.
        </p>

        <div className="relative w-full max-w-md mt-2">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search guides, tutorials, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Module Guides */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          Module Quick-Start Guides
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {moduleGuides.map((guide, idx) => {
            const Icon = guide.icon;
            return (
              <Card key={idx} className="border bg-card shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${guide.bgClass} ${guide.colorClass}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <p>{guide.description}</p>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs" render={<Link href={guide.link} />}>
                    <span>Open Module</span>
                    <ExternalLink className="size-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileQuestion className="size-5 text-primary" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <Card className="border bg-card shadow-xs">
              <CardContent className="p-8 text-center text-xs text-muted-foreground">
                No questions found matching your search.
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <Card
                  key={faq.id}
                  className={`border bg-card shadow-xs transition-colors cursor-pointer ${
                    isOpen ? "border-primary/40" : ""
                  }`}
                  onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {faq.category}
                        </Badge>
                        <h4 className="text-sm font-semibold text-foreground">
                          {faq.question}
                        </h4>
                      </div>
                      <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {isOpen && (
                    <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t pt-3">
                      {faq.answer}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Support Contact Box */}
      <Card className="border bg-card shadow-xs">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold">Still need technical assistance?</h3>
            <p className="text-xs text-muted-foreground">
              Our engineering team is available 24/7 to resolve workflow issues or answer integration questions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => window.location.href = "mailto:support@company.com"}>
              <Mail className="mr-1.5 size-3.5" />
              Email Support
            </Button>
            <Button size="sm" onClick={() => setIsTicketOpen(true)}>
              <MessageSquare className="mr-1.5 size-3.5" />
              Create Support Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit Ticket Dialog */}
      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Submit an issue directly to our technical operations queue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTicketSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Issue Category
              </label>
              <select className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs">
                <option>Inventory & Stock Discrepancy</option>
                <option>Sales Quotation & Billing Issue</option>
                <option>Manufacturing Work Order Bug</option>
                <option>User Permissions & Access Question</option>
                <option>Other / Integration Request</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Subject
              </label>
              <Input
                placeholder="Brief summary of the issue..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Description & Steps to Reproduce
              </label>
              <textarea
                rows={4}
                placeholder="Please describe what occurred and any error messages..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="mt-1 flex w-full rounded-md border border-input bg-background p-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTicketOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={ticketSubmitting}>
                {ticketSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

