export function Skel({ w, h = 12, r = 6, style = {} }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function PageSkeleton({ stats = true, table = false }) {
  return (
    <div>
      <div className="page-head">
        <div>
          <Skel w={200} h={22} />
          <div style={{ height: 10 }} />
          <Skel w={300} h={13} />
        </div>
      </div>
      {stats && (
        <div className="stat-row">
          {[0, 1, 2, 3].map((i) => (
            <div className="skel-card" key={i}>
              <Skel w={64} h={26} />
              <div style={{ height: 10 }} />
              <Skel w={90} h={11} />
            </div>
          ))}
        </div>
      )}
      {table ? (
        <div className="card">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <Skel w={26} h={26} r={13} />
              <Skel w={`${30 + (i % 3) * 12}%`} h={13} />
              <Skel w={70} h={13} style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[0, 1].map((c) => (
            <div className="card" key={c}>
              <Skel w={120} h={15} />
              <div style={{ height: 16 }} />
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <Skel w={`${50 + i * 8}%`} h={13} />
                    <div style={{ height: 8 }} />
                    <Skel w={80} h={11} />
                  </div>
                  <Skel w={50} h={11} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
