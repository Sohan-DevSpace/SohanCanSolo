import axios from 'axios'

const QIKINK_API_URL = process.env.QIKINK_API_URL || 'https://api.qikink.com'

let cachedToken: string | null = null
let cachedClientId: string | null = null
let tokenExpiry: number | null = null

export async function getQikinkToken(): Promise<{ Accesstoken: string; ClientId: string }> {
  // Return cached token if still valid
  if (cachedToken && cachedClientId && tokenExpiry && Date.now() < tokenExpiry) {
    return { Accesstoken: cachedToken, ClientId: cachedClientId }
  }

  const clientId = process.env.QIKINK_CLIENT_ID
  const clientSecret = process.env.QIKINK_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('QIKINK_CLIENT_ID and QIKINK_CLIENT_SECRET are required')
  }

  const params = new URLSearchParams()
  params.append('ClientId', clientId)
  params.append('client_secret', clientSecret)

  const response = await axios.post(`${QIKINK_API_URL}/api/token`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  const token = response.data?.Accesstoken || response.data?.access_token
  const returnedClientId = response.data?.ClientId?.toString() || clientId

  if (!token) {
    throw new Error(response.data?.error || 'Qikink token response format invalid')
  }

  cachedToken = token
  cachedClientId = returnedClientId
  const expiresIn = response.data.expires_in ? parseInt(response.data.expires_in) : 3600
  // Refresh 10 minutes before expiry
  tokenExpiry = Date.now() + (expiresIn - 600) * 1000


  return { Accesstoken: token, ClientId: returnedClientId }
}

export async function getQikinkClient() {
  const auth = await getQikinkToken()
  return axios.create({
    baseURL: QIKINK_API_URL,
    headers: {
      // Qikink requires these exact header names (case-sensitive)
      'ClientId': auth.ClientId,
      'Accesstoken': auth.Accesstoken,
      'Content-Type': 'application/json',
    }
  })
}

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface QikinkDesignItem {
  design_code: string
  placement_sku: 'fr' | 'bk' | 'lp' | 'rp' | 'ls' | 'rs'
  mockup_link: string
  design_link: string
  width_inches: number
  height_inches: number
}

export interface QikinkLineItem {
  search_from_my_products: 0 | 1
  /** Must match the exact SKU string from the Qikink catalog */
  sku: string
  quantity: number
  price: number
  print_type_id?: number
  designs?: QikinkDesignItem[]
  image_front?: string
  mockup_front?: string
  image_back?: string
  mockup_back?: string
}

export interface QikinkShippingAddress {
  first_name: string
  last_name: string
  phone: string
  email: string
  address1: string
  address2?: string
  city: string
  /** State/Province name */
  province: string
  zip: string
  /** ISO 3166-1 alpha-2 country code, e.g. 'IN' */
  country_code: string
}

export interface QikinkOrderPayload {
  /** Max 15 alphanumeric characters, no special characters */
  order_number: string
  /** 1 = Qikink handles shipping */
  qikink_shipping: 1
  /** 'Prepaid' or 'COD' */
  gateway: 'Prepaid' | 'COD'
  total_order_value: number
  line_items: QikinkLineItem[]
  shipping_address: QikinkShippingAddress
}

// ── API Methods ───────────────────────────────────────────────────────────

export async function createQikinkOrder(payload: QikinkOrderPayload) {
  try {
    const client = await getQikinkClient()
    const response = await client.post('/api/order/create', payload)
    return response.data
  } catch (error: unknown) {
    const errObj = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
    console.error('[Qikink] Create order error:', errObj.response?.data || errObj.message)
    throw new Error(
      errObj.response?.data?.error || errObj.response?.data?.message || 'Failed to create order on Qikink'
    )
  }
}

export async function getQikinkOrderStatus(qikinkOrderId: string) {
  try {
    const client = await getQikinkClient()
    const response = await client.get('/api/order', {
      params: { order_id: qikinkOrderId }
    })
    const order = Array.isArray(response.data) ? response.data[0] : response.data?.orders?.[0]
    return {
      status: order?.status || 'Unknown',
      tracking_url: order?.tracking_url || null,
      tracking_number: order?.tracking_number || null,
    }
  } catch (error: unknown) {
    const errObj = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
    console.error('[Qikink] Get order status error:', errObj.response?.data || errObj.message)
    throw new Error('Failed to fetch Qikink order status')
  }
}

/**
 * Converts our internal order number to a Qikink-compatible format:
 * - Max 15 characters
 * - Alphanumeric only (no special characters like - or _)
 */
export function toQikinkOrderNumber(orderNumber: string): string {
  return orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-15)
}
