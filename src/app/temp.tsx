export default function TempComponent() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold" style={{ color: "#ffffff" }}>
        Custom White Text
      </h1>
      <p className="mb-4" style={{ color: "#000000" }}>
        This is a test component to debug styling issues.
      </p>

      <div
        className="p-2 my-2"
        style={{ background: "#4A6BB1", color: "#ffffff" }}
      >
        Primary Background with White Text (using inline styles)
      </div>

      <div className="p-2 my-2 bg-[#4A6BB1]" style={{ color: "#ffffff" }}>
        Primary Background with White Text (using Tailwind + inline)
      </div>
    </div>
  );
}
