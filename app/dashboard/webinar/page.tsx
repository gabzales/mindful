import { WebinarList } from "./WebinarList";

export default function WebinarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Webinar & Training
        </h1>
        <p className="mt-1 text-ink-soft">
          Daftar untuk sesi mendatang dan dapatkan sertifikat setelah selesai.
        </p>
      </div>
      <WebinarList />
    </div>
  );
}
