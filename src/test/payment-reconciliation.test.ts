import {afterEach,beforeEach,it,expect,vi} from 'vitest';
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{}}));
import {inspectOrder} from '@/lib/payment-reconciliation.server';
const order={id:'c0926b93-0e33-4e68-962e-676c417355b4',amount:349990,currency:'CLP',mp_preference_id:'pref',product_id:'educommerce-plus-vip'};
beforeEach(()=>vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN','synthetic-unit-test-token'));
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs()});
it('does not attribute missing approved payments',async()=>{const fetch=vi.fn().mockResolvedValue(Response.json({results:[],paging:{total:0}}));vi.stubGlobal('fetch',fetch);expect((await inspectOrder(order)).status).toBe('pending');expect(fetch).toHaveBeenCalledTimes(1)});
it('blocks duplicate approved payments before conversion',async()=>{const fetch=vi.fn().mockResolvedValue(Response.json({results:[{id:'1',external_reference:order.id,status:'approved'},{id:'2',external_reference:order.id,status:'approved'}],paging:{total:2}}));vi.stubGlobal('fetch',fetch);expect((await inspectOrder(order)).reason).toBe('multiple_payments');expect(fetch).toHaveBeenCalledTimes(1)});
it('limits candidate search to ten results and blocks overflow',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({paging:{total:11},results:[]})));expect((await inspectOrder(order)).reason).toBe('too_many_candidates')});
it('confirms an accredited exact productive purchase through its preference',async()=>{vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
 if(url.includes('/search?'))return Response.json({paging:{total:1},results:[{id:'123',external_reference:order.id,status:'approved'}]});
 if(url.includes('/v1/payments/'))return Response.json({id:'123',status:'approved',status_detail:'accredited',external_reference:order.id,transaction_amount:349990,currency_id:'CLP',collector_id:'2642590837',date_approved:'2026-10-26T20:27:29Z',refunds:[],transaction_amount_refunded:0,order:{id:'987',type:'mercadopago'},metadata:{order_id:order.id,product_id:order.product_id}});
 if(url.includes('/merchant_orders/'))return Response.json({id:'987',preference_id:'pref',external_reference:order.id,collector:{id:'2642590837'},payments:[{id:'123'}]});
 if(url.includes('/checkout/preferences/'))return Response.json({id:'pref',client_id:'6428800267243215',collector_id:'2642590837',external_reference:order.id,items:[{id:order.product_id,quantity:1,unit_price:349990,currency_id:'CLP'}]});
 return Response.json({id:'2642590837',tags:['normal']});
}));expect(await inspectOrder(order)).toMatchObject({status:'verified',paymentId:'123',approvedAt:'2026-10-26T20:27:29Z'})});
