"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  XCircle,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface Customer {
  id: string;
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  shippingAddressLine1?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
}

interface SalesOrderLine {
  id: string;
  productId: string;
  sku?: string;
  productName?: string;
  description: string;
  orderedQuantity: string | number;
  reservedQuantity?: string | number;
  deliveredQuantity?: string | number;
  unitPrice: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  lineTotal: string | number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "CONFIRMED" | "PARTIALLY_DELIVERED" | "DELIVERED" | "CANCELLED";
  orderDate: string;
  expectedDeliveryDate?: string | null;
  currencyCode: string;
  subtotal: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  grandTotal: string | number;
  notes?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  lines?: SalesOrderLine[];
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  salesPrice: string | number;
}

const statusBadges: Record<
  SalesOrder["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  PARTIALLY_DELIVERED: { label: "Partially Delivered", variant: "outline" },
  DELIVERED: { label: "Delivered", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

function formatCurrency(amount: string | number, currency = "INR") {
  const num = typeof amount === "number" ? amount : parseFloat(amount || "0");
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SalesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Form State for New Sales Order
  const [newCustomerName, setNewCustomerName] = React.useState("");
  const [newExpectedDate, setNewExpectedDate] = React.useState("");
  const [newNotes, setNewNotes] = React.useState("");
  const [newLines, setNewLines] = React.useState<
    Array<{
      productId: string;
      orderedQuantity: number;
      unitPrice: number;
      discountAmount: number;
      taxAmount: number;
    }>
  >([
    {
      productId: "",
      orderedQuantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      taxAmount: 0,
    },
  ]);

  // Fetch Sales Orders
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isRefetching: isRefetchingSales,
    refetch: refetchSales,
  } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: async () => {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error("Failed to fetch sales orders");
      const json = await res.json();
      return json.data as SalesOrder[];
    },
  });

  // Fetch Products for line creation
  const { data: productsData } = useQuery({
    queryKey: ["products-options"],
    queryFn: async () => {
      const res = await fetch("/api/products?active=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data as ProductOption[];
    },
  });

  // Fetch Selected Order Details when opened
  const { data: selectedOrder, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["sales-order-detail", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      const res = await fetch(`/api/sales?id=${selectedOrderId}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      const json = await res.json();
      return json.data as SalesOrder;
    },
    enabled: Boolean(selectedOrderId && isDetailsOpen),
  });

  // Mutation: Create Order
  const createOrderMutation = useMutation({
    mutationFn: async (payload: {
      customerName?: string;
      expectedDeliveryDate?: string;
      notes?: string;
      lines: Array<{
        productId: string;
        orderedQuantity: number;
        unitPrice: number;
        discountAmount: number;
        taxAmount: number;
      }>;
    }) => {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create sales order");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast.success("Sales order created successfully");
      setIsCreateOpen(false);
      // Reset form
      setNewCustomerName("");
      setNewExpectedDate("");
      setNewNotes("");
      setNewLines([
        {
          productId: "",
          orderedQuantity: 1,
          unitPrice: 0,
          discountAmount: 0,
          taxAmount: 0,
        },
      ]);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create order");
    },
  });

  // Mutation: Update Status (Confirm / Deliver / Cancel)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SalesOrder["status"] }) => {
      const res = await fetch(`/api/sales?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update order status");
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      if (selectedOrderId) {
        queryClient.invalidateQueries({ queryKey: ["sales-order-detail", selectedOrderId] });
      }
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update order");
    },
  });

  // Mutation: Delete Order
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sales?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete order");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      setIsDetailsOpen(false);
      toast.success("Sales order deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete order");
    },
  });

  // Filtered list
  const orders = React.useMemo(() => {
    if (!salesData) return [];
    return salesData.filter((order) => {
      const matchesTab =
        activeTab === "ALL" || order.status.toUpperCase() === activeTab;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer?.name.toLowerCase().includes(q) ||
        order.customer?.code?.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [salesData, activeTab, searchQuery]);

  // KPI Calculations
  const kpis = React.useMemo(() => {
    if (!salesData) {
      return { totalOrders: 0, totalRevenue: 0, pendingDelivery: 0, draftCount: 0 };
    }
    const totalOrders = salesData.length;
    const totalRevenue = salesData
      .filter((o) => o.status === "CONFIRMED" || o.status === "DELIVERED")
      .reduce((acc, o) => acc + parseFloat(String(o.grandTotal || 0)), 0);
    const pendingDelivery = salesData.filter(
      (o) => o.status === "CONFIRMED" || o.status === "PARTIALLY_DELIVERED"
    ).length;
    const draftCount = salesData.filter((o) => o.status === "DRAFT").length;

    return { totalOrders, totalRevenue, pendingDelivery, draftCount };
  }, [salesData]);

  // Line calculations for creation
  const createdSubtotal = newLines.reduce(
    (acc, l) => acc + (l.orderedQuantity || 0) * (l.unitPrice || 0),
    0
  );
  const createdDiscount = newLines.reduce((acc, l) => acc + (l.discountAmount || 0), 0);
  const createdTax = newLines.reduce((acc, l) => acc + (l.taxAmount || 0), 0);
  const createdGrandTotal = Math.max(0, createdSubtotal - createdDiscount + createdTax);

  const handleProductSelect = (index: number, productId: string) => {
    const selected = productsData?.find((p) => p.id === productId);
    const price = selected ? parseFloat(String(selected.salesPrice || 0)) : 0;
    setNewLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              productId,
              unitPrice: price,
            }
          : line
      )
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = newLines.filter(
      (l) => l.productId && l.orderedQuantity > 0
    );
    if (validLines.length === 0) {
      toast.error("Please select at least one product with quantity > 0");
      return;
    }

    createOrderMutation.mutate({
      customerName: newCustomerName.trim() || undefined,
      expectedDeliveryDate: newExpectedDate ? new Date(newExpectedDate).toISOString() : undefined,
      notes: newNotes.trim() || undefined,
      lines: validLines,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage quotations, confirm orders, and track fulfillment workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSales()}
            disabled={isLoadingSales || isRefetchingSales}
          >
            <RefreshCw
              className={`mr-2 size-4 ${isRefetchingSales ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Sales Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All generated orders</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed Revenue
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed & delivered volume</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Delivery
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Truck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingDelivery}</div>
            <p className="text-xs text-muted-foreground">Ready for dispatch</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft Quotations
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.draftCount}</div>
            <p className="text-xs text-muted-foreground">Pending confirmation</p>
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
                placeholder="Search order #, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 sm:grid-cols-6">
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="DRAFT">Draft</TabsTrigger>
                <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
                <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
                <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSales ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="size-8 text-muted-foreground/50" />
                        <p>No sales orders found matching your filters.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("ALL");
                            setSearchQuery("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const badge = statusBadges[order.status] || {
                      label: order.status,
                      variant: "secondary",
                    };

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsDetailsOpen(true);
                            }}
                            className="font-mono text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {order.customer?.name || "Retail Customer"}
                            </div>
                            {order.customer?.code && (
                              <div className="text-xs text-muted-foreground">
                                {order.customer.code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.expectedDeliveryDate)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.grandTotal, order.currencyCode)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
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
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <Eye className="mr-2 size-4 text-muted-foreground" />
                                View Details
                              </DropdownMenuItem>

                              {order.status === "DRAFT" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: order.id,
                                      status: "CONFIRMED",
                                    })
                                  }
                                >
                                  <CheckCircle2 className="mr-2 size-4 text-emerald-600" />
                                  Confirm Order
                                </DropdownMenuItem>
                              )}

                              {order.status === "CONFIRMED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: order.id,
                                      status: "DELIVERED",
                                    })
                                  }
                                >
                                  <Truck className="mr-2 size-4 text-primary" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}

                              {order.status !== "CANCELLED" &&
                                order.status !== "DELIVERED" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: order.id,
                                        status: "CANCELLED",
                                      })
                                    }
                                  >
                                    <XCircle className="mr-2 size-4 text-destructive" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}

                              {order.status === "DRAFT" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                      deleteOrderMutation.mutate(order.id)
                                    }
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete Order
                                  </DropdownMenuItem>
                                </>
                              )}
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

      {/* Order Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between pr-6">
              <SheetTitle>Order Details</SheetTitle>
              {selectedOrder && (
                <Badge
                  variant={
                    statusBadges[selectedOrder.status]?.variant || "secondary"
                  }
                >
                  {statusBadges[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              )}
            </div>
            <SheetDescription>
              {selectedOrder?.orderNumber || "Loading sales order details..."}
            </SheetDescription>
          </SheetHeader>

          {isLoadingDetails || !selectedOrder ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Customer</span>
                  <div className="font-semibold">{selectedOrder.customer?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedOrder.customer?.email || "No email"}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Order Date</span>
                  <div className="font-medium">{formatDate(selectedOrder.orderDate)}</div>
                  <span className="text-xs text-muted-foreground">Expected:</span>{" "}
                  <span className="text-xs font-medium">
                    {formatDate(selectedOrder.expectedDeliveryDate)}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="rounded-lg border p-3">
                <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Timeline
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  {selectedOrder.confirmedAt && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Confirmed:</span>
                      <span>{new Date(selectedOrder.confirmedAt).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedOrder.cancelledAt && (
                    <div className="flex justify-between text-destructive">
                      <span>Cancelled:</span>
                      <span>{new Date(selectedOrder.cancelledAt).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Lines */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">Order Items</h4>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.lines && selectedOrder.lines.length > 0 ? (
                        selectedOrder.lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <div className="font-medium">
                                {line.productName || line.description}
                              </div>
                              {line.sku && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {line.sku}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {parseFloat(String(line.orderedQuantity))}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(line.unitPrice, selectedOrder.currencyCode)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(line.lineTotal, selectedOrder.currencyCode)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No line items recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="space-y-1.5 rounded-lg border bg-muted/20 p-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal, selectedOrder.currencyCode)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount:</span>
                  <span>- {formatCurrency(selectedOrder.discountTotal, selectedOrder.currencyCode)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span>+ {formatCurrency(selectedOrder.taxTotal, selectedOrder.currencyCode)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold text-foreground">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedOrder.grandTotal, selectedOrder.currencyCode)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.status === "DRAFT" && (
                  <Button
                    className="flex-1"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedOrder.id,
                        status: "CONFIRMED",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Confirm Order
                  </Button>
                )}

                {selectedOrder.status === "CONFIRMED" && (
                  <Button
                    className="flex-1"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedOrder.id,
                        status: "DELIVERED",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <Truck className="mr-2 size-4" />
                    Mark as Delivered
                  </Button>
                )}

                {selectedOrder.status !== "CANCELLED" &&
                  selectedOrder.status !== "DELIVERED" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: selectedOrder.id,
                          status: "CANCELLED",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="mr-2 size-4" />
                      Cancel
                    </Button>
                  )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Sales Order Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Sales Order</SheetTitle>
            <SheetDescription>
              Create a new customer sales order with line items and automatic totals calculation.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5 p-4">
            {/* Header Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Customer Name</label>
                <Input
                  placeholder="e.g. Acme Corporation"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Expected Delivery Date
                </label>
                <Input
                  type="date"
                  value={newExpectedDate}
                  onChange={(e) => setNewExpectedDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Order Notes / Terms</label>
              <Input
                placeholder="Optional customer reference or delivery instructions"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Line Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Order Items</h4>
                  <p className="text-xs text-muted-foreground">
                    Select products, set quantities, and adjust line pricing.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNewLines((prev) => [
                      ...prev,
                      {
                        productId: "",
                        orderedQuantity: 1,
                        unitPrice: 0,
                        discountAmount: 0,
                        taxAmount: 0,
                      },
                    ])
                  }
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add Product
                </Button>
              </div>

              {productsData && productsData.length === 0 && (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <span>No products found in catalog. Please create a product first.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    render={<a href="/dashboard/products/new" target="_blank" rel="noreferrer" />}
                  >
                    + New Product
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {newLines.map((line, index) => {
                  const selectedProduct = productsData?.find((p) => p.id === line.productId);
                  const rowGross = (line.orderedQuantity || 0) * (line.unitPrice || 0);
                  const rowDiscount = Math.min(line.discountAmount || 0, rowGross);
                  const rowTax = line.taxAmount || 0;
                  const rowTotal = Math.max(0, rowGross - rowDiscount + rowTax);

                  return (
                    <div
                      key={index}
                      className="relative rounded-xl border bg-card p-3 shadow-xs transition-colors hover:border-foreground/20"
                    >
                      {/* Row Top: Product selector & Remove */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-foreground">
                            Product Item #{index + 1}
                          </label>
                          <select
                            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={line.productId}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                            required
                          >
                            <option value="">Select a product from catalog...</option>
                            {productsData?.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — {formatCurrency(p.salesPrice)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newLines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-5 size-8 text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setNewLines((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        )}
                      </div>

                      {/* Row Middle: Qty, Unit Price & Live Row Total */}
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Quantity</label>
                          <div className="mt-1 flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0"
                              onClick={() =>
                                setNewLines((prev) =>
                                  prev.map((l, i) =>
                                    i === index
                                      ? {
                                          ...l,
                                          orderedQuantity: Math.max(1, (l.orderedQuantity || 1) - 1),
                                        }
                                      : l
                                  )
                                )
                              }
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="0.0001"
                              step="any"
                              value={line.orderedQuantity}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setNewLines((prev) =>
                                  prev.map((l, i) =>
                                    i === index
                                      ? { ...l, orderedQuantity: isNaN(val) ? 0 : val }
                                      : l
                                  )
                                );
                              }}
                              className="h-8 text-center"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0"
                              onClick={() =>
                                setNewLines((prev) =>
                                  prev.map((l, i) =>
                                    i === index
                                      ? { ...l, orderedQuantity: (l.orderedQuantity || 0) + 1 }
                                      : l
                                  )
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">Unit Price (₹)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setNewLines((prev) =>
                                prev.map((l, i) =>
                                  i === index
                                    ? { ...l, unitPrice: isNaN(val) ? 0 : val }
                                    : l
                                )
                              );
                            }}
                            className="mt-1 h-8"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">Discount (₹)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.discountAmount}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setNewLines((prev) =>
                                prev.map((l, i) =>
                                  i === index
                                    ? { ...l, discountAmount: isNaN(val) ? 0 : val }
                                    : l
                                )
                              );
                            }}
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">Tax (₹)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.taxAmount}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setNewLines((prev) =>
                                prev.map((l, i) =>
                                  i === index
                                    ? { ...l, taxAmount: isNaN(val) ? 0 : val }
                                    : l
                                )
                              );
                            }}
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>

                      {/* Row Footer: Metadata & Row Total Badge */}
                      <div className="mt-2.5 flex items-center justify-between border-t pt-2 text-xs">
                        <div className="text-muted-foreground">
                          {selectedProduct ? (
                            <span>
                              SKU: <span className="font-mono">{selectedProduct.sku}</span>
                            </span>
                          ) : (
                            <span className="italic">No product selected</span>
                          )}
                        </div>
                        <div className="font-medium">
                          Line Total:{" "}
                          <span className="font-semibold text-foreground">
                            {formatCurrency(rowTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="space-y-1.5 rounded-lg border bg-muted/20 p-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(createdSubtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Discount Total:</span>
                <span>- {formatCurrency(createdDiscount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax Total:</span>
                <span>+ {formatCurrency(createdTax)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold text-foreground">
                <span>Grand Total:</span>
                <span>{formatCurrency(createdGrandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? "Creating Order..." : "Create Order"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}


