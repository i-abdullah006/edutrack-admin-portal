export default function AdminHelp() {
  return (
    <div>
      <h2>Help</h2>
      <p className="text-muted" style={{ marginTop: 4, marginBottom: 24 }}>
        A quick guide to using each part of the admin dashboard.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Getting Started</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          1. Go to <strong>Settings</strong> first and set your Secret Password and curriculum pattern.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          2. Go to the <strong>Students</strong> tab and add your students.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          3. Go to the <strong>Attendance</strong> tab to mark today's attendance.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Students</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          When adding a student, you'll enter their name, father's name, contact number, and class/stream/subjects. A photo and fingerprint enrollment are both optional and can be added later from Edit.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          Roll numbers are assigned automatically and always stay sequential (1 to N, no gaps). If a student is removed, the student with the highest roll number takes the freed slot - their username and password never change.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          You can view or hide any student's password anytime using the Show/Hide button in the table. If two students share the same name, the father's name is shown underneath to tell them apart.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          <strong>Edit</strong> updates a student's name, father's name, contact, or photo - saving generates a new username and password.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          <strong>Remove</strong> permanently deletes the student's account along with all their attendance and marks history. You'll be asked to confirm this twice, since it cannot be undone.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Attendance</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          Choose Manual, Face, or Fingerprint for each session - you can switch methods any day.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          <strong>Face:</strong> the camera scans each student against their stored photo. If no confident match is found, you'll be asked to mark that student manually.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          <strong>Fingerprint:</strong> select the student first, then have them confirm on this device's fingerprint sensor. If it fails, mark manually instead.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          Present/Late is calculated automatically based on your Settings.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Marks</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Select a student and an exam type, then enter marks for one subject at a time. You're never required to fill in every subject at once - come back anytime to add more, or use Edit to update marks already saved.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">Settings</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          <strong>Class Start Time</strong> and <strong>Late Cutoff</strong> can be changed anytime - this only affects attendance marked after the change.
        </p>
        <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>
          The <strong>curriculum pattern</strong> setting controls whether Islamiat and Pakistan Studies appear as one combined subject per class or as two separate subjects - this affects newly added students.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          Your <strong>Secret Password</strong> is required to change your admin login password. Set it once, and keep it different from your login password.
        </p>
      </div>
    </div>
  );
}
