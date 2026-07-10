export default function StudentHelp() {
  return (
    <div>
      <h2>Help</h2>
      <p className="text-muted" style={{ marginTop: 4, marginBottom: 24 }}>
        A quick guide to using your dashboard.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Overview</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Shows a summary of your overall attendance percentage and overall marks percentage.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">My Attendance</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          Shows your full attendance history, including the date, time, and status (Present, Late, or Absent) for each day.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          If your attendance falls below 75%, you'll see a reminder on the Overview page.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">My Marks</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Shows your results for each subject and exam, along with your overall percentage.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">Account</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          Use <strong>Remember Me</strong> at login to stay signed in on this device, so you don't need to log in every time.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          If you forget your password, ask your admin to reset it for you.
        </p>
      </div>
    </div>
  );
}
