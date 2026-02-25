/**
 * Shiprocket API Integration
 * Documentation: https://apidocs.shiprocket.in/
 */

// API Configuration
const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = 'YOUR_EMAIL_HERE';
const SHIPROCKET_PASSWORD = 'YOUR_PASSWORD_HERE';

// Types
export interface ShiprocketAuthResponse {
  token: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
}

export interface ShiprocketOrder {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: number;
  }>;
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketShipment {
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
}

export interface TrackingStatus {
  current_status: string;
  shipment_status: number;
  shipment_track: Array<{
    id: number;
    awb_code: string;
    courier_company_id: number;
    shipment_id: number;
    order_id: number;
    pickup_date: string;
    delivered_date: string;
    weight: string;
    packages: number;
    current_status: string;
    delivered_to: string;
    destination: string;
    consignee_name: string;
    origin: string;
    courier_agent_details: string;
    edd: string;
  }>;
  shipment_track_activities: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
    'sr-status': string;
    'sr-status-label': string;
  }>;
}

/**
 * Authenticate with Shiprocket and get token
 */
export async function authenticateShiprocket(): Promise<string> {
  try {
    const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Shiprocket');
    }

    const data: ShiprocketAuthResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error('Shiprocket authentication error:', error);
    throw error;
  }
}

/**
 * Create a new order in Shiprocket
 */
export async function createShiprocketOrder(
  token: string,
  orderData: ShiprocketOrder
): Promise<any> {
  try {
    const response = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order in Shiprocket');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket create order error:', error);
    throw error;
  }
}

/**
 * Get available couriers for a shipment
 */
export async function getAvailableCouriers(
  token: string,
  pickupPostcode: string,
  deliveryPostcode: string,
  weight: number,
  cod: boolean
): Promise<any> {
  try {
    const response = await fetch(
      `${SHIPROCKET_API_BASE}/courier/serviceability?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${weight}&cod=${cod ? 1 : 0}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch available couriers');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket get couriers error:', error);
    throw error;
  }
}

/**
 * Generate AWB (Air Waybill) for shipment
 */
export async function generateAWB(
  token: string,
  shipmentId: number,
  courierId: number
): Promise<ShiprocketShipment> {
  try {
    const response = await fetch(`${SHIPROCKET_API_BASE}/courier/assign/awb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: shipmentId,
        courier_id: courierId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AWB');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket generate AWB error:', error);
    throw error;
  }
}

/**
 * Request pickup for shipment
 */
export async function schedulePickup(
  token: string,
  shipmentId: number
): Promise<any> {
  try {
    const response = await fetch(`${SHIPROCKET_API_BASE}/courier/generate/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [shipmentId],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule pickup');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket schedule pickup error:', error);
    throw error;
  }
}

/**
 * Track shipment by AWB code
 */
export async function trackShipment(
  token: string,
  awbCode: string
): Promise<TrackingStatus> {
  try {
    const response = await fetch(
      `${SHIPROCKET_API_BASE}/courier/track/awb/${awbCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to track shipment');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket track shipment error:', error);
    throw error;
  }
}

/**
 * Get shipment tracking via Shiprocket ID
 */
export async function trackShipmentById(
  token: string,
  shipmentId: number
): Promise<any> {
  try {
    const response = await fetch(
      `${SHIPROCKET_API_BASE}/courier/track/shipment/${shipmentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to track shipment by ID');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket track shipment by ID error:', error);
    throw error;
  }
}

/**
 * Cancel a shipment
 */
export async function cancelShipment(
  token: string,
  shipmentId: number
): Promise<any> {
  try {
    const response = await fetch(`${SHIPROCKET_API_BASE}/orders/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: [shipmentId],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel shipment');
    }

    return await response.json();
  } catch (error) {
    console.error('Shiprocket cancel shipment error:', error);
    throw error;
  }
}

/**
 * Example usage for creating and dispatching an order
 */
export async function dispatchOrderViaShiprocket(orderDetails: any) {
  try {
    // Step 1: Authenticate
    const token = await authenticateShiprocket();

    // Step 2: Create order
    const orderData: ShiprocketOrder = {
      order_id: orderDetails.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary', // Your pickup location name in Shiprocket
      billing_customer_name: orderDetails.customerName.split(' ')[0],
      billing_last_name: orderDetails.customerName.split(' ')[1] || '',
      billing_address: orderDetails.address,
      billing_city: orderDetails.city,
      billing_pincode: orderDetails.pincode,
      billing_state: orderDetails.state,
      billing_country: 'India',
      billing_email: orderDetails.email,
      billing_phone: orderDetails.phone,
      shipping_is_billing: true,
      order_items: orderDetails.items.map((item: any) => ({
        name: item.name,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: orderDetails.paymentMethod,
      sub_total: orderDetails.totalAmount,
      length: 10, // in cm
      breadth: 10, // in cm
      height: 10, // in cm
      weight: orderDetails.weight || 1, // in kg
    };

    const createdOrder = await createShiprocketOrder(token, orderData);

    // Step 3: Get available couriers
    const couriers = await getAvailableCouriers(
      token,
      '400001', // Your warehouse pincode
      orderDetails.pincode,
      orderData.weight,
      orderDetails.paymentMethod === 'COD'
    );

    // Step 4: Generate AWB with best courier
    const bestCourier = couriers.data.available_courier_companies[0];
    const awbData = await generateAWB(
      token,
      createdOrder.shipment_id,
      bestCourier.courier_company_id
    );

    // Step 5: Schedule pickup
    await schedulePickup(token, createdOrder.shipment_id);

    return {
      success: true,
      shipmentId: createdOrder.shipment_id,
      awbCode: awbData.awb_code,
      courierName: bestCourier.courier_name,
      estimatedDelivery: bestCourier.etd,
    };
  } catch (error) {
    console.error('Failed to dispatch order via Shiprocket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get live tracking updates
 */
export async function getLiveTracking(awbCode: string) {
  try {
    const token = await authenticateShiprocket();
    const trackingData = await trackShipment(token, awbCode);
    
    return {
      success: true,
      currentStatus: trackingData.current_status,
      activities: trackingData.shipment_track_activities.map(activity => ({
        date: activity.date,
        status: activity['sr-status-label'],
        location: activity.location,
        activity: activity.activity,
      })),
    };
  } catch (error) {
    console.error('Failed to get live tracking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
