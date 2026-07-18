import { useCheckout } from '../CheckoutContext'
import { PriceTag } from './PriceTag'
import { Coin, Lock } from './Icons'
import { brl } from '../lib/format'

// Resumo do pedido sempre visível no desktop (coluna lateral).
export function OrderAside() {
  const { items, totals, coupon, payment } = useCheckout()

  return (
    <aside className="aside">
      <div className="aside-card">
        <h2 className="aside-title">Resumo do pedido</h2>

        <div className="aside-items">
          {items.map((it) => (
            <div className="aside-item" key={it.id}>
              <img className="aside-thumb" src={it.image} alt="" />
              <div className="aside-item-info">
                <span className="aside-item-name">{it.name}</span>
                <span className="aside-item-qty">Qtd: {it.qty}</span>
              </div>
              <span className="aside-item-price">{brl(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        <div className="aside-rows">
          <div className="aside-row">
            <span>Produtos</span>
            <span>{brl(totals.productsTotal)}</span>
          </div>
          {totals.warrantyTotal > 0 && (
            <div className="aside-row">
              <span>Garantia estendida</span>
              <span>{brl(totals.warrantyTotal)}</span>
            </div>
          )}
          {coupon && (
            <div className="aside-row save">
              <span>Cupom {coupon.code}</span>
              <span>-{brl(totals.couponDiscount)}</span>
            </div>
          )}
          <div className="aside-row">
            <span>Frete</span>
            <span>
              {totals.shippingCost === 0 ? 'Grátis' : brl(totals.shippingCost)}
            </span>
          </div>
          {totals.pixSavings > 0 && (
            <div className="aside-row save">
              <span>Desconto PIX</span>
              <span>-{brl(totals.pixSavings)}</span>
            </div>
          )}
        </div>

        <div className="aside-total">
          <span>{payment === 'pix' ? 'Total no PIX' : 'Total'}</span>
          <PriceTag cents={totals.total} size="lg" />
        </div>

        <div className="aside-cashback">
          <Coin width={16} height={16} />
          Você ganha <b>{brl(totals.cashback)}</b> de cashback
        </div>

        <div className="aside-secure">
          <Lock width={14} height={14} />
          Pagamento 100% seguro · dados criptografados
        </div>
      </div>
    </aside>
  )
}
