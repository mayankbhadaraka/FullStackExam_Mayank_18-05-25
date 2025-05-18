export default function ReportsTable({ reports }) {
  if (!reports.length) return <p>No reports found.</p>;

  return (
    <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>User</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => (
          <tr key={report._id}>
            <td>{report._id}</td>
            <td>{report.user?.username || 'N/A'}</td>
            <td>${report.total.toFixed(2)}</td>
            <td>{report.status}</td>
            <td>{new Date(report.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
