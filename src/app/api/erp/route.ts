import { NextRequest, NextResponse } from "next/server";
import { initialErpState } from "@/lib/seed-data";
import {
  confirmSalesOrder,
  deliverSalesOrder,
  receivePurchaseOrder,
  completeManufacturingOrder,
  addProduct,
  createSalesOrder,
  createPurchaseOrder,
  createManufacturingOrder,
  resetErpState,
} from "@/lib/erp-engine";
import { ErpState } from "@/lib/types";

// Server In-Memory State Cache
let serverState: ErpState = initialErpState;

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: serverState,
      message: "Shiv Furniture ERP state loaded successfully",
    });
  } catch (error) {
    console.error("Error fetching ERP state:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, soId, poId, moId, userName, product, soData, poData, moData } = body;

    if (action === 'confirm_sales_order') {
      const res = confirmSalesOrder(serverState, soId, userName || 'Sales Manager');
      serverState = res.state;
      return NextResponse.json({
        success: true,
        data: serverState,
        triggeredMOs: res.triggeredMOs,
        triggeredPOs: res.triggeredPOs,
      });
    }

    if (action === 'deliver_sales_order') {
      serverState = deliverSalesOrder(serverState, soId, userName || 'Inventory Manager');
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'receive_purchase_order') {
      serverState = receivePurchaseOrder(serverState, poId, userName || 'Purchase Manager');
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'complete_manufacturing_order') {
      serverState = completeManufacturingOrder(serverState, moId, userName || 'Manufacturing Lead');
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'add_product') {
      serverState = addProduct(serverState, product);
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'create_sales_order') {
      serverState = createSalesOrder(serverState, soData);
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'create_purchase_order') {
      serverState = createPurchaseOrder(serverState, poData);
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'create_manufacturing_order') {
      serverState = createManufacturingOrder(serverState, moData);
      return NextResponse.json({ success: true, data: serverState });
    }

    if (action === 'reset_data') {
      serverState = initialErpState;
      return NextResponse.json({ success: true, data: serverState });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing ERP transaction:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
