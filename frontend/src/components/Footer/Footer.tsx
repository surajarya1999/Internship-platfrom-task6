export default function Footer() {
  return (
    <footer className="bg-[#111118] border-t border-indigo-500/15 px-5 py-6 text-center mt-16">
      <p className="text-sm font-extrabold text-indigo-400 mb-1">💼 InternshipHub</p>
      <p className="text-xs text-slate-500">© {new Date().getFullYear()} InternshipHub · All rights reserved</p>
    </footer>
  );
}
