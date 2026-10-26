import { describe,it,expect } from 'vitest';
import { verifyPayment,verifyAssociation,purchaseEventId, type Payment } from '@/lib/payment-verification';
const order={id:'c0926b93-0e33-4e68-962e-676c417355b4',amount:349990,currency:'CLP',mp_preference_id:'pref',product_id:'educommerce-plus-vip'};
const p:Payment={id:'123',status:'approved',status_detail:'accredited',external_reference:order.id,currency_id:'CLP',transaction_amount:349990,collector_id:'2642590837',date_approved:new Date().toISOString(),transaction_amount_refunded:0,refunds:[],order:{id:'987',type:'mercadopago'},metadata:{order_id:order.id,product_id:order.product_id}};
describe('independent payment rules',()=>{
 it('requires approved',()=>expect(verifyPayment({...p,status:'pending'},order)).toBe('not_accredited'));
 it('requires accredited',()=>expect(verifyPayment({...p,status_detail:'pending'},order)).toBe('not_accredited'));
 it('requires exact UUID',()=>expect(verifyPayment({...p,external_reference:'other'},order)).toBe('reference_mismatch'));
 it('requires CLP',()=>expect(verifyPayment({...p,currency_id:'USD'},order)).toBe('currency_mismatch'));
 it('rejects even overpayment',()=>expect(verifyPayment({...p,transaction_amount:350000},order)).toBe('amount_mismatch'));
 it('rejects fictitious seller',()=>expect(verifyPayment({...p,collector_id:'3762626205'},order)).toBe('seller_mismatch'));
 it('rejects refund',()=>expect(verifyPayment({...p,transaction_amount_refunded:1000},order)).toBe('refund_present'));
 it('rejects wrong metadata',()=>expect(verifyPayment({...p,metadata:{}},order)).toBe('metadata_mismatch'));
 it('accepts verified core values',()=>expect(verifyPayment(p,order)).toBeNull());
 it('rejects test application association',()=>expect(verifyAssociation(p,order,{id:'987',preference_id:'pref',external_reference:order.id,collector:{id:'2642590837'},payments:[{id:'123'}]},{id:'pref',client_id:'3457752278222975',collector_id:'2642590837',external_reference:order.id,items:[{id:order.product_id,currency_id:'CLP',quantity:1,unit_price:349990}]})).toBe(false));
 it('uses stable order event ID',()=>expect(purchaseEventId(order.id)).toBe('educommerce-purchase-c0926b93-0e33-4e68-962e-676c417355b4'));
});
