import { useState } from 'react';
import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { useToast } from '@/contexts/ToastContext';
import { ReviewService } from '@/services';

export function avgOverall(reviews) {
  if (!reviews.length) return 0;
  return reviews.reduce((a, r) => a + r.overall, 0) / reviews.length;
}

export function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-head">
        <div className="id-chip">
          <span className="av">{review.by[0]}</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{review.by}</div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{review.role} · {review.date}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <Stars value={review.overall} size={13} />
          {review.verified ? (
            <span className="verified-badge"><Icon name="check" size={10} /> Verified · {review.job}</span>
          ) : (
            <span className="unverified-badge">Unverified</span>
          )}
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{review.comment}</p>
      <div className="review-cats">
        {Object.entries(review.cats).map(([k, v]) => (
          <span className="review-cat" key={k}>{k}: <b>{v}.0</b></span>
        ))}
      </div>
    </div>
  );
}

export function RatingBars({ reviews, categories }) {
  const avg = (cat) => {
    const vals = reviews.map((r) => r.cats[cat]).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  return (
    <div className="rating-bars">
      {categories.map((cat) => (
        <div className="rating-bar-row" key={cat}>
          <span style={{ width: 140, flexShrink: 0 }}>{cat}</span>
          <div className="rating-bar-track"><div className="rating-bar-fill" style={{ width: `${(avg(cat) / 5) * 100}%` }} /></div>
          <span style={{ width: 28, textAlign: 'right', fontWeight: 600, color: 'var(--navy)' }}>{avg(cat).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

const STAR_PATH = 'M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.7l-5.2 2.9 1-5.8L1.5 7.7l5.9-.8z';

export function ReviewModal({ onClose, subjectName, categories }) {
  const [scores, setScores] = useState(Object.fromEntries(categories.map((c) => [c, 5])));
  const [linkJob, setLinkJob] = useState(true);
  const toast = useToast();
  const overall = (Object.values(scores).reduce((a, b) => a + b, 0) / categories.length).toFixed(1);

  const submit = async () => {
    await ReviewService.submit({ subjectName, scores });
    toast(`Review submitted for ${subjectName}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Rate {subjectName}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Overall</span>
          <Stars value={parseFloat(overall)} size={16} />
          <span className="rating-score">{overall}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {categories.map((cat) => (
            <div className="cat-input-row" key={cat}>
              <span style={{ fontSize: 14 }}>{cat}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="cat-star" role="button" tabIndex={0} aria-label={`${cat}: ${n} of 5`}
                    style={{ display: 'inline-flex', cursor: 'pointer' }}
                    onClick={() => setScores({ ...scores, [cat]: n })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setScores({ ...scores, [cat]: n }); } }}>
                    <svg width="22" height="22" viewBox="0 0 20 20">
                      <path d={STAR_PATH} fill={n <= scores[cat] ? 'var(--amber)' : 'var(--border-strong)'} />
                    </svg>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="field full" style={{ marginTop: 14 }}>
          <label>Comment</label>
          <textarea rows="3" placeholder="How was the work, payment, or site conditions?" />
        </div>
        <div className="toggle-row">
          <div>
            <div className="tlabel">Link to a job</div>
            <div className="thint">Adds a "Verified" badge — pick the job this review is about</div>
          </div>
          <button className={`switch ${linkJob ? 'on' : ''}`} onClick={() => setLinkJob(!linkJob)} />
        </div>
        {linkJob && (
          <div className="field full" style={{ marginTop: 8 }}>
            <select><option>JOB-2291 · Wall plastering, 2BHK flat</option><option>JOB-2204 · Tile fitting, bathroom</option></select>
          </div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={submit}>Submit review</button>
      </div>
    </div>
  );
}

export function ReviewsPanel({ reviews, categories }) {
  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>Rating breakdown</div>
        <RatingBars reviews={reviews} categories={categories} />
      </div>
      <div>{reviews.map((r) => <ReviewCard review={r} key={r.id} />)}</div>
    </>
  );
}
