"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  DollarSign,
  Package,
  Sparkles,
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

export default function NewProductPage() {
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

  // Auto generate SKU
  const generateSku = () => {
    const prefix = name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 4)
      : "PRD";
    const random = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${random}`);
  };

  // Real-time margin
  const margin = React.useMemo(() => {
    if (salesPrice <= 0) return 0;
    return (((salesPrice - costPrice) / salesPrice) * 100).toFixed(1);
  }, [salesPrice, costPrice]);

  const createMutation = useMutation({
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
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create product");
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      toast.success("Product created successfully!");
      if (data?.id) {
        router.push(`/dashboard/products/${data.id}`);
      } else {
        router.push("/dashboard/products");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      toast.error("Please provide both product name and SKU");
      return;
    }

    createMutation.mutate({
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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Products Catalog
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
            <p className="text-sm text-muted-foreground">
              Define a new physical storable good, consumable item, or service in your ERP system.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Information */}
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    SKU / Product Code <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Sparkles className="size-3" />
                    Auto Generate
                  </button>
                </div>
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
                <span className="text-[11px] text-muted-foreground">Default customer invoice rate</span>
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
                <span className="text-[11px] text-muted-foreground">Purchase or manufacturing cost</span>
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
              <p className="mt-1 ml-6.5 text-xs text-muted-foreground">
                When enabled, deliveries and manufacturing orders will reserve and deduct stock from inventory.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/dashboard/products" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            <CheckCircle2 className="mr-2 size-4" />
            {createMutation.isPending ? "Creating Product..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

