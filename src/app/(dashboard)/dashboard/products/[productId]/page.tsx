"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Clock,
  DollarSign,
  FilePenLine,
  History,
  Package,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  productType: "STORABLE" | "CONSUMABLE" | "SERVICE";
  salesPrice: string | number;
  costPrice: string | number;
  trackInventory: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  uom?: {
    id?: string;
    code?: string;
    name?: string;
    symbol?: string;
  } | null;
  stock?: {
    onHand: number;
    reserved: number;
    available: number;
  };
}

function formatCurrency(amount: string | number) {
  const num = typeof amount === "number" ? amount : parseFloat(amount || "0");
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

const typeBadges: Record<
  ProductDetail["productType"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  STORABLE: { label: "Storable Product", variant: "default" },
  CONSUMABLE: { label: "Consumable Supply", variant: "secondary" },
  SERVICE: { label: "Service / Labor", variant: "outline" },
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products?id=${productId}`);
      if (!res.ok) throw new Error("Failed to load product details");
      const json = await res.json();
      return json.data as ProductDetail;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete product");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update product");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
        <Skeleton className="h-6 w-36" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-bold">Product Not Found</h2>
            <p className="text-sm text-muted-foreground">
              The product you are looking for does not exist or has been removed.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              render={<Link href="/dashboard/products" />}
            >
              Back to Products
            </Button>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const salesP = parseFloat(String(product.salesPrice || 0));
  const costP = parseFloat(String(product.costPrice || 0));
  const profit = Math.max(0, salesP - costP);
  const margin = salesP > 0 ? ((profit / salesP) * 100).toFixed(1) : "0.0";
  const typeConfig = typeBadges[product.productType] || {
    label: product.productType,
    variant: "secondary",
  };

  const onHand = product.stock?.onHand || 0;
  const reserved = product.stock?.reserved || 0;
  const available = product.stock?.available || Math.max(0, onHand - reserved);
  const uomSymbol = product.uom?.symbol || "units";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Top Breadcrumbs & Back Link */}
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Products Catalog
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              SKU: <span className="font-semibold text-foreground">{product.sku}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/dashboard/products/${productId}/movements`} />}
            >
              <History className="mr-2 size-4" />
              Movements
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/dashboard/products/${productId}/edit`} />}
            >
              <FilePenLine className="mr-2 size-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 size-4" />
              {product.active ? "Deactivate" : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Hand Stock
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Boxes className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onHand} <span className="text-sm font-normal text-muted-foreground">{uomSymbol}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Physical inventory in warehouses
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available to Sell
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {available} <span className="text-sm font-normal text-muted-foreground">{uomSymbol}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {reserved > 0 ? `${reserved} ${uomSymbol} currently reserved` : "No reservations active"}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unit Sales Price
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(product.salesPrice)}</div>
            <p className="text-xs text-muted-foreground">
              Cost: {formatCurrency(product.costPrice)}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Margin
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{margin}%</div>
            <p className="text-xs text-muted-foreground">
              Profit: {formatCurrency(profit)} / unit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Product Specifications */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Product Details
              </CardTitle>
              <CardDescription>
                Detailed specifications and categorization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Description</span>
                <p className="mt-1 text-sm text-foreground">
                  {product.description || (
                    <span className="italic text-muted-foreground">No description provided for this product.</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Product Type</span>
                  <div className="font-medium mt-0.5">{typeConfig.label}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Inventory Tracking</span>
                  <div className="font-medium mt-0.5">
                    {product.trackInventory ? "Enabled (Stock Balances Maintained)" : "Disabled"}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Unit of Measure</span>
                  <div className="font-medium mt-0.5">
                    {product.uom?.name || "Units"} ({product.uom?.symbol || "pcs"})
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="font-medium mt-0.5">
                    {product.active ? "Active in Sales & Purchase" : "Archived"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Analysis Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                Pricing Structure & Unit Economics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Selling Price:</span>
                  <span className="font-semibold">{formatCurrency(product.salesPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard Unit Cost:</span>
                  <span>{formatCurrency(product.costPrice)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Unit Profit Margin:</span>
                  <span>
                    +{formatCurrency(profit)} ({margin}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                System Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Created Date:</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Modified:</span>
                <span className="font-medium">
                  {new Date(product.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base">Quick Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                render={<Link href={`/dashboard/products/${productId}/movements`} />}
              >
                <History className="mr-2 size-4 text-primary" />
                Audit Stock Movements
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                render={<Link href="/dashboard/sales" />}
              >
                <ShoppingCart className="mr-2 size-4 text-emerald-600 dark:text-emerald-400" />
                Create Sales Order
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                render={<Link href={`/dashboard/products/${productId}/edit`} />}
              >
                <FilePenLine className="mr-2 size-4 text-purple-600 dark:text-purple-400" />
                Modify Specifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

