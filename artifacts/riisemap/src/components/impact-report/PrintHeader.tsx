import { format } from 'date-fns';

interface PrintHeaderProps {
  fundingSourceName?: string;
}

export function PrintHeader({ fundingSourceName }: PrintHeaderProps) {
  const generationDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="hidden print:block mb-6">
      <h1 className="text-2xl font-bold">Funding Impact Report</h1>
      <p className="text-sm text-gray-600">{generationDate}</p>
      {fundingSourceName && (
        <p className="text-sm text-gray-600">{fundingSourceName}</p>
      )}
    </div>
  );
}
