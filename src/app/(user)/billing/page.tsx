"use client";

import * as React from "react";
import {
  CreditCard,
  Download,
  FileText,
  Plus,
  Receipt,
  ShieldCheck,
  Zap,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: "PAID" | "PENDING";
  description: string;
}

const pastInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-003",
    date: "01 Jan 2026",
    amount: 24999,
    status: "PAID",
    description: "Enterprise ERP Plan — Annual Subscription (2026)",
  },
  {
    id: "2",
    invoiceNumber: "INV-2025-012",
    date: "15 Dec 2025",
    amount: 4999,
    status: "PAID",
    description: "+10 Extra Employee Seats Pack (Q4 Extension)",
  },
  {
    id: "3",
    invoiceNumber: "INV-2025-001",
    date: "01 Jan 2025",
    amount: 19999,
    status: "PAID",
    description: "Standard Pro ERP Plan — Annual Subscription (2025)",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BillingPage() {
  const [isAddSeatsOpen, setIsAddSeatsOpen] = React.useState(false);
  const [extraSeats, setExtraSeats] = React.useState(5);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleDownloadInvoice = (invNum: string) => {
    toast.success(`Downloading invoice ${invNum}.pdf`);
  };

  const handleAddSeats = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsAddSeatsOpen(false);
      toast.success(`Successfully added ${extraSeats} user seats to your enterprise license!`);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization enterprise plan, billing details, seat allocation, and download official invoices.
        </p>
      </div>

      {/* Plan Card */}
      <Card className="border bg-card shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold">Enterprise Pro Plan</CardTitle>
                  <Badge variant="default" className="bg-emerald-600 dark:bg-emerald-500">
                    Active Subscription
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Renews automatically on <span className="font-medium text-foreground">31 Dec 2026</span>
                </CardDescription>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold">{formatCurrency(24999)} <span className="text-xs font-normal text-muted-foreground">/ year</span></div>
              <span className="text-[11px] text-muted-foreground">GST Invoice Billed Annually</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 border-t pt-4">
          {/* Usage Gauges */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Employee Seats:</span>
                <span className="font-semibold text-foreground">12 / 50</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[24%]" />
              </div>
              <p className="text-[10px] text-muted-foreground">38 seats remaining</p>
            </div>

            <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Products Catalog:</span>
                <span className="font-semibold text-foreground">142 / 10,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[1.4%]" />
              </div>
              <p className="text-[10px] text-muted-foreground">Unlimited variants allowed</p>
            </div>

            <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Cloud Storage:</span>
                <span className="font-semibold text-foreground">2.4 GB / 100 GB</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[2.4%]" />
              </div>
              <p className="text-[10px] text-muted-foreground">Attachments, invoices, CAD BOM</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between border-t bg-muted/10 p-4 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>99.9% Uptime SLA Guaranteed</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddSeatsOpen(true)}>
              <Plus className="mr-1.5 size-3.5" />
              Add User Seats
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Payment & Tax Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Payment Method */}
        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Payment Method
            </CardTitle>
            <CardDescription>
              Primary corporate card used for recurring renewals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  VISA
                </div>
                <div>
                  <div className="font-medium text-foreground">Corporate Credit Card •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Expires 12/2028</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">Primary</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tax & GST Profile */}
        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Tax & Invoicing Details
            </CardTitle>
            <CardDescription>
              Legal entity details printed on formal GST invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Company Name:</span>
              <span className="font-medium text-foreground">Acme Enterprise India Pvt Ltd</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">GSTIN / Tax ID:</span>
              <span className="font-mono font-medium text-foreground">24AAACU1234F1Z5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Email:</span>
              <span className="font-medium text-foreground">finance@company.com</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            Billing History & Invoices
          </CardTitle>
          <CardDescription>
            Download past tax invoices and payment receipts for bookkeeping.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[140px]">Invoice #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/40 text-xs">
                  <TableCell className="font-mono font-semibold text-foreground">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}
                    >
                      <Download className="mr-1 size-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Seats Dialog */}
      <Dialog open={isAddSeatsOpen} onOpenChange={setIsAddSeatsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Employee User Seats</DialogTitle>
            <DialogDescription>
              Expand your team capacity with additional ERP user seats billed prorated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSeats} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Number of Additional Seats
              </label>
              <Input
                type="number"
                min="1"
                max="500"
                value={extraSeats}
                onChange={(e) => setExtraSeats(parseInt(e.target.value) || 1)}
                className="mt-1"
                required
              />
              <span className="text-[11px] text-muted-foreground">₹499 per seat / month</span>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>{extraSeats} Seats × ₹499:</span>
                <span>{formatCurrency(extraSeats * 499)} / mo</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-bold text-foreground">
                <span>Prorated Today:</span>
                <span>{formatCurrency(extraSeats * 499)}</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddSeatsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Confirm & Add Seats"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

