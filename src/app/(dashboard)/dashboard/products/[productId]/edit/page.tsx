"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  DollarSign,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [productType, setProductType] = React.useState<
    "STORABLE" | "CONSUMABLE" | "SERVICE"
  >("STORABLE");
  const [salesPrice, setSalesPrice] = React.useState<number>(0);
  const [costPrice, setCostPrice] = React.useState<number>(0);
  const [trackInventory, setTrackInventory] = React.useState(true);
  const [active, setActive] = React.useState(true);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Fetch current product
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products?id=${productId}`);
      if (!res.ok) throw new Error("Failed to load product details");
      const json = await res.json();
      return json.data as ProductDetail;
    },
  });

  // Sync state when data arrives
  React.useEffect(() => {
    if (product && !isLoaded) {
      setName(product.name || "");
      setSku(product.sku || "");
      setDescription(product.description || "");
      setProductType(product.productType || "STORABLE");
      setSalesPrice(parseFloat(String(product.salesPrice || 0)));
      setCostPrice(parseFloat(String(product.costPrice || 0)));
      setTrackInventory(product.trackInventory ?? true);
      setActive(product.active ?? true);
      setIsLoaded(true);
    }
  }, [product, isLoaded]);

  // Real-time margin
  const margin = React.useMemo(() => {
    if (salesPrice <= 0) return "0.0";
    return (((salesPrice - costPrice) / salesPrice) * 100).toFixed(1);
  }, [salesPrice, costPrice]);

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      sku: string;
      description?: string;
      productType: "STORABLE" | "CONSUMABLE" | "SERVICE";
      salesPrice: number;
      costPrice: number;
      trackInventory: boolean;
      active: boolean;
    }) => {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update product");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
      toast.success("Product updated successfully!");
      router.push(`/dashboard/products/${productId}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      toast.error("Please provide both product name and SKU");
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      description: description.trim() || undefined,
      productType,
      salesPrice: Number(salesPrice) || 0,
      costPrice: Number(costPrice) || 0,
      trackInventory: productType === "SERVICE" ? false : trackInventory,
      active,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Product Not Found</h2>
          <p className="text-sm text-muted-foreground">
            Could not find the product to edit.
          </p>
          <Button
            variant="outline"
            render={<Link href="/dashboard/products" />}
          >
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/products/${productId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Product Details
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-sm text-muted-foreground">
              Modify product specifications, pricing, inventory rules, or catalog status.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* General Information */}
        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="size-4 text-primary" />
              General Information
            </CardTitle>
            <CardDescription>
              Basic identification details and categorization of the product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Product Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Ergonomic Office Desk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  SKU / Product Code <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. DSK-1001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="mt-1 font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Product Classification <span className="text-destructive">*</span>
                </label>
                <select
                  value={productType}
                  onChange={(e) =>
                    setProductType(
                      e.target.value as "STORABLE" | "CONSUMABLE" | "SERVICE"
                    )
                  }
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="STORABLE">Storable Good (Stock Tracked)</option>
                  <option value="CONSUMABLE">Consumable Material (Supplies)</option>
                  <option value="SERVICE">Service / Labor (No Stock)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Catalog Status
                </label>
                <select
                  value={active ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setActive(e.target.value === "ACTIVE")}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ACTIVE">Active (Available for Sale & Purchase)</option>
                  <option value="INACTIVE">Inactive (Archived)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Description / Specifications
              </label>
              <textarea
                placeholder="Optional detailed description, materials, or dimensions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Financials */}
        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
              Pricing & Profitability
            </CardTitle>
            <CardDescription>
              Set customer selling price and estimated standard unit cost.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Sales Price (₹) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={salesPrice || ""}
                  onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Cost Price (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={costPrice || ""}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 flex flex-col justify-center">
                <span className="text-xs text-muted-foreground">Calculated Margin</span>
                <div className="text-xl font-bold">
                  <span
                    className={
                      Number(margin) >= 30
                        ? "text-emerald-600 dark:text-emerald-400"
                        : Number(margin) > 0
                        ? "text-foreground"
                        : "text-destructive"
                    }
                  >
                    {margin}%
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Profit: ₹{Math.max(0, salesPrice - costPrice).toFixed(2)} / unit
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Tracking */}
        {productType !== "SERVICE" && (
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Boxes className="size-4 text-blue-600 dark:text-blue-400" />
                Inventory & Stock Rules
              </CardTitle>
              <CardDescription>
                Configure physical stock tracking across locations and warehouses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm font-medium">
                  Track stock balances and movements for this product
                </span>
              </label>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            render={<Link href={`/dashboard/products/${productId}`} />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            <CheckCircle2 className="mr-2 size-4" />
            {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

