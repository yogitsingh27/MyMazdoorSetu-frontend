import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { JobService } from '@/services';
import { TRADES } from '@/data/companies';

export default function PostJobModal({ onClose, onPosted }) {
  const [direct, setDirect] = useState(true);
  const [meals, setMeals] = useState(false);
  const toast = useToast();

  const publish = async (e) => {
    e.preventDefault();
    await JobService.create({ title: 'New job posting', trade: TRADES[0], tags: [] });
    toast('Job published — workers matching the role will see it now');
    onPosted?.();
    onClose();
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
              <input placeholder="e.g. Wall plastering, 2BHK flat" />
            </div>
            <div className="field">
              <label>Trade</label>
              <select>{TRADES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field">
              <label>Wage</label>
              <input placeholder="₹700–900/day" />
            </div>
            <div className="field">
              <label>Location</label>
              <input placeholder="Area, city" />
            </div>
            <div className="field">
              <label>Duration</label>
              <input placeholder="5 days" />
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

          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>Publish job</button>
        </form>
      </div>
    </div>
  );
}
