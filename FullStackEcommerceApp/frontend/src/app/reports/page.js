import ReportsTable from '../../components/ReportsTable';

async function fetchReports() {
  const res = await fetch('http://localhost:5000/api/reports', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export default async function ReportsPage() {
  const reports = await fetchReports();

  return (
    <>
      <h1>Reports</h1>
      <ReportsTable reports={reports} />
    </>
  );
}
