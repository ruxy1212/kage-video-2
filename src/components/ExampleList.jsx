import { EXAMPLES } from "../lib/constants";

export default function ExampleList({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center">
      {EXAMPLES.map((ex) => (
        <button
          key={ex}
          className="text-xs py-1.25 px-3 border border-[#2a2a3e] rounded-full bg-transparent text-[#666688] cursor-pointer transition-colors duration-150 hover:border-[#444460] hover:text-[#aaaacc]"
          onClick={() => onSelect(ex)}
        >
          {ex}
        </button>
      ))}
    </div>
  );
}