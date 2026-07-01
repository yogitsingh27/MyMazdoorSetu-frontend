import { useState } from 'react';
import Icon from '@/components/common/Icon';

export default function FaqAccordion({ items }) {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div className={`faq-item${isOpen ? ' open' : ''}`} key={item.q}>
            <button type="button" className="faq-q" onClick={() => setOpenIdx(isOpen ? -1 : i)} aria-expanded={isOpen}>
              {item.q}
              <span className="faq-chevron"><Icon name="arrow" size={14} /></span>
            </button>
            {isOpen && <p className="faq-a">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
