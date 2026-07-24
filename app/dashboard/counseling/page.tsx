import { BookingFlow } from "./BookingFlow";

export default function CounselingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Booking Konseling
        </h1>
        <p className="mt-1 text-ink-soft">
          Jadwalkan sesi 1-on-1 dengan psikolog terpilih.
        </p>
      </div>
      <BookingFlow />
    </div>
  );
}
