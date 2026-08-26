"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  Eye,
  FilePenLine,
  History,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ProductUom {
  id?: string;
  code?: string;
  name?: string;
  symbol?: string;
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  productType: "STORABLE" | "CONSUMABLE" | "SERVICE";
  salesPrice: string | number;
  costPrice: string | number;
  trackInventory: boolean;
  active: boolean;
  uom?: ProductUom | null;
  stock?: {
    onHand: number;
    reserved: number;
    available: number;
  };
  createdAt: string;
  updatedAt: string;
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
  ProductItem["productType"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  STORABLE: { label: "Storable", variant: "default" },
  CONSUMABLE: { label: "Consumable", variant: "secondary" },
  SERVICE: { label: "Service", variant: "outline" },
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const {
    data: productsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=100");
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data as ProductItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete product");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      toast.success("Product updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update product");
    },
  });

  // Filtered Products
  const products = React.useMemo(() => {
    if (!productsData) return [];
    return productsData.filter((p) => {
      const matchesTab =
        activeTab === "ALL" ||
        p.productType.toUpperCase() === activeTab ||
        (activeTab === "ACTIVE" && p.active) ||
        (activeTab === "INACTIVE" && !p.active);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [productsData, activeTab, searchQuery]);

  // KPI Calculations
  const kpis = React.useMemo(() => {
    if (!productsData) {
      return { total: 0, storable: 0, totalInventoryValue: 0, lowStock: 0 };
    }
    const total = productsData.length;
    const storable = productsData.filter((p) => p.productType === "STORABLE").length;
    const totalInventoryValue = productsData.reduce((acc, p) => {
      const onHand = p.stock?.onHand || 0;
      const cost = parseFloat(String(p.costPrice || 0));
      return acc + onHand * cost;
    }, 0);
    const lowStock = productsData.filter(
      (p) => p.trackInventory && (p.stock?.available || 0) <= 0
    ).length;

    return { total, storable, totalInventoryValue, lowStock };
  }, [productsData]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Manage goods, services, inventory tracking, bill of materials, and pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button size="sm" render={<Link href="/dashboard/products/new" />}>
            <Plus className="mr-2 size-4" />
            New Product
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-xs text-muted-foreground">All catalog items</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Physical Stock Items
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Boxes className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.storable}</div>
            <p className="text-xs text-muted-foreground">Inventory tracked products</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Valuation
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">At current cost prices</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out / Low Stock
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.lowStock}</div>
            <p className="text-xs text-muted-foreground">Requires replenishment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search product name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="STORABLE">Storable</TabsTrigger>
                <TabsTrigger value="CONSUMABLE">Consumable</TabsTrigger>
                <TabsTrigger value="SERVICE">Service</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[140px]">SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Sales Price</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-12" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="mx-auto h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="size-8 text-muted-foreground/50" />
                        <p>No products found in catalog.</p>
                        <Button
                          size="sm"
                          render={<Link href="/dashboard/products/new" />}
                        >
                          <Plus className="mr-1.5 size-3.5" />
                          Create First Product
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const typeConfig = typeBadges[product.productType] || {
                      label: product.productType,
                      variant: "secondary",
                    };

                    const salesP = parseFloat(String(product.salesPrice || 0));
                    const costP = parseFloat(String(product.costPrice || 0));
                    const margin =
                      salesP > 0
                        ? (((salesP - costP) / salesP) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-sm font-semibold">
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="text-primary hover:underline"
                          >
                            {product.sku}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="line-clamp-1 text-xs text-muted-foreground">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeConfig.variant}>
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(product.salesPrice)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(product.costPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span
                            className={
                              parseFloat(margin) >= 30
                                ? "text-emerald-600 dark:text-emerald-400"
                                : parseFloat(margin) > 0
                                ? "text-foreground"
                                : "text-destructive"
                            }
                          >
                            {margin}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                />
                              }
                            >
                              <MoreVertical className="size-4" />
                              <span className="sr-only">Actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                render={
                                  <Link href={`/dashboard/products/${product.id}`} />
                                }
                              >
                                <Eye className="mr-2 size-4 text-muted-foreground" />
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                render={
                                  <Link
                                    href={`/dashboard/products/${product.id}/edit`}
                                  />
                                }
                              >
                                <FilePenLine className="mr-2 size-4 text-muted-foreground" />
                                Edit Product
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                render={
                                  <Link
                                    href={`/dashboard/products/${product.id}/movements`}
                                  />
                                }
                              >
                                <History className="mr-2 size-4 text-muted-foreground" />
                                Stock Movements
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(product.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                {product.active ? "Deactivate" : "Delete Product"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

