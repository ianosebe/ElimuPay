import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Handle STK Push Request from Frontend
    if (action === 'stk_push') {
      const { phone, amount, student_id } = body;
      
      const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
      const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
      const passkey = Deno.env.get('MPESA_PASSKEY');
      const shortcode = Deno.env.get('MPESA_SHORTCODE'); // usually 174379 for sandbox
      const callbackUrl = Deno.env.get('MPESA_CALLBACK_URL'); // e.g., https://<project>.supabase.co/functions/v1/mpesa

      // 1a. Generate OAuth Token
      const auth = btoa(`${consumerKey}:${consumerSecret}`);
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 1b. Generate Password and Timestamp
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = btoa(`${shortcode}${passkey}${timestamp}`);

      // Format phone number to start with 254
      let formattedPhone = phone.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.slice(1)}`;
      } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.slice(1);
      }

      // 1c. Trigger STK Push
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: student_id,
        TransactionDesc: "School Fees Payment"
      };

      const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      });
      
      const stkData = await stkResponse.json();

      return new Response(
        JSON.stringify(stkData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Handle STK Callback from Safaricom (Webhook)
    if (body.Body && body.Body.stkCallback) {
      const callbackData = body.Body.stkCallback;
      
      if (callbackData.ResultCode === 0) {
        // Payment successful!
        const callbackItems = callbackData.CallbackMetadata.Item;
        
        let amount = 0;
        let mpesaReceipt = '';
        let phone = '';

        callbackItems.forEach((item: any) => {
          if (item.Name === 'Amount') amount = item.Value;
          if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = item.Value;
          if (item.Name === 'PhoneNumber') phone = item.Value;
        });

        // Initialize Supabase admin client to bypass RLS
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // NOTE: In production, you would map the transaction back to the student_id 
        // using the CheckoutRequestID or AccountReference saved previously.
        // For this demo, we'll extract it from your custom logic or just insert it.
        
        // This requires a pending_transactions table or similar to track CheckoutRequestID -> student_id.
        // For simplicity in this example, we insert a raw transaction which an admin can reconcile,
        // or if you pass the student_id in a separate way.
        
        console.log(`Payment success: ${amount} from ${phone}, receipt: ${mpesaReceipt}`);
        
        await supabaseAdmin.from('transactions').insert([{
          amount: amount,
          method: 'mpesa_stk',
          type: 'credit',
          reference: mpesaReceipt,
          // student_id: ... you would link this back using the CheckoutRequestID mapping
        }]);
      } else {
        console.log(`Payment failed or cancelled: ${callbackData.ResultDesc}`);
      }

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { headers: corsHeaders, status: 400 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
