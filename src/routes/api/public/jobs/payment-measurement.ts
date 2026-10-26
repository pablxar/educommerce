import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { z } from 'zod';
export const Route = createFileRoute('/api/public/jobs/payment-measurement')({server:{handlers:{POST:async({request})=>{
  const failure=await authenticateCronRequest(request); if(failure)return failure;
  const parsed=z.object({dryRun:z.boolean().default(true),orderId:z.string().uuid().optional(),testMeta:z.boolean().default(false)}).strict().safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return new Response('Invalid request',{status:400});
  if(parsed.data.testMeta){const {sendIsolatedMetaTest}=await import('@/lib/meta-purchase.server');return Response.json(await sendIsolatedMetaTest());}
  const {reconcilePayments}=await import('@/lib/payment-reconciliation.server');
  return Response.json({ok:true,results:await reconcilePayments(parsed.data.orderId,parsed.data.dryRun)});
}}}});
