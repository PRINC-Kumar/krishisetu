import { Link } from "react-router-dom";
export default function NotAuthorized() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-heading text-5xl text-leaf">403</h1>
      <p className="mt-3 text-soil">
        This area is not available for your current role.
      </p>
      <Link
        className="mt-6 inline-block rounded-2xl bg-leaf px-5 py-3 font-semibold text-white"
        to="/login"
      >
        Go to login
      </Link>
    </section>
  );
}
