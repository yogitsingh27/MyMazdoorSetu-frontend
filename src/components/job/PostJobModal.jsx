import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { JobService } from '@/services';
import { TRADES } from '@/data/companies';
import { jobErrorMessage } from '@/pages/shared/jobErrors';

// Client-side validation mirrors the backend (see docs/FRONTEND_WRITE_INTEGRATION.md,
// Phase 4). The server remains authoritative; this is for immediate feedback.
const LIMITS = { title: 160, wage: 60, location: 200, duration: 40, description: 2000 };

export default function PostJobModal({ onClose, onPosted, postedAsRole }) {
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState(TRADES[0]);
  const [wage, setWage] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [openings, setOpenings] = useState(1);
  const [direct, setDirect] = useState(true);
  const [meals, setMeals] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const validate = () => {
    const fields = { title, wage, location, duration, description };
    for (const [key, val] of Object.entries(fields)) {
      if (!val.trim()) return 'Please fill in all fields.';
      if (val.length > LIMITS[key]) return `${key[0].toUpperCase() + key.slice(1)} is too long.`;
    }
    if (!Number.isInteger(Number(openings)) || Number(openings) < 1) return 'Openings must be at least 1.';
    return '';
  };

  const publish = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setError(problem); return; }
    setError('');
    setBusy(true);
    try {
      // Toggles are surfaced as job tags (facilities), matching Job Detail's tag list.
      const tags = [direct && 'Direct contact', meals && 'Meals'].filter(Boolean);
      await JobService.create({
        title: title.trim(),
        trade,
        wage: wage.trim(),
        location: location.trim(),
        duration: duration.trim(),
        description: description.trim(),
        openings: Number(openings),
        postedAsRole,
        tags,
        requirements: [],
      });
      toast('Job published — workers matching the role will see it now');
      onPosted?.();
      onClose();
    } catch (err) {
      setError(jobErrorMessage(err)); // keep the modal open so the user can correct/retry
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Post a job</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={publish}>
          <div className="form-grid">
            <div className="field full">
              <label>Job title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wall plastering, 2BHK flat" />
            </div>
            <div className="field">
              <label>Trade</label>
              <select value={trade} onChange={(e) => setTrade(e.target.value)}>{TRADES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field">
              <label>Wage</label>
              <input value={wage} onChange={(e) => setWage(e.target.value)} placeholder="₹700–900/day" />
            </div>
            <div className="field">
              <label>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Area, city" />
            </div>
            <div className="field">
              <label>Duration</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="5 days" />
            </div>
            <div className="field">
              <label>Openings</label>
              <input type="number" min="1" value={openings} onChange={(e) => setOpenings(e.target.value)} />
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What the work involves, timings, site details…" />
            </div>
          </div>

          <div className="toggle-row">
            <div><div className="tlabel">Allow direct contact</div><div className="thint">Workers can call you directly instead of only messaging in-app</div></div>
            <button type="button" className={`switch ${direct ? 'on' : ''}`} onClick={() => setDirect(!direct)} />
          </div>
          <div className="toggle-row">
            <div><div className="tlabel">Meals included</div><div className="thint">Shown as a tag on the job listing</div></div>
            <button type="button" className={`switch ${meals ? 'on' : ''}`} onClick={() => setMeals(!meals)} />
          </div>

          {error && <p style={{ color: 'var(--rose)', fontSize: 13, marginTop: 10 }}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>
            {busy ? 'Publishing…' : 'Publish job'}
          </button>
        </form>
      </div>
    </div>
  );
}
