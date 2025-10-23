import { IntakePayload } from "@/components/types";

export const WEBHOOK_URL = "https://YOUR_N8N_DOMAIN/webhook/max-dental-intake"; // TODO: Change this to your actual n8n webhook URL

export async function postIntake(payload: IntakePayload){
  const res = await fetch(WEBHOOK_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error("Webhook error");
  return res.json().catch(()=> ({}));
}
