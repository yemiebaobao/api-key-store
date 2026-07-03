import crypto from "crypto";

const XORPAY_API = "https://api.xorpay.com/api/order/create";

export function getConfig() {
  const appid = process.env.XORPAY_APPID;
  const appsecret = process.env.XORPAY_APPSECRET;
  return { appid, appsecret, configured: !!(appid && appsecret) };
}

export async function createOrder(options: {
  price: number;
  orderId: string;
  notifyUrl: string;
}): Promise<{ qrCode: string; payUrl: string; orderId: string } | null> {
  const { appid, appsecret, configured } = getConfig();
  if (!configured) return null;

  const params = new URLSearchParams();
  params.set("pay_type", "alipay");
  params.set("price", options.price.toFixed(2));
  params.set("order_id", options.orderId);
  params.set("notify_url", options.notifyUrl);
  params.set("return_url", process.env.NEXT_PUBLIC_APP_URL + "/dashboard?bought=true");
  params.set("appid", appid || "");
  params.set("appsecret", appsecret || "");

  try {
    const res = await fetch(XORPAY_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const json = await res.json();
    if (json.status === 0 && json.data) {
      return {
        qrCode: json.data.qr_code || "",
        payUrl: json.data.pay_url || "",
        orderId: json.data.order_id || options.orderId,
      };
    }
    console.error("XorPay error:", json);
    return null;
  } catch (e) {
    console.error("XorPay request failed:", e);
    return null;
  }
}

export function verifySign(params: Record<string, string>, appsecret: string): boolean {
  // sign = md5(appsecret + order_id + price + pay_type + trade_no + trade_status)
  const signStr = appsecret + (params.order_id || "") + (params.price || "") + (params.pay_type || "") + (params.trade_no || "") + (params.trade_status || "");
  const expected = crypto.createHash("md5").update(signStr).digest("hex");
  return expected === params.sign;
}