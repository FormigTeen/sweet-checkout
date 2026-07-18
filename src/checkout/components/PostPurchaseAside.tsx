import { ArrowRight, Coin } from './Icons'
import { brl } from '../lib/format'
import { airfryerArt, blenderArt, kettleArt } from '../lib/productArt'

const recommendations = [
  {
    name: 'Cafeteira Elétrica 15 Xícaras Agratto',
    tag: 'Cozinha',
    price: 7990,
    image: kettleArt,
  },
  {
    name: 'Jogo de Copos Nadir Lights com 6 peças',
    tag: 'Mesa posta',
    price: 2499,
    image: blenderArt,
  },
  {
    name: 'Air Fryer 3.5L Kian Preta',
    tag: 'Eletroportáteis',
    price: 15990,
    image: airfryerArt,
  },
]

export function PostPurchaseAside() {
  return (
    <aside className="aside post-aside">
      <div className="post-card">
        <div className="post-head">
          <span className="post-eyebrow">Continue comprando</span>
          <h2>Produtos que combinam com seu pedido</h2>
        </div>

        <div className="post-list">
          {recommendations.map((item) => (
            <a
              className="post-product"
              href="https://www.lebiscuit.com.br/ofertas/renove-e-organize"
              target="_blank"
              rel="noreferrer"
              key={item.name}
            >
              <img src={item.image} alt="" />
              <span className="post-product-main">
                <span className="post-tag">{item.tag}</span>
                <b>{item.name}</b>
                <span>{brl(item.price)} no PIX</span>
              </span>
              <span className="post-arrow" aria-hidden>
                <ArrowRight width={16} height={16} />
              </span>
            </a>
          ))}
        </div>

        <a
          className="post-link"
          href="https://www.lebiscuit.com.br/ofertas/renove-e-organize"
          target="_blank"
          rel="noreferrer"
        >
          <Coin width={15} height={15} />
          Ver mais ofertas
        </a>
      </div>
    </aside>
  )
}
