"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Boxes,
  History,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StockMovementItem {
  id: string;
  movementNumber: string;
  productId: string;
  quantity: string | number;
  movementType: string;
  referenceType: string;
  referenceId: string;
  unitCost?: string | number | null;
  performedBy?: string;
  occurredAt: string;
  fromLocation?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface ProductInfo {
  id: string;
  sku: string;
  name: string;
  stock?: {
    onHand: number;
    reserved: number;
    available: number;
  };
  uom?: {
    symbol?: string;
  };
}

const movementBadgeConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PURCHASE_RECEIPT: { label: "Purchase Receipt", variant: "default" },
  MANUFACTURING_PRODUCTION: { label: "Production In", variant: "default" },
  ADJUSTMENT_IN: { label: "Adjustment (+)", variant: "default" },
  RETURN_IN: { label: "Customer Return", variant: "default" },
  SALE_DELIVERY: { label: "Sales Delivery", variant: "secondary" },
  MANUFACTURING_CONSUMPTION: { label: "Raw Consumption", variant: "outline" },
  ADJUSTMENT_OUT: { label: "Adjustment (-)", variant: "destructive" },
  RETURN_OUT: { label: "Vendor Return", variant: "outline" },
  SCRAP: { label: "Scrapped Item", variant: "destructive" },
  TRANSFER: { label: "Internal Transfer", variant: "outline" },
};

function formatCurrency(amount?: string | number | null) {
  if (!amount) return "-";
  const num = typeof amount === "number" ? amount : parseFloat(amount || "0");
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

export default function ProductMovementsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = React.use(params);
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch product info
  const { data: product } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products?id=${productId}`);
      if (!res.ok) throw new Error("Failed to load product");
      const json = await res.json();
      return json.data as ProductInfo;
    },
  });

  // Fetch movements
  const {
    data: movements,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["product-movements", productId],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?productId=${productId}&movements=true`);
      if (!res.ok) throw new Error("Failed to fetch movements");
      const json = await res.json();
      return json.data as StockMovementItem[];
    },
  });

  const filteredMovements = React.useMemo(() => {
    if (!movements) return [];
    return movements.filter((m) => {
      const matchesTab =
        activeTab === "ALL" ||
        (activeTab === "INCOMING" &&
          ["PURCHASE_RECEIPT", "MANUFACTURING_PRODUCTION", "ADJUSTMENT_IN", "RETURN_IN"].includes(
            m.movementType
          )) ||
        (activeTab === "OUTGOING" &&
          ["SALE_DELIVERY", "MANUFACTURING_CONSUMPTION", "ADJUSTMENT_OUT", "RETURN_OUT", "SCRAP"].includes(
            m.movementType
          )) ||
        (activeTab === "TRANSFER" && m.movementType === "TRANSFER");

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        m.movementNumber.toLowerCase().includes(q) ||
        m.referenceType.toLowerCase().includes(q) ||
        m.movementType.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [movements, activeTab, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/products/${productId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Product Overview
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Stock Movements Ledger</h1>
            <p className="text-sm text-muted-foreground">
              Audit trail of receipts, issues, inventory transfers, and scrap for{" "}
              <span className="font-semibold text-foreground">{product?.name || "Product"}</span> (
              <span className="font-mono">{product?.sku || "SKU"}</span>).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={`mr-2 size-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stock Summary Header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current On Hand
            </CardTitle>
            <Boxes className="size-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product?.stock?.onHand || 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {product?.uom?.symbol || "pcs"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reserved Volume
            </CardTitle>
            <ArrowRightLeft className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product?.stock?.reserved || 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {product?.uom?.symbol || "pcs"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available to Deliver
            </CardTitle>
            <Package className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product?.stock?.available || 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {product?.uom?.symbol || "pcs"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search movement #, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="INCOMING">Incoming</TabsTrigger>
                <TabsTrigger value="OUTGOING">Outgoing</TabsTrigger>
                <TabsTrigger value="TRANSFER">Transfer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Movement #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Occurred At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="size-8 text-muted-foreground/50" />
                        <p>No inventory movements recorded for this item yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => {
                    const badge = movementBadgeConfig[movement.movementType] || {
                      label: movement.movementType,
                      variant: "outline",
                    };

                    const isIncoming = [
                      "PURCHASE_RECEIPT",
                      "MANUFACTURING_PRODUCTION",
                      "ADJUSTMENT_IN",
                      "RETURN_IN",
                    ].includes(movement.movementType);

                    return (
                      <TableRow key={movement.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-sm font-medium">
                          {movement.movementNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {movement.referenceType}
                        </TableCell>
                        <TableCell className="text-xs">
                          {movement.fromLocation?.name || "Main Warehouse"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              isIncoming
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {isIncoming ? (
                              <ArrowDownLeft className="size-3.5" />
                            ) : (
                              <ArrowUpRight className="size-3.5" />
                            )}
                            {parseFloat(String(movement.quantity))}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(movement.unitCost)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {new Date(movement.occurredAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

