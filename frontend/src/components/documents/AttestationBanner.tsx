export const AttestationBanner = ({ docId, onAttest }: { docId: number; onAttest: (id: number) => void }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex justify-between items-center">
    <p className="text-sm text-yellow-800">Please confirm you have read this policy.</p>
    <button onClick={() => onAttest(docId)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">I Acknowledge</button>
  </div>
);
