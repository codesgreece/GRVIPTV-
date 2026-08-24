export default function AccountTokenNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">GRVIP OTT</p>
        <h1 className="mt-3 font-display text-3xl font-black text-white">Η σελίδα δεν βρέθηκε</h1>
        <p className="mt-3 max-w-md text-sm text-text-muted">
          Ο σύνδεσμος δεν είναι έγκυρος ή έχει αντικατασταθεί.
        </p>
      </div>
    </div>
  );
}
