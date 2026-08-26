"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Factory,
  ShieldCheck,
  ShoppingCart,
  Trash2,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationItem {
  id: string;
  category: "INVENTORY" | "SALES" | "MANUFACTURING" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    category: "INVENTORY",
    title: "Low Stock Alert: Ergonomic Desk",
    message: "SKU PRD-1002 stock level (3 pcs) has fallen below the safety threshold of 10 pcs.",
    timestamp: "10 mins ago",
    read: false,
    actionUrl: "/dashboard/products",
    actionLabel: "View Stock",
  },
  {
    id: "notif-2",
    category: "SALES",
    title: "New Sales Order #SO-2026-004 Confirmed",
    message: "Quotation has been approved by customer Reliance Retail for ₹1,85,000.",
    timestamp: "45 mins ago",
    read: false,
    actionUrl: "/dashboard/sales",
    actionLabel: "View Sales Order",
  },
  {
    id: "notif-3",
    category: "MANUFACTURING",
    title: "Work Order Completed: WO-8001",
    message: "Production run of 50 units finished at Assembly Station 1. Ready for Quality Check.",
    timestamp: "2 hours ago",
    read: true,
    actionUrl: "/dashboard/manufacturing",
    actionLabel: "Inspect Work Order",
  },
  {
    id: "notif-4",
    category: "INVENTORY",
    title: "Stock Movement Recorded",
    message: "Transfer of 100 units Raw Steel Tubes from Main Warehouse to Manufacturing Bay.",
    timestamp: "5 hours ago",
    read: true,
    actionUrl: "/dashboard/inventory",
    actionLabel: "View Movements",
  },
  {
    id: "notif-5",
    category: "SYSTEM",
    title: "Role Assigned: Sales Specialist",
    message: "Administrator has granted you Sales operational access permissions.",
    timestamp: "1 day ago",
    read: true,
    actionUrl: "/admin/roles",
    actionLabel: "View Role Scope",
  },
];

const categoryTheme: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; colorClass: string; bgClass: string; badgeVariant: "default" | "secondary" | "outline" }
> = {
  INVENTORY: {
    icon: AlertTriangle,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    badgeVariant: "secondary",
  },
  SALES: {
    icon: ShoppingCart,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    badgeVariant: "default",
  },
  MANUFACTURING: {
    icon: Factory,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
    badgeVariant: "secondary",
  },
  SYSTEM: {
    icon: ShieldCheck,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
    badgeVariant: "outline",
  },
};

export default function NotificationPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications);
  const [filterCategory, setFilterCategory] = React.useState<string>("ALL");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (filterCategory === "ALL") return true;
      if (filterCategory === "UNREAD") return !n.read;
      return n.category === filterCategory;
    });
  }, [notifications, filterCategory]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notification removed");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time alerts, stock warnings, sales approvals, and production updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-1.5 size-4" />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          value={filterCategory}
          onValueChange={setFilterCategory}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="ALL">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="UNREAD">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="INVENTORY">Inventory</TabsTrigger>
            <TabsTrigger value="SALES">Sales</TabsTrigger>
            <TabsTrigger value="MANUFACTURING">Mfg</TabsTrigger>
            <TabsTrigger value="SYSTEM">System</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="border bg-card shadow-xs">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <BellOff className="size-6 text-muted-foreground/60" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">No notifications</h3>
              <p className="text-xs mt-1">You are all caught up with your alerts.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const theme = categoryTheme[notif.category] || categoryTheme.SYSTEM;
            const Icon = theme.icon;

            return (
              <Card
                key={notif.id}
                className={`border bg-card shadow-xs transition-all ${
                  notif.read ? "opacity-80" : "border-primary/30 ring-1 ring-primary/10"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${theme.bgClass} ${theme.colorClass} mt-0.5`}
                      >
                        <Icon className="size-4.5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="size-2 rounded-full bg-primary" />
                          )}
                          <Badge variant={theme.badgeVariant} className="text-[10px]">
                            {notif.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[11px] text-muted-foreground font-mono block pt-0.5">
                          {notif.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {notif.actionUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs hidden sm:inline-flex"
                          render={<Link href={notif.actionUrl} />}
                        >
                          <span>{notif.actionLabel || "View"}</span>
                          <ArrowRight className="ml-1 size-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleToggleRead(notif.id)}
                        title={notif.read ? "Mark as unread" : "Mark as read"}
                      >
                        <Check className={`size-4 ${notif.read ? "text-muted-foreground" : "text-primary font-bold"}`} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(notif.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Preferences Section */}
      <Card className="border bg-card shadow-xs mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Alert Channel Preferences
          </CardTitle>
          <CardDescription>
            Choose how you wish to receive ERP notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex items-center justify-between border-b pb-2.5">
            <div>
              <div className="font-semibold text-foreground">Critical Low Stock Warnings</div>
              <p className="text-muted-foreground">Receive instant alerts when inventory falls below minimum reorder point.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-4 rounded border-input text-primary" />
          </div>

          <div className="flex items-center justify-between border-b pb-2.5">
            <div>
              <div className="font-semibold text-foreground">Sales Order Approvals</div>
              <p className="text-muted-foreground">Notify when quotations are confirmed into active sales orders.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-4 rounded border-input text-primary" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">Manufacturing Work Order Finished</div>
              <p className="text-muted-foreground">Receive updates when production stages finish at workstations.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-4 rounded border-input text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

